#!/usr/bin/env node
import Bluebird from 'bluebird';
import Docker from 'dockerode';
import DockerMachine from 'docker-machine';
import R from 'ramda';

import { create as createComposeFile } from './compose-file';
import { create as createNginxConfig } from './nginx';
import { assign as assignPorts } from './ports';
import { findWithPublishedPorts as findPublicServices } from './services';
import { flatten as flattenConfig } from './config';
import { reload as reloadNginx } from './nginx';
import { write as writeComposeFile } from './compose-file';
import { write as writeNginxConfig } from './nginx';
import args from './args';

const argv = require('yargs').options(args).help().argv;

const dockerEnv = Bluebird.promisify(DockerMachine.env);

const doWork = async () => {
  const env = await dockerEnv(argv.manager, { parse: true });
  R.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);

  const docker = new Docker();
  const existingServices = await docker.listServices();
  const servicesWithPorts = R.pipe(
    findPublicServices,
    assignPorts(flattenConfig(argv.file)),
  )(existingServices);

  const nginxConfig = createNginxConfig(servicesWithPorts);
  writeNginxConfig(nginxConfig);
  if (argv.update) await reloadNginx();

  const composeFiles = createComposeFile(servicesWithPorts);
  writeComposeFile(composeFiles);
};

doWork();
