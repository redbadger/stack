#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import R from 'ramda';
import yaml from 'js-yaml';
import yargs from 'yargs';

import args from './args';
import { log, err } from './log';
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

const { argv } = yargs.options(args).help();
const configPath = path.resolve(argv.file);
const config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

const step = (num, msg) => {
  log(`\n${chalk`{white [Step ${num}]: ${msg} ...}`}`);
};

const doWork = async () => {
  step(1, 'Configuring ports');
  const env = await getEnv(argv.manager);
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
  step(2, 'Merging compose files');
  const composeFiles = await mergeComposeFiles(
    mergeComposeFilesFn,
    composeFilesDir,
    R.mergeWith(R.concat, filenamesByStack, R.map(x => [x], portOverrideFilesByStack)),
  );
  writeComposeFiles(writeFn, composeFiles, composeFilesDir, 'deploy-');

  if (argv.update) {
    step(3, 'Updating load-balancer');
    const loadBalancerConfig = createLBConfig(servicesWithPorts, argv.domain);
    writeLBConfig(loadBalancerConfig);
    await reloadLB();
  }
  if (argv.deploy) {
    const validations = validate(argv.deploy, config);
    step(
      5,
      `Deploying stack${validations.stacks.length === 1 ? '' : 's'}: ${validations.stacks
        .map(s => `"${s}"`)
        .join(', ')}`,
    );
    if (validations.messages.length) {
      err(R.join(', ', validations.messages));
    } else {
      deploy(deployFn, argv.manager, validations.stacks);
    }
  }
};

doWork();
