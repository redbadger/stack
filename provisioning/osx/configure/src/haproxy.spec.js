import assert from 'power-assert';
import fs from 'fs';
import path from 'path';

import { create } from './haproxy';

describe('haproxy', () => {
  it('should write the correct config', () => {
    const services = [
      {
        stack: 'services',
        name: 'visualizer',
        health: '/_health',
        aliases: [],
        port: 8000,
      },
      {
        stack: 'app',
        name: 'rproxy',
        health: '/status',
        aliases: ['web'],
        port: 8001,
      },
    ];
    const expected = fs.readFileSync(path.resolve(__dirname, '../fixtures/haproxy.cfg'), 'utf8');
    const actual = create(services, 'local');
    assert(actual === expected);
  });
  it('should not add a health check if not specified', () => {
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
        health: '/status',
        aliases: ['web'],
        port: 8001,
      },
    ];
    const expected = fs.readFileSync(
      path.resolve(__dirname, '../fixtures/haproxy-no-health-check.cfg'),
      'utf8',
    );
    const actual = create(services, 'local');
    assert(actual === expected);
  });
});
