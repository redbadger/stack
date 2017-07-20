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

const baseConfig = `server {
  listen 80;
  location / {
    return 404;
  }
}
`;

const create = exports.create = services => `
${baseConfig}${_fp2.default.join('', _fp2.default.map(s => `
upstream ${s.name} {
  server wkr1:${s.port};
  server wkr2:${s.port};
  server wkr3:${s.port};
}

server {
  listen 80;
  server_name ${_fp2.default.join(' ', _fp2.default.map(name => `${name}.${s.stack}.${s.domain}`, _fp2.default.concat(s.aliases, [s.name])))};

  location / {
    proxy_pass http://${s.name};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
`, services))}`;

const write = exports.write = contents => {
  const file = '/tmp/nginx.conf';
  console.log(`Writing ${file}`);
  _fs2.default.writeFileSync(file, contents);
};