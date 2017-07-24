import { expect } from 'chai';
import { getServices, getComposeFiles } from './config';

describe('config', () => {
  const config = {
    stacks: [
      {
        name: 'services',
        'compose-files': ['services.yml'],
        services: [{ name: 'visualizer' }],
      },
      {
        name: 'app',
        'compose-files': ['app.yml'],
        services: [{ name: 'rproxy', aliases: ['web'] }],
      },
    ],
  };
  it('should get services from the config', () => {
    const expected = [
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
    const actual = getServices(config);
    expect(actual).to.deep.equal(expected);
  });
  it('should get compose files from the config', async () => {
    const expected = {
      services: ['contents of services.yml'],
      app: ['contents of app.yml'],
    };
    const actual = await getComposeFiles(async f => `contents of ${f}`, config.stacks);
    expect(actual).to.deep.equal(expected);
  });
});
