'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.write = exports.create = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const create = exports.create = services => {
  const stackNameAndServices = _ramda2.default.toPairs(_ramda2.default.groupBy(service => service.stack, services));

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${_ramda2.default.join('', _ramda2.default.map(genService, services))}
`;

  return _ramda2.default.fromPairs(_ramda2.default.map(([stackname, services]) => [stackname, genStack(services)], stackNameAndServices));
};

const write = exports.write = contents => {
  _ramda2.default.forEach(([stack, content]) => {
    const file = `/tmp/${stack}-ports.yml`;
    console.log(`Writing ${file}`);
    _fs2.default.writeFileSync(file, content);
  }, _ramda2.default.toPairs(contents));
};