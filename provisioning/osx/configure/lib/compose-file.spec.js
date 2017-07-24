'use strict';

var _chai = require('chai');

var _composeFile = require('./compose-file');

describe('compose-file', () => {
  it('should create the correct port overlays', () => {
    const services = [{ stack: 'services', name: 'visualizer', aliases: [], port: 8080 }, { stack: 'app', name: 'rproxy', aliases: ['web'], port: 80 }, { stack: 'app', name: 'gateway', aliases: ['api'], port: 8000 }, { stack: 'app', name: 'gateway1', aliases: ['api1'], port: 8001 }];
    const expected = {
      services: `version: "3.1"

services:
  visualizer:
    ports:
      - 8080:3000

`,
      app: `version: "3.1"

services:
  rproxy:
    ports:
      - 80:3000
  gateway:
    ports:
      - 8000:3000
  gateway1:
    ports:
      - 8001:3000

`
    };
    const actual = (0, _composeFile.create)(services);
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });

  it('should merge the files correctly', async () => {
    const filesByStack = {
      a: ['a.yml', 'b.yml', 'c.yml']
    };
    const expected = ['docker-compose', ['-f', '/tmp/a.yml', '-f', '/tmp/b.yml', '-f', '/tmp/c.yml', 'config']];
    let actual;
    await (0, _composeFile.merge)((cmd, args) => {
      actual = [cmd, args];
    }, '/tmp', filesByStack);
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });

  it('should write the files correctly', () => {
    const files = {
      a: 'a1',
      b: 'b1'
    };
    const contents = {};
    const paths = (0, _composeFile.write)((filePath, content) => {
      contents[filePath] = content;
    }, files, '/tmp', 'ports-');

    const expectedContents = {
      '/tmp/ports-a.yml': 'a1',
      '/tmp/ports-b.yml': 'b1'
    };
    (0, _chai.expect)(contents).to.deep.equal(expectedContents);

    const expectedFiles = {
      a: 'ports-a.yml',
      b: 'ports-b.yml'
    };
    (0, _chai.expect)(paths).to.deep.equal(expectedFiles);
  });
});