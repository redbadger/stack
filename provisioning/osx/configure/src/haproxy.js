import Docker from 'dockerode';
import fs from 'fs';
import mkdirp from 'mkdirp';
import R from 'ramda';

import { log, warn } from './log';

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
  log(`Writing ${file}`);
  fs.writeFileSync(file, contents);
};

export const reload = async () => {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' });
  const opts = {
    all: false,
    filters: { label: ['com.docker.compose.service=load_balancer'] },
  };
  const containerInfo = R.head(await docker.listContainers(opts));
  if (containerInfo) {
    const container = docker.getContainer(containerInfo.Id);
    await container.kill({ signal: 'SIGHUP' });
    log('Load balancer has been signalled to reload config');
  } else {
    warn('Cannot find a container with service name "load_balancer"');
  }
};
