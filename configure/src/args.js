export default {
  file: {
    alias: 'f',
    demandOption: true,
    requiresArg: true,
    default: '_stacks.yml',
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
  swarm: {
    alias: 's',
    demandOption: true,
    requiresArg: true,
    default: 'swarm',
    describe: 'The name of a Docker swarm as described in _docker.yml',
    type: 'string',
  },
};
