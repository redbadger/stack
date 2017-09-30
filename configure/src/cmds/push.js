import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { chain, map } from 'ramda';

import { err, step } from '../log';
import { getComposeFiles } from '../config';
import { execFn } from '../compose-file';

export const command = 'push <stacks...>';
export const desc = `Pushes Docker images, described in the compose files for the specified stacks.
`;
export const builder = {};

export const handler = async argv => {
  const stepper = step(argv.stacks.length);
  let nextStep = 1;
  const logStep = msg => stepper(nextStep++)(msg);

  const stackConfigPath = path.resolve(argv.file);
  const stackConfig = yaml.safeLoad(fs.readFileSync(stackConfigPath, 'utf8'));
  const filenamesByStack = getComposeFiles(stackConfig.stacks);
  for (const stack of argv.stacks) {
    logStep(`Pushing ${stack}`);
    const files = filenamesByStack[stack];
    if (files == null) {
      err(`Stack ${stack} was not found in stacks yaml file`);
      continue;
    }
    const args = chain(f => ['-f', f], map(path.resolve, files));
    await execFn('local', 'docker-compose', [...args, 'push'], true);
  }
};
