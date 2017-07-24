'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  file: {
    alias: 'f',
    demandOption: true,
    default: 'master.yml',
    describe: 'YAML file with master configuration',
    type: 'string',
    coerce: f => _jsYaml2.default.safeLoad(_fs2.default.readFileSync(_path2.default.resolve(f), 'utf8'))
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