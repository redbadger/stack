import fs from 'fs';
import getStream from 'get-stream';
import path from 'path';
import R from 'ramda';

import { exec, getDockerServer } from './docker-server';

export const create = services => {
  const stackNameAndServices = R.toPairs(R.groupBy(service => service.stack, services));

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${R.join('', R.map(genService, services))}
`;

  return R.fromPairs(
    R.map(([stackname, services]) => [stackname, genStack(services)], stackNameAndServices),
  );
};

export const mergeFn = async (cmd, args) => {
  const env = await getDockerServer();
  const cp = exec(env, cmd, args, false, true);
  return getStream(cp.stdout);
};

export const merge = async (mergeFn, dir, filesByStack) => {
  const retVal = {};
  for (const [stack, files] of R.toPairs(filesByStack)) {
    const args = R.chain(f => ['-f', f], R.map(f => path.join(dir, f), files));
    retVal[stack] = await mergeFn('docker-compose', [...args, 'config']);
  }
  return retVal;
};

export const writeFn = (filePath, content) => {
  console.log(`Writing ${filePath}`); // eslint-disable-line
  fs.writeFileSync(filePath, content);
};

export const write = (writeFn, filesByStack, dir, prefix) => {
  const paths = {};
  R.forEach(([stack, content]) => {
    const file = `${prefix}${stack}.yml`;
    paths[stack] = file;
    writeFn(path.join(dir, file), content);
  }, R.toPairs(filesByStack));
  return paths;
};
