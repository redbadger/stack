'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assign = exports.findNext = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const findNext = exports.findNext = services => {
  const usedPorts = _ramda2.default.reduce((acc, s) => _extends({}, acc, { [s.port]: true }), {}, services);
  for (let i = 8000; i < Infinity; i++) {
    if (usedPorts[i]) {
      continue;
    }
    return i;
  }
};

const assign = exports.assign = desiredServices => existingServices => _ramda2.default.reduce((acc, svc) => {
  const existing = _ramda2.default.find(s => s.stack === svc.stack && s.name === svc.name, existingServices);
  const port = existing ? existing.port : findNext(acc);
  return acc.concat(_extends({}, svc, { port }));
}, [], desiredServices);