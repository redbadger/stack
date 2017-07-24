'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.write = exports.writeFn = exports.merge = exports.mergeFn = exports.create = undefined;

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _getStream = require('get-stream');

var _getStream2 = _interopRequireDefault(_getStream);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

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

// const deleteFile = ({ name }) => fs.unlinkSync(name);

const mergeFn = exports.mergeFn = async (cmd, args) => {
  const cp = (0, _execa2.default)(cmd, args, {
    env: {
      PATH: process.env.PATH
    },
    extendEnv: false
  });
  cp.stderr.pipe(process.stderr);
  return (0, _getStream2.default)(cp.stdout);
};

const merge = exports.merge = async (mergeFn, filesByStack) => {
  const retVal = {};
  for (const [stack, files] of _ramda2.default.toPairs(filesByStack)) {
    const args = _ramda2.default.chain(f => ['-f', f], files);
    retVal[stack] = await mergeFn('docker-compose', [...args, 'config']);
  }
  return retVal;
};

const writeFn = exports.writeFn = (filePath, content) => {
  console.log(`Writing ${filePath}`); // eslint-disable-line
  _fs2.default.writeFileSync(filePath, content);
};

const write = exports.write = (writeFn, filesByStack, name) => {
  const paths = {};
  _ramda2.default.forEach(([stack, content]) => {
    const filePath = `/tmp/${stack}${name || ''}.yml`;
    writeFn(filePath, content);
    paths[stack] = filePath;
  }, _ramda2.default.toPairs(filesByStack));
  return paths;
};