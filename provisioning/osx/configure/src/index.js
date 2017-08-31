#!/usr/bin/env node
import chalk from 'chalk';
import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import R from 'ramda';
import yaml from 'js-yaml';
import yargs from 'yargs';

import args from './args';
import {
  create as createPortOverrides,
  merge as mergeComposeFiles,
  mergeFn as mergeComposeFilesFn,
  write as writeComposeFiles,
  writeFn,
} from './compose-file';
import { getServices, getComposeFiles } from './config';
import { getDockerServer } from './docker-server';
import { create as createLBConfig, reload as reloadLB, write as writeLBConfig } from './haproxy';
import { assign as assignPorts } from './ports';
import { findWithPublishedPorts as findPublicServices } from './services';
import { validate, deploy, deployFn } from './deploy';

const argv = yargs.options(args).help().argv;
const configPath = path.resolve(argv.file);
const config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

const doWork = async () => {
  const env = await getDockerServer(argv.manager);
  R.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);
  const step = (num, msg) => {
    // eslint-disable-next-line no-console
    console.log(chalk`

{yellow [Step ${num}]: ${msg} ...}
`);
  };

  step(1, 'Configuring ports');
  const docker = new Docker();
  const existingServices = await docker.listServices();
  const servicesWithPorts = R.pipe(findPublicServices, assignPorts(getServices(config)))(
    existingServices,
  );

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

  step(3, 'Generating load-balancer configuration');
  const loadBalancerConfig = createLBConfig(servicesWithPorts, argv.domain);
  writeLBConfig(loadBalancerConfig);
  if (argv.update) {
    step(4, 'Reloading load-balancer');
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
      // eslint-disable-next-line no-console
      console.log(R.join(', ', validations.messages));
    } else {
      deploy(deployFn, argv.manager, validations.stacks);
    }
  }
};

doWork();
