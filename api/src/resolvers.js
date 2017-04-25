import fs from 'fs';
import Path from 'path';
import Promise from 'bluebird';

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

export default {
  Query: {
    server() {
      return process.env['HOSTNAME'] || 'localhost';
    },
    async secrets() {
      const path = '/run/secrets';
      const files = await readdir(path);
      return files.map(async file => ({
        name: file,
        value: await readFile(Path.resolve(path, file), 'utf8'),
      }));
    },
    token(_, req) {
      return req.headers && req.headers['x-extra'];
    },
  },
};
