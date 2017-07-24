import { expect } from 'chai';
import { create } from './compose-file';

describe('compose-file overlay', () => {
  it('should create the correct content', () => {
    const services = [
      {
        stack: 'services',
        name: 'visualizer',
        aliases: [],
        port: 8080,
      },
      {
        stack: 'app',
        name: 'rproxy',
        aliases: ['web'],
        port: 80,
      },
      {
        stack: 'app',
        name: 'gateway',
        aliases: ['api'],
        port: 8000,
      },
      {
        stack: 'app',
        name: 'gateway1',
        aliases: ['api1'],
        port: 8001,
      },
    ];
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

`,
    };
    const actual = create(services);
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  });
});
