import { expect } from 'chai';
import { findNext, assign } from './ports';

describe('should find the first unused port above 8000', () => {
  it('when only one', () => {
    const expected = 8001;
    const actual = findNext([
      {
        stack: 'services',
        name: 'visualizer',
        aliases: [],
        port: 8000,
      },
    ]);
    expect(actual).to.equal(expected);
  });
  it('when one but without port', () => {
    const expected = 8000;
    const actual = findNext([
      {
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
      },
    ]);
    expect(actual).to.equal(expected);
  });
  it('when there is a gap', () => {
    const expected = 8000;
    const actual = findNext([
      {
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
      },
      {
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 8001,
      },
    ]);
    expect(actual).to.equal(expected);
  });
  it('when multiple', () => {
    const expected = 8003;
    const actual = findNext([
      {
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
        port: 8000,
      },
      {
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
        port: 8002,
      },
      {
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 8001,
      },
    ]);
    expect(actual).to.equal(expected);
  });
});

describe('assignPorts', () => {
  it('should assign ports to those without', () => {
    const desiredServices = [
      {
        stack: 'services',
        name: 'visualizer',
        aliases: [],
      },
      {
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
      },
    ];
    const existingServices = [
      { name: 'visualizer', stack: 'services', port: 8000 },
      { name: 'rproxy', stack: 'app', port: 8001 },
      { name: 'registry', stack: 'swarm', port: 5000 },
    ];
    const expected = [
      {
        stack: 'services',
        name: 'visualizer',
        aliases: [],
        port: 8000,
      },
      {
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 8001,
      },
    ];
    const actual = assign(desiredServices)(existingServices);
    expect(actual).to.deep.equal(expected);
  });
});
