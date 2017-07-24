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

export const getComposeFiles = config =>
  R.fromPairs(
    R.map(stack => [stack.name, stack['compose-files']], config.stacks),
  );
