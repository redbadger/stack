'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatten = undefined;

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flatten = exports.flatten = config => {
  return _fp2.default.flatMap(domain => _fp2.default.flatMap(stack => _fp2.default.map(service => ({
    domain: domain.name,
    stack: stack.name,
    name: service.name,
    aliases: service.aliases || []
  }), stack.services), domain.stacks), config.domains);
};