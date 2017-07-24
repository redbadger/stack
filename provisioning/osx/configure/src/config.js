import R from 'ramda';

export const flatten = config => {
  return R.chain(
    domain =>
      R.chain(
        stack =>
          R.map(
            service => ({
              domain: domain.name,
              stack: stack.name,
              name: service.name,
              aliases: service.aliases || [],
            }),
            stack.services,
          ),
        domain.stacks,
      ),
    config.domains,
  );
};
