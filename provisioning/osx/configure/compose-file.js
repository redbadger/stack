import fp from 'lodash/fp';

export const create = services => {
  const stackNameAndServices = fp.toPairs(
    fp.groupBy(service => service.stack, services),
  );

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${fp.join('', fp.map(genService, services))}
`;

  return fp.fromPairs(
    fp.map(
      ([stackname, services]) => [stackname, genStack(services)],
      stackNameAndServices,
    ),
  );
};

export const write = content => {
  fp.map(console.log, content);
};
