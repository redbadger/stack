'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reload = exports.write = exports.create = undefined;

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

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
${baseConfig}${_ramda2.default.join('', _ramda2.default.map(s => `
upstream ${s.name} {
  server wkr1:${s.port};
  server wkr2:${s.port};
  server wkr3:${s.port};
}

server {
  listen 80;
  server_name ${_ramda2.default.join(' ', _ramda2.default.map(name => `${name}.${s.stack}.dev`, _ramda2.default.concat(s.aliases, [s.name])))};

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

const reload = exports.reload = async () => {
  console.log('Reloading NGINX configuration into Load Balancer...');
  const cp = (0, _execa2.default)('docker', ['exec', 'loadbalancer_load_balancer_1', 'nginx', '-s', 'reload'], {
    env: {
      PATH: process.env.PATH
    },
    extendEnv: false
  });
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
  return cp;
};