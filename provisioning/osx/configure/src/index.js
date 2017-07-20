#!/usr/bin/env node
import Docker from 'dockerode';
import fp from 'lodash/fp';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { create as createComposeFile } from './compose-file';
import { create as createNginxConfig } from './nginx';
import { findNext as findNextPort } from './ports';
import { flatten as flattenConfig } from './config';
import { write as writeComposeFile } from './compose-file';
import { write as writeNginxConfig } from './nginx';

const argv = require('yargs')
  .options({
    file: {
      alias: 'f',
      demandOption: true,
      default: 'master.yml',
      describe: 'YAML file with master configuration',
      type: 'string',
      coerce: f => yaml.safeLoad(fs.readFileSync(path.resolve(f), 'utf8')),
    },
    'compose-file-dir': {
      alias: 'c',
      demandOption: true,
      describe: 'The directory in which your compose-files live',
      type: 'string',
      coerce: dir => path.resolve(dir),
    },
  })
  .help().argv;

const findPublicServices = fp.pipe(
  fp.map(s => {
    const name = s.Spec.Name.split('_')[1];
    const stack = s.Spec.Labels['com.docker.stack.namespace'];
    const ports =
      s.Endpoint.Ports && s.Endpoint.Ports.map(p => p.PublishedPort);
    const port = fp.head(ports);
    return { name, stack, port };
  }),
  fp.filter(s => s.port),
);

const assignPorts = desiredServices => existingServices =>
  fp.reduce(
    (acc, svc) => {
      const existing = existingServices.find(
        s => s.stack === svc.stack && s.name === svc.name,
      );
      const port = existing ? existing.port : findNextPort(acc);
      return acc.concat({ ...svc, port });
    },
    [],
    desiredServices,
  );

const doWork = async () => {
  const docker = new Docker();
  const existingServices = await docker.listServices();
  const servicesWithPorts = fp.pipe(
    findPublicServices,
    assignPorts(flattenConfig(argv.file)),
  )(existingServices);

  const nginxConfig = createNginxConfig(servicesWithPorts);
  writeNginxConfig(nginxConfig);

  const composeFiles = createComposeFile(servicesWithPorts);
  writeComposeFile(composeFiles, argv['compose-file-dir']);
};

doWork();
