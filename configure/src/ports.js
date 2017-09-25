import { concat, find, reduce } from 'ramda';

export const findNext = services => {
  const usedPorts = reduce((acc, s) => ({ ...acc, [s.port]: true }), {}, services);
  for (let i = 8000; i < Infinity; i++) {
    if (usedPorts[i]) {
      continue;
    }
    return i;
  }
  return 0;
};

export const assign = desiredServices => existingServices =>
  reduce(
    (acc, svc) => {
      const existing = find(s => s.stack === svc.stack && s.name === svc.name, existingServices);
      const port = existing ? existing.port : findNext(concat(existingServices, acc));
      return acc.concat({ ...svc, port });
    },
    [],
    desiredServices,
  );
