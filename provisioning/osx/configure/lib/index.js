#!/usr/bin/env node
'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

var _dockerMachine = require('docker-machine');

var _dockerMachine2 = _interopRequireDefault(_dockerMachine);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _args = require('./args');

var _args2 = _interopRequireDefault(_args);

var _composeFile = require('./compose-file');

var _config = require('./config');

var _nginx = require('./nginx');

var _ports = require('./ports');

var _services = require('./services');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dockerEnv = _bluebird2.default.promisify(_dockerMachine2.default.env);

const argv = _yargs2.default.options(_args2.default).help().argv;
const configPath = _path2.default.resolve(argv.file);
const config = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(configPath, 'utf8'));

const setDockerServer = async manager => {
  const env = await dockerEnv(manager, { parse: true });
  _ramda2.default.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);
};

const doWork = async () => {
  await setDockerServer(argv.manager);
  const docker = new _dockerode2.default();
  const existingServices = await docker.listServices();
  const servicesWithPorts = _ramda2.default.pipe(_services.findWithPublishedPorts, (0, _ports.assign)((0, _config.getServices)(config)))(existingServices);

  const composeFilesDir = _path2.default.dirname(configPath);
  const filenamesByStack = (0, _config.getComposeFiles)(config.stacks);
  const portOverrides = (0, _composeFile.create)(servicesWithPorts);
  const portOverrideFilesByStack = (0, _composeFile.write)(_composeFile.writeFn, portOverrides, composeFilesDir, 'ports-');
  const composeFiles = await (0, _composeFile.merge)(_composeFile.mergeFn, composeFilesDir, _ramda2.default.mergeWith(_ramda2.default.concat, filenamesByStack, _ramda2.default.map(x => [x], portOverrideFilesByStack)));
  (0, _composeFile.write)(_composeFile.writeFn, composeFiles, composeFilesDir, 'deploy-');

  const nginxConfig = (0, _nginx.create)(servicesWithPorts, argv.domain);
  (0, _nginx.write)(nginxConfig);
  if (argv.update) await (0, _nginx.reload)();
};

doWork();