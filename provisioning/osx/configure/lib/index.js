#!/usr/bin/env node
'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

var _dockerMachine = require('docker-machine');

var _dockerMachine2 = _interopRequireDefault(_dockerMachine);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _composeFile = require('./compose-file');

var _nginx = require('./nginx');

var _ports = require('./ports');

var _services = require('./services');

var _config = require('./config');

var _args = require('./args');

var _args2 = _interopRequireDefault(_args);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = require('yargs').options(_args2.default).help().argv;

const dockerEnv = _bluebird2.default.promisify(_dockerMachine2.default.env);

const doWork = async () => {
  const env = await dockerEnv(argv.manager, { parse: true });
  _ramda2.default.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);

  const docker = new _dockerode2.default();
  const existingServices = await docker.listServices();
  const servicesWithPorts = _ramda2.default.pipe(_services.findWithPublishedPorts, (0, _ports.assign)((0, _config.flatten)(argv.file)))(existingServices);

  const nginxConfig = (0, _nginx.create)(servicesWithPorts);
  (0, _nginx.write)(nginxConfig);
  if (argv.update) await (0, _nginx.reload)();

  const composeFiles = (0, _composeFile.create)(servicesWithPorts);
  (0, _composeFile.write)(composeFiles);
};

doWork();