const fp = require('lodash/fp');

exports.findNext = services => {
  const usedPorts = fp.reduce(
    (acc, s) => Object.assign({}, acc, s.port ? { [s.port]: true } : {}),
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
