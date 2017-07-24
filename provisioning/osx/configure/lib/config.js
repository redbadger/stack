'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatten = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flatten = exports.flatten = config => {
  return _ramda2.default.chain(domain => _ramda2.default.chain(stack => _ramda2.default.map(service => ({
    domain: domain.name,
    stack: stack.name,
    name: service.name,
    aliases: service.aliases || []
  }), stack.services), domain.stacks), config.domains);
};