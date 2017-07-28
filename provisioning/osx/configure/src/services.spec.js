import { expect } from 'chai';
import { findWithPublishedPorts } from './services';

describe('services', () => {
  it('should find public services', () => {
    const services = [
      {
        ID: '14grfo1mbeno4tsxspfmxy84p',
        Version: { Index: 1037 },
        CreatedAt: '2017-07-20T13:02:43.967715338Z',
        UpdatedAt: '2017-07-20T13:02:43.969316219Z',
        Spec: {
          Name: 'services_visualizer',
          Labels: {
            'com.docker.stack.image': 'charypar/swarm-dashboard:latest',
            'com.docker.stack.namespace': 'services',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'charypar/swarm-dashboard:latest@sha256:43e8e22732b1bcd9654b8672bb3e57e21c5a22f695bd8b8e65df14cdbe933528',
              Labels: { 'com.docker.stack.namespace': 'services' },
              Env: ['PORT=3000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
              Mounts: [
                {
                  Type: 'bind',
                  Source: '/var/run/docker.sock',
                  Target: '/var/run/docker.sock',
                },
              ],
            },
            Resources: {},
            RestartPolicy: { Condition: 'on-failure', MaxAttempts: 0 },
            Placement: {
              Constraints: ['node.role == manager'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [{ Target: 'sgxihewf68xh8pggc44snqkey', Aliases: ['visualizer'] }],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 1 } },
          EndpointSpec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 3000,
                PublishedPort: 8000,
                PublishMode: 'ingress',
              },
            ],
          },
        },
        Endpoint: {
          Spec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 3000,
                PublishedPort: 8000,
                PublishMode: 'ingress',
              },
            ],
          },
          Ports: [
            {
              Protocol: 'tcp',
              TargetPort: 3000,
              PublishedPort: 8000,
              PublishMode: 'ingress',
            },
          ],
          VirtualIPs: [
            { NetworkID: 'rqhyz2zmtmiz129akzfpb8u8m', Addr: '10.255.0.8/16' },
            { NetworkID: 'sgxihewf68xh8pggc44snqkey', Addr: '10.0.1.2/24' },
          ],
        },
      },
      {
        ID: '2vw9i2viun7rv274jo25o4lzb',
        Version: { Index: 1053 },
        CreatedAt: '2017-07-20T13:09:14.303570219Z',
        UpdatedAt: '2017-07-20T13:09:14.304156653Z',
        Spec: {
          Name: 'app_rproxy',
          Labels: {
            'com.docker.stack.image': 'localhost:5000/app_rproxy',
            'com.docker.stack.namespace': 'app',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'localhost:5000/app_rproxy:latest@sha256:961321670c35519992017eaba8857ebdf9d1be8cda7d7d502b088575ffc8783a',
              Labels: { 'com.docker.stack.namespace': 'app' },
              Env: ['API_HOST=gateway:3000', 'PORT=3000', 'WEB_HOST=web:3000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
            },
            Resources: {},
            RestartPolicy: { Condition: 'on-failure', MaxAttempts: 0 },
            Placement: {
              Constraints: ['node.role == worker'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [{ Target: 'k8kd7mjwinx2kzquki19ref1c', Aliases: ['rproxy'] }],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 3 } },
          UpdateConfig: {
            Parallelism: 1,
            Delay: 2000000000,
            FailureAction: 'pause',
            MaxFailureRatio: 0,
            Order: 'stop-first',
          },
          EndpointSpec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 3000,
                PublishedPort: 8001,
                PublishMode: 'ingress',
              },
            ],
          },
        },
        Endpoint: {
          Spec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 3000,
                PublishedPort: 8001,
                PublishMode: 'ingress',
              },
            ],
          },
          Ports: [
            {
              Protocol: 'tcp',
              TargetPort: 3000,
              PublishedPort: 8001,
              PublishMode: 'ingress',
            },
          ],
          VirtualIPs: [
            { NetworkID: 'rqhyz2zmtmiz129akzfpb8u8m', Addr: '10.255.0.10/16' },
            { NetworkID: 'k8kd7mjwinx2kzquki19ref1c', Addr: '192.168.31.6/24' },
          ],
        },
      },
      {
        ID: 'caj6kqaottahrrfpkd5ezp3jj',
        Version: { Index: 29 },
        CreatedAt: '2017-07-18T13:38:38.298341959Z',
        UpdatedAt: '2017-07-18T13:38:38.298992516Z',
        Spec: {
          Name: 'swarm_registry_ambassador',
          Labels: {
            'com.docker.stack.image': 'svendowideit/ambassador',
            'com.docker.stack.namespace': 'swarm',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'svendowideit/ambassador:latest@sha256:bb60fceae45493a7ce17c19958a38caf8d5b6869958fc9c7f78885c75f1881cf',
              Labels: { 'com.docker.stack.namespace': 'swarm' },
              Env: ['DOCKER_PORT_5000_TCP=tcp://10.0.2.2:5000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
            },
            Resources: {},
            Placement: {
              Constraints: ['node.role == manager'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [
              {
                Target: 'ul1oczuiet0oykyxgo4xbp3u9',
                Aliases: ['registry_ambassador'],
              },
            ],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 1 } },
          EndpointSpec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 5000,
                PublishedPort: 5000,
                PublishMode: 'ingress',
              },
            ],
          },
        },
        Endpoint: {
          Spec: {
            Mode: 'vip',
            Ports: [
              {
                Protocol: 'tcp',
                TargetPort: 5000,
                PublishedPort: 5000,
                PublishMode: 'ingress',
              },
            ],
          },
          Ports: [
            {
              Protocol: 'tcp',
              TargetPort: 5000,
              PublishedPort: 5000,
              PublishMode: 'ingress',
            },
          ],
          VirtualIPs: [
            { NetworkID: 'rqhyz2zmtmiz129akzfpb8u8m', Addr: '10.255.0.6/16' },
            { NetworkID: 'ul1oczuiet0oykyxgo4xbp3u9', Addr: '10.0.0.2/24' },
          ],
        },
      },
      {
        ID: 'lsa7bp80iu4ux43i3mk5wo7wd',
        Version: { Index: 1059 },
        CreatedAt: '2017-07-20T13:09:14.377785279Z',
        UpdatedAt: '2017-07-20T13:09:14.379609639Z',
        Spec: {
          Name: 'app_web',
          Labels: {
            'com.docker.stack.image': 'localhost:5000/web',
            'com.docker.stack.namespace': 'app',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'localhost:5000/web:latest@sha256:dde7d576282758e76adfee4edc1f895ae3f751cae9c7f2165098b40538c391ae',
              Labels: { 'com.docker.stack.namespace': 'app' },
              Env: ['API_HOST=gateway:3000', 'PORT=3000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
            },
            Resources: {},
            RestartPolicy: { Condition: 'on-failure', MaxAttempts: 0 },
            Placement: {
              Constraints: ['node.role == worker'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [{ Target: 'k8kd7mjwinx2kzquki19ref1c', Aliases: ['web'] }],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 3 } },
          UpdateConfig: {
            Parallelism: 1,
            Delay: 2000000000,
            FailureAction: 'pause',
            MaxFailureRatio: 0,
            Order: 'stop-first',
          },
          EndpointSpec: { Mode: 'vip' },
        },
        Endpoint: {
          Spec: { Mode: 'vip' },
          VirtualIPs: [
            {
              NetworkID: 'k8kd7mjwinx2kzquki19ref1c',
              Addr: '192.168.31.10/24',
            },
          ],
        },
      },
      {
        ID: 'o2bir5gicujsy0e2c38prqyix',
        Version: { Index: 1048 },
        CreatedAt: '2017-07-20T13:09:14.227106059Z',
        UpdatedAt: '2017-07-20T13:09:14.227639957Z',
        Spec: {
          Name: 'app_gateway',
          Labels: {
            'com.docker.stack.image': 'localhost:5000/proxy',
            'com.docker.stack.namespace': 'app',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'localhost:5000/proxy:latest@sha256:35966190ac3b4cfb758a4e12f7c25c547b4babb0e60994e6660207f080c7b81a',
              Labels: { 'com.docker.stack.namespace': 'app' },
              Env: ['API_HOST=api:3000', 'PORT=3000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
            },
            Resources: {},
            RestartPolicy: { Condition: 'on-failure', MaxAttempts: 0 },
            Placement: {
              Constraints: ['node.role == worker'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [
              { Target: 'k8kd7mjwinx2kzquki19ref1c', Aliases: ['gateway'] },
              { Target: 'ro66sxffzd428njh9s01rlahs', Aliases: ['gateway'] },
            ],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 3 } },
          UpdateConfig: {
            Parallelism: 1,
            Delay: 2000000000,
            FailureAction: 'pause',
            MaxFailureRatio: 0,
            Order: 'stop-first',
          },
          EndpointSpec: { Mode: 'vip' },
        },
        Endpoint: {
          Spec: { Mode: 'vip' },
          VirtualIPs: [
            { NetworkID: 'k8kd7mjwinx2kzquki19ref1c', Addr: '192.168.31.2/24' },
            { NetworkID: 'ro66sxffzd428njh9s01rlahs', Addr: '192.168.32.2/24' },
          ],
        },
      },
      {
        ID: 'wq58pqv0f5i61yc4nud1am09p',
        Version: { Index: 1064 },
        CreatedAt: '2017-07-20T13:09:14.453160073Z',
        UpdatedAt: '2017-07-20T13:09:14.456623928Z',
        Spec: {
          Name: 'app_api',
          Labels: {
            'com.docker.stack.image': 'localhost:5000/api',
            'com.docker.stack.namespace': 'app',
          },
          TaskTemplate: {
            ContainerSpec: {
              Image:
                'localhost:5000/api:latest@sha256:4089d1869f6ea1ee10b15bd3f509a3b1008b105dbee7f0d2a1c12eaa904817cb',
              Labels: { 'com.docker.stack.namespace': 'app' },
              Env: ['PORT=3000'],
              Privileges: { CredentialSpec: null, SELinuxContext: null },
              Secrets: [
                {
                  File: { Name: 'my_secret', UID: '0', GID: '0', Mode: 292 },
                  SecretID: 'vsjvhlaitn6fwn7v7epuaggzy',
                  SecretName: 'my_secret',
                },
              ],
            },
            Resources: {},
            RestartPolicy: { Condition: 'on-failure', MaxAttempts: 0 },
            Placement: {
              Constraints: ['node.role == worker'],
              Platforms: [{ Architecture: 'amd64', OS: 'linux' }],
            },
            Networks: [{ Target: 'ro66sxffzd428njh9s01rlahs', Aliases: ['api'] }],
            ForceUpdate: 0,
            Runtime: 'container',
          },
          Mode: { Replicated: { Replicas: 3 } },
          UpdateConfig: {
            Parallelism: 1,
            Delay: 5000000000,
            FailureAction: 'pause',
            MaxFailureRatio: 0,
            Order: 'stop-first',
          },
          EndpointSpec: { Mode: 'vip' },
        },
        Endpoint: {
          Spec: { Mode: 'vip' },
          VirtualIPs: [{ NetworkID: 'ro66sxffzd428njh9s01rlahs', Addr: '192.168.32.6/24' }],
        },
      },
    ];
    const expected = [
      { name: 'visualizer', stack: 'services', port: 8000 },
      { name: 'rproxy', stack: 'app', port: 8001 },
      { name: 'registry_ambassador', stack: 'swarm', port: 5000 },
    ];
    const actual = findWithPublishedPorts(services);
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });

  it('should still work even if the stackname has an underscore', () => {
    const services = [
      {
        Spec: {
          Name: 'my_stack_my_service',
          Labels: {
            'com.docker.stack.namespace': 'my_stack',
          },
        },
        Endpoint: {
          Ports: [
            {
              PublishedPort: 8000,
            },
          ],
        },
      },
    ];
    const expected = [{ name: 'my_service', stack: 'my_stack', port: 8000 }];
    const actual = findWithPublishedPorts(services);
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});
