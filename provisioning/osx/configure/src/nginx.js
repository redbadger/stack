import execa from 'execa';
import R from 'ramda';
import fs from 'fs';

const baseConfig = `server {
  listen 80;
  location / {
    return 404;
  }
}
`;

export const create = services => `
${baseConfig}${R.join(
  '',
  R.map(
    s => `
upstream ${s.name} {
  server wkr1:${s.port};
  server wkr2:${s.port};
  server wkr3:${s.port};
}

server {
  listen 80;
  server_name ${R.join(
    ' ',
    R.map(name => `${name}.${s.stack}.dev`, R.concat(s.aliases, [s.name])),
  )};

  location / {
    proxy_pass http://${s.name};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
`,
    services,
  ),
)}`;

export const write = contents => {
  const file = '/tmp/nginx.conf';
  console.log(`Writing ${file}`);
  fs.writeFileSync(file, contents);
};

export const reload = async () => {
  console.log('Reloading NGINX configuration into Load Balancer...');
  const cp = execa(
    'docker',
    ['exec', 'loadbalancer_load_balancer_1', 'nginx', '-s', 'reload'],
    {
      env: {
        PATH: process.env.PATH,
      },
      extendEnv: false,
    },
  );
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
  return cp;
};
