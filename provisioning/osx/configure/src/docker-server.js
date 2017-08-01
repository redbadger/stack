import Bluebird from 'bluebird';
import DockerMachine from 'docker-machine';
import execa from 'execa';
import R from 'ramda';

const dockerEnv = Bluebird.promisify(DockerMachine.env);

export const getDockerServer = manager =>
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
