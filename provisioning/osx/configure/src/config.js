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

export const getComposeFiles = async (parse, stacks) => {
  const x = {};
  for (const stack of stacks) {
    x[stack.name] = await Promise.all(R.map(parse, stack['compose-files']));
  }
  return x;
};
