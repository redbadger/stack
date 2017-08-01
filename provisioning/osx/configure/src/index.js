#!/usr/bin/env node
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
  const composeFiles = await mergeComposeFiles(
    mergeComposeFilesFn,
    composeFilesDir,
    R.mergeWith(R.concat, filenamesByStack, R.map(x => [x], portOverrideFilesByStack)),
  );
  writeComposeFiles(writeFn, composeFiles, composeFilesDir, 'deploy-');

  const loadBalancerConfig = createLBConfig(servicesWithPorts, argv.domain);
  writeLBConfig(loadBalancerConfig);
  if (argv.update) await reloadLB();
  if (argv.deploy) {
    const validations = validate(argv.deploy, config);
    if (validations.messages.length) {
      // eslint-disable-next-line no-console
      console.log(R.join(', ', validations.messages));
    } else {
      deploy(deployFn, argv.manager, validations.stacks);
    }
  }
};

doWork();
