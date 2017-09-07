export default {
  file: {
    alias: 'f',
    demandOption: true,
    requiresArg: true,
    default: 'stacks.yml',
    describe: 'YAML file with stacks configuration',
    type: 'string',
  },
  domain: {
    alias: 'd',
    demandOption: true,
    requiresArg: true,
    default: 'local',
    describe: 'The name of the top-level domain you want to use',
    type: 'string',
  },
  update: {
    alias: 'u',
    demandOption: true,
    default: false,
    describe: 'If true, updates the load balancer with new ports',
    type: 'boolean',
  },
  deploy: {
    demandOption: false,
    describe: 'A comma separated list of stacks to deploy',
    type: 'string',
  },
  swarm: {
    alias: 's',
    demandOption: true,
    requiresArg: true,
    default: 'mgr1',
    describe:
      "The docker-machine name of a manager node in a local swarm, OR the path to Docker's UNIX socket file",
    type: 'string',
  },
};
