#!./node_modules/.bin/babel-node
import Docker from 'dockerode';
import fp from 'lodash/fp';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { createConfig as createNginxConfig } from './nginx';
import { findNext as findNextPort } from './ports';
import { flatten as flattenConfig } from './config';
import { writeConfig as writeNginxConfig } from './nginx';

const argv = require('yargs')
  .options({
    file: {
      alias: 'f',
      demandOption: true,
      default: 'master.yml',
      describe: 'yaml file with master configuration',
      type: 'string',
      coerce: f => yaml.safeLoad(fs.readFileSync(path.resolve(f), 'utf8')),
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
  const allServices = await docker.listServices();
  const servicesWithPorts = fp.pipe(
    findPublicServices,
    assignPorts(flattenConfig(argv.f)),
  )(allServices);
  const nginxConfig = createNginxConfig(servicesWithPorts);
  writeNginxConfig(nginxConfig);
  console.log(nginxConfig);
};

doWork();
