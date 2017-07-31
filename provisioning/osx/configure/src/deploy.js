import R from 'ramda';

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

export const deploy = stacks => {};
