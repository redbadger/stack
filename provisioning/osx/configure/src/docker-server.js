import Bluebird from 'bluebird';
import Docker from 'dockerode';
import DockerMachine from 'docker-machine';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import R from 'ramda';
import splitca from 'split-ca';

const dockerEnv = Bluebird.promisify(DockerMachine.env);

export const getEnv = manager =>
  (manager
    ? dockerEnv(manager, { parse: true })
    : {
      DOCKER_TLS_VERIFY: null,
      DOCKER_HOST: null,
      DOCKER_CERT_PATH: null,
      DOCKER_MACHINE_NAME: null,
    });

export const buildEnv = (processEnv, dockerServerEnv) =>
  R.reject(R.isNil, { ...processEnv, ...dockerServerEnv });

export const exec = (env, cmd, args, showStdout, showStderr) => {
  const env1 = buildEnv(process.env, env);
  const cp = execa(cmd, args, { env: env1, extendEnv: false });
  if (showStdout) cp.stdout.pipe(process.stdout);
  if (showStderr) cp.stderr.pipe(process.stderr);
  return cp;
};

export const getDocker = env => {
  const opts = {};

  const split = /(?:tcp:\/\/)?(.*?):([0-9]+)/g.exec(env.DOCKER_HOST);
  if (!split || split.length !== 3) {
    throw new Error('DOCKER_HOST env variable should be something like tcp://localhost:1234');
  }

  [, opts.host, opts.port] = split;

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

  return new Docker(opts);
};
