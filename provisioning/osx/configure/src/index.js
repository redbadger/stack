#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import R from 'ramda';
import yaml from 'js-yaml';
import yargs from 'yargs';

import args from './args';
import { steps, err } from './log';
import {
  create as createPortOverrides,
  merge as mergeComposeFiles,
  mergeFn as mergeComposeFilesFn,
  write as writeComposeFiles,
  writeFn,
} from './compose-file';
import { getServices, getComposeFiles } from './config';
import { getDocker, getEnv } from './docker-server';
import { create as createLBConfig, reload as reloadLB, write as writeLBConfig } from './haproxy';
import { assign as assignPorts } from './ports';
import { findWithPublishedPorts as findPublicServices } from './services';
import { validate, deploy, deployFn } from './deploy';

process.on('unhandledRejection', msg => {
  err(msg);
});

const { argv } = yargs.options(args).help();
const configPath = path.resolve(argv.file);
const config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

const step = steps(2 + (argv.update ? 1 : 0) + (argv.deploy ? 1 : 0));

const doWork = async () => {
  step('Scanning swarm and configuring ports');
  const env = await getEnv(argv.swarm);
  const docker = getDocker(env);
  const existing = await docker.listServices();
  const configured = getServices(config);
  const servicesWithPorts = R.pipe(findPublicServices, assignPorts(configured))(existing);

  const composeFilesDir = path.dirname(configPath);
  const filenamesByStack = getComposeFiles(config.stacks);
  const portOverrides = createPortOverrides(servicesWithPorts);
  const portOverrideFilesByStack = writeComposeFiles(
    writeFn,
    portOverrides,
    composeFilesDir,
    'ports-',
  );
  step('Merging compose files');
  const composeFiles = await mergeComposeFiles(
    mergeComposeFilesFn,
    composeFilesDir,
    R.mergeWith(R.concat, filenamesByStack, R.map(x => [x], portOverrideFilesByStack)),
  );
  writeComposeFiles(writeFn, composeFiles, composeFilesDir, 'deploy-');

  if (argv.update) {
    step('Updating load balancer');
    const loadBalancerConfig = createLBConfig(servicesWithPorts, argv.domain);
    writeLBConfig(loadBalancerConfig);
    await reloadLB();
  }
  if (Array.isArray(argv.deploy) && argv.deploy.length > 0) {
    const validations = validate(argv.deploy, config);
    step(`Deploying stack${validations.stacks.length === 1 ? '' : 's'}: ${validations.stacks
      .map(s => `"${s}"`)
      .join(', ')}`);
    if (validations.messages.length) {
      err(R.join(', ', validations.messages));
    } else {
      deploy(deployFn, argv.swarm, validations.stacks);
    }
  }
};

doWork();
