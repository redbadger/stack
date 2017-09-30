import { contains, lensProp, over, pluck, reduce } from 'ramda';

import { getEnv, exec } from './docker-server';

const stacksLens = lensProp('stacks');
const messageLens = lensProp('messages');

export const validate = (stacknames, stackconfig) =>
  reduce(
    (accumulator, name) =>
      (contains(name, pluck('name', stackconfig.stacks))
        ? over(stacksLens, a => [...a, name], accumulator)
        : over(
          messageLens,
          a => [...a, `The stack called "${name}" is not declared in the configuration`],
          accumulator,
        )),
    { stacks: [], messages: [] },
    stacknames,
  );

export const execFn = async (mgr, cmd, args) => exec(await getEnv(mgr), cmd, args, false, true);

export const deploy = async (execFn, mgr, stacks) => {
  for (const stack of stacks) {
    await execFn(mgr, 'docker-compose', ['-f', `pull-${stack}.yml`, 'pull']);

    await execFn(mgr, 'docker', [
      'stack',
      'deploy',
      '--compose-file',
      `deploy-${stack}.yml`,
      '--with-registry-auth',
      stack,
    ]);
  }
};
