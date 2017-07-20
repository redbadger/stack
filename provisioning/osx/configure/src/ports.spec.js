import { expect } from 'chai';
import { findNext } from './ports';

describe('should find the first unused port above 8000', () => {
  it('when only one', () => {
    const expected = 8001;
    const actual = findNext([
      {
        domain: 'dev',
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
        domain: 'dev',
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
        domain: 'dev',
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
      },
      {
        domain: 'dev',
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
        domain: 'dev',
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
        port: 8000,
      },
      {
        domain: 'dev',
        stack: 'services',
        name: 'fsdkflkdf',
        aliases: [],
        port: 8002,
      },
      {
        domain: 'dev',
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 8001,
      },
    ]);
    expect(actual).to.equal(expected);
  });
});
