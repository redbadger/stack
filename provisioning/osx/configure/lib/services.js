'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findWithPublishedPorts = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const findWithPublishedPorts = exports.findWithPublishedPorts = _ramda2.default.pipe(_ramda2.default.map(s => {
  const name = s.Spec.Name.split('_')[1];
  const stack = s.Spec.Labels['com.docker.stack.namespace'];
  const ports = s.Endpoint.Ports && _ramda2.default.pluck('PublishedPort', s.Endpoint.Ports);
  const port = _ramda2.default.head(ports || []);
  return { name, stack, port };
}), _ramda2.default.filter(s => s.port));