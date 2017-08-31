import R from 'ramda';

import { getDockerServer, exec } from './docker-server';

const stacksLens = R.lensProp('stacks');
const messageLens = R.lensProp('messages');

export const validate = (stacknames, stackconfig) =>
  R.reduce(
    (accumulator, name) =>
      (R.contains(name, R.pluck('name', stackconfig.stacks))
        ? R.over(stacksLens, a => [...a, name], accumulator)
        : R.over(
          messageLens,
          a => [...a, `The stack called "${name}" is not declared in the configuration`],
          accumulator,
        )),
    { stacks: [], messages: [] },
    R.map(R.trim, R.split(',', stacknames)),
  );

export const deployFn = async (mgr, cmd, args) =>
  exec(await getDockerServer(mgr), cmd, args, false, true);

export const deploy = async (deployFn, mgr, stacks) => {
  for (const stack of stacks) {
    await deployFn(mgr, 'docker', [
      'stack',
      'deploy',
      '--compose-file',
      `deploy-${stack}-osx.yml`,
      stack,
    ]);
  }
};
