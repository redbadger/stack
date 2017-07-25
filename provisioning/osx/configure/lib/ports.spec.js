'use strict';

var _chai = require('chai');

var _ports = require('./ports');

describe('should find the first unused port above 8000', () => {
  it('when only one', () => {
    const expected = 8001;
    const actual = (0, _ports.findNext)([{
      stack: 'services',
      name: 'visualizer',
      port: 8000
    }]);
    (0, _chai.expect)(actual).to.equal(expected);
  });
  it('when one but without port', () => {
    const expected = 8000;
    const actual = (0, _ports.findNext)([{
      stack: 'services',
      name: 'fsdkflkdf'
    }]);
    (0, _chai.expect)(actual).to.equal(expected);
  });
  it('when there is a gap', () => {
    const expected = 8000;
    const actual = (0, _ports.findNext)([{
      stack: 'services',
      name: 'fsdkflkdf'
    }, {
      stack: 'app',
      name: 'rproxy',
      aliases: ['web'],
      port: 8001
    }]);
    (0, _chai.expect)(actual).to.equal(expected);
  });
  it('when multiple', () => {
    const expected = 8003;
    const actual = (0, _ports.findNext)([{
      stack: 'services',
      name: 'fsdkflkdf',
      port: 8000
    }, {
      stack: 'services',
      name: 'fsdkflkdf',
      port: 8002
    }, {
      stack: 'app',
      name: 'rproxy',
      aliases: ['web'],
      port: 8001
    }]);
    (0, _chai.expect)(actual).to.equal(expected);
  });
});

describe('assignPorts', () => {
  it('should assign ports to those without', () => {
    const desiredServices = [{ stack: 'app', name: 'rproxy', aliases: ['web'] }];
    const existingServices = [{ stack: 'services', name: 'visualizer', port: 8000 }];
    const expected = [{ stack: 'app', name: 'rproxy', aliases: ['web'], port: 8001 }];
    const actual = (0, _ports.assign)(desiredServices)(existingServices);
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });
  it('should not change port numbers already assigned', () => {
    const desiredServices = [{ stack: 'services', name: 'visualizer', port: 8000 }];
    const existingServices = [{ stack: 'services', name: 'visualizer', port: 8000 }];
    const expected = [{ stack: 'services', name: 'visualizer', port: 8000 }];
    const actual = (0, _ports.assign)(desiredServices)(existingServices);
    (0, _chai.expect)(actual).to.deep.equal(expected);
  });
});