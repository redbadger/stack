import R from 'ramda';

export const getServices = config =>
  R.chain(
    stack =>
      R.map(
        service => ({
          stack: stack.name,
          name: service.name,
          aliases: service.aliases || [],
        }),
        stack.services,
      ),
    config.stacks,
  );

export const getComposeFiles = R.reduce(
  (acc, stack) => ({ ...acc, [stack.name]: stack['compose-files'] }),
  {},
);
