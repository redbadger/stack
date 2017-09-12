import { chain, map, reduce } from 'ramda';

export const getServices = config =>
  chain(
    stack =>
      map(
        service => ({
          stack: stack.name,
          name: service.name,
          aliases: service.aliases || [],
        }),
        stack.services,
      ),
    config.stacks,
  );

export const getComposeFiles = reduce(
  (acc, stack) => ({ ...acc, [stack.name]: stack['compose-files'] }),
  {},
);
