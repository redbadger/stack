import fs from 'fs';
import getRepoInfo from 'git-repo-info';
import getStream from 'get-stream';
import path from 'path';
import { chain, forEach, fromPairs, groupBy, join, map, toPairs } from 'ramda';

import { log } from './log';
import { exec, getEnv } from './docker-server';

export const create = services => {
  const stackNameAndServices = toPairs(groupBy(service => service.stack, services));

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${join('', map(genService, services))}
`;

  const toServices = ([stackname, services]) => [stackname, genStack(services)];
  return fromPairs(map(toServices, stackNameAndServices));
};

export const execFn = async (server, cmd, args, stdout = false, stderr = true) => {
  const env = await getEnv(server);
  env.tag = process.env.tag || getRepoInfo().abbreviatedSha;
  const cp = exec(env, cmd, args, stdout, stderr);
  return getStream(cp.stdout);
};

export const merge = async (execFn, server, filesByStack, resolve) => {
  const output = {};
  for (const [stack, files] of toPairs(filesByStack)) {
    let args = [...chain(f => ['-f', f], map(path.resolve, files)), 'config'];
    if (resolve) {
      args = [...args, '--resolve-image-digests'];
    }
    output[stack] = await execFn(server, 'docker-compose', args);
  }
  return output;
};

export const writeFn = (filePath, content) => {
  log(`Writing ${filePath}`);
  fs.writeFileSync(filePath, content);
};

export const write = (writeFn, filesByStack, stage) => {
  const paths = {};
  forEach(([stack, content]) => {
    const file = `${stack}-${stage}.yml`;
    paths[stack] = file;
    writeFn(path.resolve(file), content);
  }, toPairs(filesByStack));
  return paths;
};
