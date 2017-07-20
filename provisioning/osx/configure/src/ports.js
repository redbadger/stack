import fp from 'lodash/fp';

export const findNext = services => {
  const usedPorts = fp.reduce(
    (acc, s) => ({ ...acc, [s.port]: true }),
    {},
    services,
  );
  for (let i = 8000; i < Infinity; i++) {
    if (usedPorts[i]) {
      continue;
    }
    return i;
  }
};
