#!./node_modules/.bin/babel-node

'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _composeFile = require('./compose-file');

var _nginx = require('./nginx');

var _ports = require('./ports');

var _config = require('./config');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const argv = require('yargs').options({
  file: {
    alias: 'f',
    demandOption: true,
    default: 'master.yml',
    describe: 'YAML file with master configuration',
    type: 'string',
    coerce: f => _jsYaml2.default.safeLoad(_fs2.default.readFileSync(_path2.default.resolve(f), 'utf8'))
  },
  'compose-file-dir': {
    alias: 'c',
    demandOption: true,
    describe: 'The directory in which your compose-files live',
    type: 'string',
    coerce: dir => _path2.default.resolve(dir)
  }
}).help().argv;

const findPublicServices = _fp2.default.pipe(_fp2.default.map(s => {
  const name = s.Spec.Name.split('_')[1];
  const stack = s.Spec.Labels['com.docker.stack.namespace'];
  const ports = s.Endpoint.Ports && s.Endpoint.Ports.map(p => p.PublishedPort);
  const port = _fp2.default.head(ports);
  return { name, stack, port };
}), _fp2.default.filter(s => s.port));

const assignPorts = desiredServices => existingServices => _fp2.default.reduce((acc, svc) => {
  const existing = existingServices.find(s => s.stack === svc.stack && s.name === svc.name);
  const port = existing ? existing.port : (0, _ports.findNext)(acc);
  return acc.concat(_extends({}, svc, { port }));
}, [], desiredServices);

const doWork = async () => {
  const docker = new _dockerode2.default();
  const existingServices = await docker.listServices();
  const servicesWithPorts = _fp2.default.pipe(findPublicServices, assignPorts((0, _config.flatten)(argv.file)))(existingServices);

  const nginxConfig = (0, _nginx.create)(servicesWithPorts);
  (0, _nginx.write)(nginxConfig);

  const composeFiles = (0, _composeFile.create)(servicesWithPorts);
  (0, _composeFile.write)(composeFiles, argv['compose-file-dir']);
};

doWork();