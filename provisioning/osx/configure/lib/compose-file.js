'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.write = exports.create = undefined;

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const create = exports.create = services => {
  const stackNameAndServices = _fp2.default.toPairs(_fp2.default.groupBy(service => service.stack, services));

  const genService = service => `  ${service.name}:
    ports:
      - ${service.port}:3000
`;

  const genStack = services => `version: "3.1"

services:
${_fp2.default.join('', _fp2.default.map(genService, services))}
`;

  return _fp2.default.fromPairs(_fp2.default.map(([stackname, services]) => [stackname, genStack(services)], stackNameAndServices));
};

const write = exports.write = (contents, dir) => {
  _fp2.default.forEach(([stack, content]) => {
    const file = `${dir}/${stack}-ports.yml`;
    console.log(`Writing ${file}`);
    _fs2.default.writeFileSync(file, content);
  }, _fp2.default.toPairs(contents));
};