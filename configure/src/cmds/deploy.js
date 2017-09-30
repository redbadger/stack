import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { concat, join, map, mergeWith, pipe } from 'ramda';

import { step, err } from '../log';
import {
  create as createPortOverrides,
  merge as mergeComposeFiles,
  execFn as mergeComposeFilesFn,
  write as writeComposeFiles,
  writeFn,
} from '../compose-file';
import { getServices, getComposeFiles } from '../config';
import { getDocker, getEnv } from '../docker-server';
import { create as createLBConfig, reload as reloadLB, write as writeLBConfig } from '../haproxy';
import { assign as assignPorts } from '../ports';
import { findWithPublishedPorts as findPublicServices } from '../services';
import { validate, deploy, execFn as deployFn } from '../deploy';

export const command = 'deploy [stacks...]';
export const desc = `Deploys the specified stacks.
If no stacks are specified, then just creates merged compose files.
`;
export const builder = {};

export const handler = argv => {
  const stackConfigPath = path.resolve(argv.file);
  const stackConfig = yaml.safeLoad(fs.readFileSync(stackConfigPath, 'utf8'));

  const stepper = step(3 + (argv.update ? 1 : 0));
  let nextStep = 1;
  const logStep = msg => stepper(nextStep++)(msg);

  const doWork = async () => {
    logStep('Scanning swarm and configuring ports');
    const env = await getEnv(argv.swarm);
    const docker = getDocker(env);
    const existing = await docker.listServices();
    const configured = getServices(stackConfig);
    const servicesWithPorts = pipe(findPublicServices, assignPorts(configured))(existing);

    const portOverrides = createPortOverrides(servicesWithPorts);
    const portOverrideFilesByStack = writeComposeFiles(writeFn, portOverrides, 'ports-');

    if (argv.update) {
      logStep('Updating load balancer');
      const loadBalancerConfig = createLBConfig(servicesWithPorts, argv.domain);
      writeLBConfig(loadBalancerConfig);
      await reloadLB();
    }

    logStep('Merging compose files');
    const filenamesByStack = getComposeFiles(stackConfig.stacks);
    const pullFiles = await mergeComposeFiles(
      mergeComposeFilesFn,
      'local',
      filenamesByStack,
      false,
    );
    writeComposeFiles(writeFn, pullFiles, 'pull-');
    const deployFiles = await mergeComposeFiles(
      mergeComposeFilesFn,
      argv.swarm,
      mergeWith(concat, filenamesByStack, map(x => [x], portOverrideFilesByStack)),
      true,
    );
    writeComposeFiles(writeFn, deployFiles, 'deploy-');

    if (Array.isArray(argv.stacks) && argv.stacks.length > 0) {
      const validations = validate(argv.stacks, stackConfig);
      logStep(`Deploying stack${validations.stacks.length === 1 ? '' : 's'}: ${validations.stacks
        .map(s => `"${s}"`)
        .join(', ')}`);
      if (validations.messages.length) {
        err(join(', ', validations.messages));
      } else {
        deploy(deployFn, argv.swarm, validations.stacks);
      }
    }
  };

  doWork();
};
