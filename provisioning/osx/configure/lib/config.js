'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComposeFiles = exports.getServices = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getServices = exports.getServices = config => _ramda2.default.chain(stack => _ramda2.default.map(service => ({
  stack: stack.name,
  name: service.name,
  aliases: service.aliases || []
}), stack.services), config.stacks);

const getComposeFiles = exports.getComposeFiles = config => _ramda2.default.fromPairs(_ramda2.default.map(stack => [stack.name, stack['compose-files']], config.stacks));