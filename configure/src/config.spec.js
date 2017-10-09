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
  test('should get services from the config', () => {
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
    expect(actual).toEqual(expected);
  });
  test('should get compose files from the config', () => {
    const expected = {
      services: ['services.yml'],
      app: ['app.yml'],
    };
    const actual = getComposeFiles(config.stacks);
    expect(actual).toEqual(expected);
  });
});
