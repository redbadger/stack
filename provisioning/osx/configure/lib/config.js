'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComposeFiles = exports.getServices = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getServices = exports.getServices = config => _ramda2.default.chain(stack => _ramda2.default.map(service => ({
  stack: stack.name,
  name: service.name,
  aliases: service.aliases || []
}), stack.services), config.stacks);

const getComposeFiles = exports.getComposeFiles = _ramda2.default.reduce((acc, stack) => _extends({}, acc, { [stack.name]: stack['compose-files'] }), {});