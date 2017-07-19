const fp = require('lodash/fp');

const baseConfig = `server {
  listen 80;
  location / {
    return 404;
  }
}
`;

exports.createConfig = services => `
${baseConfig}${fp.join(
  '',
  fp.map(
    s => `
upstream ${s.name} {
  server wkr1:${s.port};
  server wkr2:${s.port};
  server wkr3:${s.port};
}

server {
  listen 80;
  server_name ${fp.join(
    ' ',
    fp.map(
      name => `${name}.${s.stack}.${s.domain}`,
      fp.concat(s.aliases, [s.name]),
    ),
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

exports.writeConfig = c => {
  // fs.writeFileSync();
  return c;
};
