// To use this function, create an Auto Scaling
// lifecycle hook on instance creation notifying a SNS topic, and
// subscribe the lambda function to the SNS topic.
// Sane values for Memory and Timeout are 128MB and 30s respectively.

/* eslint-disable no-console */

// eslint-disable-next-line import/no-extraneous-dependencies
import AWS from 'aws-sdk';
import R from 'ramda';

const ec2 = new AWS.EC2();
const as = new AWS.AutoScaling();
const route53 = new AWS.Route53();

const pluckIpAddress = R.path(['Reservations', '0', 'Instances', '0', 'PrivateIpAddress']);
const pluckMessage = R.path(['Records', '0', 'Sns', 'Message']);

const getIpAddress = async instanceId =>
  pluckIpAddress(await ec2.describeInstances({ InstanceIds: [instanceId] }).promise());

const updateDns = (action, hostedZoneId, instanceId, ipAddress) => {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: action,
          ResourceRecordSet: {
            MultiValueAnswer: true,
            Name: 'swarm.local',
            ResourceRecords: [{ Value: ipAddress }],
            SetIdentifier: `Swarm manager ${instanceId}`,
            TTL: 60,
            Type: 'A',
          },
        },
      ],
      Comment: 'swarm managers',
    },
    HostedZoneId: hostedZoneId,
  };
  return route53.changeResourceRecordSets(params).promise();
};

const completeAsLifecycleAction = async lifecycleParams => {
  // returns true on success or false on failure
  // notifies AutoScaling that it should either continue or abandon the instance
  try {
    const data = await as.completeLifecycleAction(lifecycleParams).promise();
    console.log(`INFO: CompleteLifecycleAction Successful.\nReported:\n${JSON.stringify(data)}`);
    return data;
  } catch (e) {
    console.log(`ERROR: AS lifecycle completion failed.\nDetails:\n${e}`);
    console.log(`DEBUG: CompleteLifecycleAction\nParams:\n${JSON.stringify(lifecycleParams)}`);
    return e;
  }
};

const handlerImpl = async notification => {
  console.log(`INFO: request Recieved.\nDetails:\n${JSON.stringify(notification)}`);
  const message = JSON.parse(pluckMessage(notification));
  console.log(`DEBUG: SNS message contents. \nMessage:\n${JSON.stringify(message)}`);
  const metadata = JSON.parse(message.NotificationMetadata);
  console.log(`DEBUG: \nMetadata:\n${JSON.stringify(metadata)}`);

  const lifecycleParams = {
    AutoScalingGroupName: message.AutoScalingGroupName,
    LifecycleHookName: message.LifecycleHookName,
    LifecycleActionToken: message.LifecycleActionToken,
  };

  try {
    const ipAddress = await getIpAddress(message.EC2InstanceId);
    console.log(`DEBUG: \nipAddress:\n${ipAddress}`);
    const response = await updateDns(
      metadata.action,
      metadata.hostedZoneId,
      message.EC2InstanceId,
      ipAddress,
    );
    console.log(`DEBUG: response:\n${JSON.stringify(response)}`);
    lifecycleParams.LifecycleActionResult = 'CONTINUE';
    console.log('INFO: Lambda function reporting success to AutoScaling');
  } catch (e) {
    lifecycleParams.LifecycleActionResult = 'ABANDON';
    console.log(`ERROR: Lambda function reporting failure to AutoScaling with error: ${e}`);
  }

  return completeAsLifecycleAction(lifecycleParams);
};

export const handler = (notification, context, callback) => {
  handlerImpl(notification).then(x => callback(null, x), callback);
};
