'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  file: {
    alias: 'f',
    demandOption: true,
    default: 'stacks.yml',
    describe: 'YAML file with stacks configuration',
    type: 'string'
  },
  update: {
    alias: 'u',
    demandOption: true,
    default: false,
    describe: 'If true, updates the NGINX load balancer with new ports',
    type: 'boolean'
  },
  domain: {
    alias: 'd',
    demandOption: true,
    default: 'dev',
    describe: 'The name of the top-level domain you want to use',
    type: 'string'
  },
  manager: {
    alias: 'm',
    demandOption: true,
    default: 'mgr1',
    describe: 'The name of a manager in the swarm (the docker-machine VM)',
    type: 'string'
  }
};