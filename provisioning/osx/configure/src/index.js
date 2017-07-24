#!/usr/bin/env node
import Bluebird from 'bluebird';
import Docker from 'dockerode';
import DockerMachine from 'docker-machine';
import fs from 'fs';
import getStream from 'get-stream';
import path from 'path';
import R from 'ramda';
import yaml from 'js-yaml';
import yargs from 'yargs';

import { create as createComposeFile } from './compose-file';
import { create as createNginxConfig } from './nginx';
import { assign as assignPorts } from './ports';
import { findWithPublishedPorts as findPublicServices } from './services';
import { getServices } from './config';
import { reload as reloadNginx } from './nginx';
import { write as writeComposeFile } from './compose-file';
import { write as writeNginxConfig } from './nginx';
import args from './args';

const readFile = Bluebird.promisify(fs.readFile);
const dockerEnv = Bluebird.promisify(DockerMachine.env);

const argv = yargs.options(args).help().argv;

const doWork = async () => {
  const config = yaml.safeLoad(
    await (argv.file === '-'
      ? getStream(process.stdin)
      : readFile(path.resolve(argv.file), 'utf8')),
  );

  const env = await dockerEnv(argv.manager, { parse: true });
  R.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);

  const docker = new Docker();
  const existingServices = await docker.listServices();
  const servicesWithPorts = R.pipe(
    findPublicServices,
    assignPorts(getServices(config)),
  )(existingServices);

  const nginxConfig = createNginxConfig(servicesWithPorts, argv.domain);
  writeNginxConfig(nginxConfig);
  if (argv.update) await reloadNginx();

  const composeFiles = createComposeFile(servicesWithPorts);
  writeComposeFile(composeFiles);
};

doWork();
