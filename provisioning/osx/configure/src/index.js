#!/usr/bin/env node
import Bluebird from 'bluebird';
import Docker from 'dockerode';
import DockerMachine from 'docker-machine';
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
import {
  create as createNginxConfig,
  reload as reloadNginx,
  write as writeNginxConfig,
} from './nginx';
import { assign as assignPorts } from './ports';
import { findWithPublishedPorts as findPublicServices } from './services';

const dockerEnv = Bluebird.promisify(DockerMachine.env);

const argv = yargs.options(args).help().argv;
const configPath = path.resolve(argv.file);
const config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));

const setDockerServer = async manager => {
  const env = await dockerEnv(manager, { parse: true });
  R.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);
};

const doWork = async () => {
  await setDockerServer(argv.manager);
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

  const nginxConfig = createNginxConfig(servicesWithPorts, argv.domain);
  writeNginxConfig(nginxConfig);
  if (argv.update) await reloadNginx();
};

doWork();
