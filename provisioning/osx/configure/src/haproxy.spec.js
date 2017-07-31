import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { create } from './haproxy';

describe('haproxy', () => {
  it('should create the correct config', () => {
    const services = [
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
    const expected = fs.readFileSync(path.resolve(__dirname, '../fixtures/haproxy.cfg'), 'utf8');
    const actual = create(services, 'local');
    expect(actual).to.equal(expected);
  });
});
