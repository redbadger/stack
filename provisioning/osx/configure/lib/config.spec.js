'use strict';

var _chai = require('chai');

var _config = require('./config');

describe('config', () => {
  it('should flatten the config', () => {
    const config = {
      domains: [{
        name: 'dev',
        stacks: [{
          name: 'services',
          services: [{
            name: 'visualizer'
          }]
        }, {
          name: 'app',
          services: [{
            name: 'rproxy',
            aliases: ['web']
          }]
        }]
      }]
    };
    const expected = [{
      domain: 'dev',
      stack: 'services',
      name: 'visualizer',
      aliases: []
    }, {
      domain: 'dev',
      stack: 'app',
      name: 'rproxy',
      aliases: ['web']
    }];
    const actual = (0, _config.flatten)(config);
    (0, _chai.expect)(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});