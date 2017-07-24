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

  const filePathsByStack = await getComposeFiles(
    x => path.resolve(path.dirname(configPath), x),
    config.stacks,
  );
  const portOverrides = createPortOverrides(servicesWithPorts);
  const portOverridePathsByStack = writeComposeFiles(writeFn, portOverrides, '-ports');
  const composeFiles = await mergeComposeFiles(
    mergeComposeFilesFn,
    R.mergeWith(R.concat, filePathsByStack, R.map(x => [x], portOverridePathsByStack)),
  );
  writeComposeFiles(writeFn, composeFiles);

  const nginxConfig = createNginxConfig(servicesWithPorts, argv.domain);
  writeNginxConfig(nginxConfig);
  if (argv.update) await reloadNginx();
};

doWork();
