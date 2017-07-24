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
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });
  it('should get compose files from the config', async () => {
    const expected = {
      services: ['contents of services.yml'],
      app: ['contents of app.yml']
    };
    const actual = await (0, _config.getComposeFiles)(async f => `contents of ${f}`, config.stacks);
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });
});