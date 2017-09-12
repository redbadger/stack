import Bluebird from 'bluebird';
import Docker from 'dockerode';
import DockerMachine from 'docker-machine';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import splitca from 'split-ca';
import url from 'url';
import { isNil, reject } from 'ramda';

const dockerEnv = Bluebird.promisify(DockerMachine.env);
const stat = Bluebird.promisify(fs.stat);

export const getEnv = async (swarm = '/var/run/docker.sock') => {
  try {
    if ((await stat(swarm)).isSocket()) {
      return { DOCKER_HOST: `unix://${path.resolve(swarm)}` };
    }
  } catch (e) {
    // nothing to do
  }
  return dockerEnv(swarm, { parse: true });
};

export const buildEnv = (processEnv, dockerServerEnv) =>
  reject(isNil, { ...processEnv, ...dockerServerEnv });

export const exec = (env, cmd, args, showStdout, showStderr) => {
  const env1 = buildEnv(process.env, env);
  const cp = execa(cmd, args, { env: env1, extendEnv: false });
  if (showStdout) cp.stdout.pipe(process.stdout);
  if (showStderr) cp.stderr.pipe(process.stderr);
  return cp;
};

export const getDocker = env => {
  const opts = {};
  const host = url.parse(env.DOCKER_HOST);

  switch (host.protocol) {
    case 'unix:':
      opts.socketPath = host.pathname;
      break;
    case 'tcp:':
      opts.port = host.port;
      opts.host = host.hostname;

      if (env.DOCKER_TLS_VERIFY === '1' || opts.port === '2376') {
        opts.protocol = 'https';
      } else {
        opts.protocol = 'http';
      }

      if (env.DOCKER_CERT_PATH) {
        opts.ca = splitca(path.join(env.DOCKER_CERT_PATH, 'ca.pem'));
        opts.cert = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'cert.pem'));
        opts.key = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'key.pem'));
      }

      if (env.DOCKER_CLIENT_TIMEOUT) {
        opts.timeout = env.DOCKER_CLIENT_TIMEOUT;
      }
      break;
    default:
      throw new Error('DOCKER_HOST env variable should be something like tcp://10.0.1.1:2376 or unix:///var/run/docker.sock');
  }

  return new Docker(opts);
};
