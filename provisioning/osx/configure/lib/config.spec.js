'use strict';

var _chai = require('chai');

var _config = require('./config');

describe('config', () => {
  const config = {
    stacks: [{
      name: 'services',
      'compose-files': ['services.yml'],
      services: [{ name: 'visualizer' }]
    }, {
      name: 'app',
      'compose-files': ['app.yml'],
      services: [{ name: 'rproxy', aliases: ['web'] }]
    }]
  };
  it('should get services from the config', () => {
    const expected = [{
      stack: 'services',
      name: 'visualizer',
      aliases: []
    }, {
      stack: 'app',
      name: 'rproxy',
      aliases: ['web']
    }];
    const actual = (0, _config.getServices)(config);
    (0, _chai.expect)(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
  it('should get compose files from the config', () => {
    const expected = {
      services: ['services.yml'],
      app: ['app.yml']
    };
    const actual = (0, _config.getComposeFiles)(config);
    (0, _chai.expect)(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});