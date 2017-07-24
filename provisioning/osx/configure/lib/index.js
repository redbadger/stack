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

var _getStream = require('get-stream');

var _getStream2 = _interopRequireDefault(_getStream);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _composeFile = require('./compose-file');

var _nginx = require('./nginx');

var _ports = require('./ports');

var _services = require('./services');

var _config = require('./config');

var _args = require('./args');

var _args2 = _interopRequireDefault(_args);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFile = _bluebird2.default.promisify(_fs2.default.readFile);
const dockerEnv = _bluebird2.default.promisify(_dockerMachine2.default.env);

const argv = _yargs2.default.options(_args2.default).help().argv;

const doWork = async () => {
  const config = _jsYaml2.default.safeLoad((await (argv.file === '-' ? (0, _getStream2.default)(process.stdin) : readFile(_path2.default.resolve(argv.file), 'utf8'))));

  const env = await dockerEnv(argv.manager, { parse: true });
  _ramda2.default.forEachObjIndexed((v, k) => {
    process.env[k] = v;
  }, env);

  const docker = new _dockerode2.default();
  const existingServices = await docker.listServices();
  const servicesWithPorts = _ramda2.default.pipe(_services.findWithPublishedPorts, (0, _ports.assign)((0, _config.getServices)(config)))(existingServices);

  const nginxConfig = (0, _nginx.create)(servicesWithPorts, argv.domain);
  (0, _nginx.write)(nginxConfig);
  if (argv.update) await (0, _nginx.reload)();

  const composeFiles = (0, _composeFile.create)(servicesWithPorts);
  (0, _composeFile.write)(composeFiles);
};

doWork();