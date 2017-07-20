import fp from 'lodash/fp';

export const flatten = config => {
  return fp.flatMap(
    domain =>
      fp.flatMap(
        stack =>
          fp.map(
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
