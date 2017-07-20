'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNext = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const findNext = exports.findNext = services => {
  const usedPorts = _fp2.default.reduce((acc, s) => _extends({}, acc, { [s.port]: true }), {}, services);
  for (let i = 8000; i < Infinity; i++) {
    if (usedPorts[i]) {
      continue;
    }
    return i;
  }
};