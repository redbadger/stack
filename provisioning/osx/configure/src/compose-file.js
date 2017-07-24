import R from 'ramda';
import fs from 'fs';

export const create = services => {
  const stackNameAndServices = R.toPairs(
    R.groupBy(service => service.stack, services),
  );

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${R.join('', R.map(genService, services))}
`;

  return R.fromPairs(
    R.map(
      ([stackname, services]) => [stackname, genStack(services)],
      stackNameAndServices,
    ),
  );
};

export const write = contents => {
  R.forEach(([stack, content]) => {
    const file = `/tmp/${stack}-ports.yml`;
    console.log(`Writing ${file}`);
    fs.writeFileSync(file, content);
  }, R.toPairs(contents));
};
