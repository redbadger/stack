import execa from 'execa';
import fs from 'fs';
import mkdirp from 'mkdirp';
import R from 'ramda';

export const create = (services, domain) => `global
    maxconn 4096
    log 127.0.0.1:514 local2 debug

defaults
    mode http
    log global
    option httplog
    # option logasap
    option dontlognull
    option log-health-checks
    option forwardfor
    option contstats
    option http-server-close
    retries 3
    option redispatch
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend http_front
    bind *:80
    stats enable
    stats uri /haproxy?stats
    use_backend %[req.hdr(host),lower]
${R.join(
    '',
    R.map(
      s =>
        `${R.join(
          '',
          R.map(
            name =>
              `
backend ${name}.${s.stack}.${domain}
    balance roundrobin
    ${s.health ? `option httpchk GET ${s.health}` : ''}
    server web wkr1:${s.port} check
    server web wkr2:${s.port} check
    server web wkr3:${s.port} check
`,
            R.concat([s.name], s.aliases),
          ),
        )}`,
      services,
    ),
  )}`;

export const write = contents => {
  mkdirp.sync('/tmp/haproxy');
  const file = '/tmp/haproxy/haproxy.cfg';
  console.log(`Writing ${file}`); // eslint-disable-line
  fs.writeFileSync(file, contents);
};

export const reload = async () => {
  console.log('Reconfiguring the Load Balancer...'); //eslint-disable-line
  const cp = execa('docker', ['kill', '-s', 'HUP', 'loadbalancer_load_balancer_1'], {
    env: {
      PATH: process.env.PATH,
    },
    extendEnv: false,
  });
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
  return cp;
};
