import execa from 'execa';
import fs from 'fs';
import getStream from 'get-stream';
import R from 'ramda';

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

// const deleteFile = ({ name }) => fs.unlinkSync(name);

export const mergeFn = async (cmd, args) => {
  const cp = execa(cmd, args, {
    env: {
      PATH: process.env.PATH,
    },
    extendEnv: false,
  });
  cp.stderr.pipe(process.stderr);
  return getStream(cp.stdout);
};

export const merge = async (mergeFn, filesByStack) => {
  const retVal = {};
  for (const [stack, files] of R.toPairs(filesByStack)) {
    const args = R.chain(f => ['-f', f], files);
    retVal[stack] = await mergeFn('docker-compose', [...args, 'config']);
  }
  return retVal;
};

export const writeFn = (filePath, content) => {
  console.log(`Writing ${filePath}`); // eslint-disable-line
  fs.writeFileSync(filePath, content);
};

export const write = (writeFn, filesByStack, name) => {
  const paths = {};
  R.forEach(([stack, content]) => {
    const filePath = `/tmp/${stack}${name || ''}.yml`;
    writeFn(filePath, content);
    paths[stack] = filePath;
  }, R.toPairs(filesByStack));
  return paths;
};
