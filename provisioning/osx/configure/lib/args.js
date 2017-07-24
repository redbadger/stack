'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  file: {
    alias: 'f',
    demandOption: true,
    default: '-',
    describe: 'YAML file with master configuration, or - for stdin',
    type: 'string'
  },
  update: {
    alias: 'u',
    demandOption: true,
    default: false,
    describe: 'If true, updates the NGINX load balancer with new ports',
    type: 'boolean'
  },
  manager: {
    alias: 'm',
    demandOption: true,
    default: 'mgr1',
    describe: 'The name of a manager in the swarm (the docker-machine VM)',
    type: 'string'
  }
};