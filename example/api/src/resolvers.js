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
      // even though '.' and '..' are not included, K8s adds extra private files
      // to mount point, so filter first
      return files.filter(name => !name.startsWith('.')).map(async name => {
        try {
          return {
            name,
            value: await readFile(Path.resolve(path, name), 'utf8'),
          };
        } catch (e) {
          return { name };
        }
      });
    },
    headers(_1, _2, req) {
      return JSON.stringify(req && req.headers);
    },
  },
};
