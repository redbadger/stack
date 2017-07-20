'use strict';

var _chai = require('chai');

var _composeFile = require('./compose-file');

describe('compose-file overlay', () => {
  it('should create the correct content', () => {
    const services = [{
      domain: 'dev',
      stack: 'services',
      name: 'visualizer',
      aliases: [],
      port: 8080
    }, {
      domain: 'dev',
      stack: 'app',
      name: 'rproxy',
      aliases: ['web'],
      port: 80
    }, {
      domain: 'dev',
      stack: 'app',
      name: 'gateway',
      aliases: ['api'],
      port: 8000
    }, {
      domain: 'dev',
      stack: 'app',
      name: 'gateway1',
      aliases: ['api1'],
      port: 8001
    }];
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
    (0, _chai.expect)(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});