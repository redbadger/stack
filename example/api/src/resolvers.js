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
      let files;
      try {
        files = await readdir(path);
      } catch (e) {
        files = [];
      }
      return files.map(async file => ({
        name: file,
        value: await readFile(Path.resolve(path, file), 'utf8'),
      }));
    },
    headers(_1, _2, req) {
      return JSON.stringify(req && req.headers);
    },
  },
};
