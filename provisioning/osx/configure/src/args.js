import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default {
  file: {
    alias: 'f',
    demandOption: true,
    default: 'master.yml',
    describe: 'YAML file with master configuration',
    type: 'string',
    coerce: f => yaml.safeLoad(fs.readFileSync(path.resolve(f), 'utf8')),
  },
  update: {
    alias: 'u',
    demandOption: true,
    default: false,
    describe: 'If true, updates the NGINX load balancer with new ports',
    type: 'boolean',
  },
  manager: {
    alias: 'm',
    demandOption: true,
    default: 'mgr1',
    describe: 'The name of a manager in the swarm (the docker-machine VM)',
    type: 'string',
  },
};
