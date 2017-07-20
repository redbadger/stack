import fp from 'lodash/fp';
import fs from 'fs';

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

export const write = (contents, dir) => {
  fp.forEach(([stack, content]) => {
    const file = `${dir}/${stack}-ports.yml`;
    console.log(`Writing ${file}`);
    fs.writeFileSync(file, content);
  }, fp.toPairs(contents));
};
