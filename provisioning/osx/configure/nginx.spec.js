import { expect } from 'chai';
import { createConfig } from './nginx';

describe('nginx', () => {
  it('should write the correct config', () => {
    const services = [
      {
        domain: 'dev',
        stack: 'services',
        name: 'visualizer',
        aliases: [],
        port: 8080,
      },
      {
        domain: 'dev',
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 80,
      },
    ];
    const expected = `
server {
  listen 80;
  location / {
    return 404;
  }
}

upstream visualizer {
  server wkr1:8080;
  server wkr2:8080;
  server wkr3:8080;
}

server {
  listen 80;
  server_name visualizer.services.dev;

  location / {
    proxy_pass http://visualizer;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}

upstream rproxy {
  server wkr1:80;
  server wkr2:80;
  server wkr3:80;
}

server {
  listen 80;
  server_name web.app.dev rproxy.app.dev;

  location / {
    proxy_pass http://rproxy;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
`;
    const actual = createConfig(services);
    expect(actual).to.equal(expected);
  });
});
