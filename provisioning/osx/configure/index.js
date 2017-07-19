#!/usr/bin/env node
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const fp = require('lodash/fp');

const flattenConfig = require('./config').flatten;
const findNextPort = require('./ports').findNext;
const createNginxConfig = require('./nginx').createConfig;
const writeNginxConfig = require('./nginx').writeConfig;

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

const requiredServices = flattenConfig(argv.f);

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
      return acc.concat(Object.assign({}, svc, { port }));
    },
    [],
    desiredServices,
  );

const docker = new Docker();
docker
  .listServices()
  .then(findPublicServices)
  .then(assignPorts(requiredServices))
  .then(createNginxConfig)
  .then(writeNginxConfig)
  .then(console.log);
