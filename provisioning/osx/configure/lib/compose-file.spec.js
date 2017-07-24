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
    const expected = ['docker-compose', ['-f', 'a.yml', '-f', 'b.yml', '-f', 'c.yml', 'config']];
    let actual;
    await (0, _composeFile.merge)((cmd, args) => {
      actual = [cmd, args];
    }, filesByStack);
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
    }, files, '-ports');

    const expectedContents = {
      '/tmp/a-ports.yml': 'a1',
      '/tmp/b-ports.yml': 'b1'
    };
    (0, _chai.expect)(contents).to.deep.equal(expectedContents);

    const expectedPaths = {
      a: '/tmp/a-ports.yml',
      b: '/tmp/b-ports.yml'
    };
    (0, _chai.expect)(paths).to.deep.equal(expectedPaths);
  });
});