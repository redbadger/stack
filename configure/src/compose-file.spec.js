import { create, merge, write } from './compose-file';

describe('compose-file', () => {
  test('should create the correct port overlays', () => {
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
    expect(actual).toEqual(expected);
  });

  test('should merge the files correctly', async () => {
    const filesByStack = {
      a: ['a.yml', 'b.yml', 'c.yml'],
    };
    const expectedCall = [
      'mgr1',
      'docker-compose',
      [
        '-f',
        `${process.cwd()}/a.yml`,
        '-f',
        `${process.cwd()}/b.yml`,
        '-f',
        `${process.cwd()}/c.yml`,
        'config',
      ],
    ];
    let actualCall;
    const actual = { a: 'merged' };
    const expected = await merge(
      async (server, cmd, args) => {
        actualCall = [server, cmd, args];
        return 'merged';
      },
      'mgr1',
      filesByStack,
      false,
    );
    expect(actualCall).toEqual(expectedCall);
    expect(actual).toEqual(expected);
  });

  test('should merge and resolve the files correctly', async () => {
    const filesByStack = {
      a: ['a.yml', 'b.yml', 'c.yml'],
    };
    const expectedCall = [
      'mgr1',
      'docker-compose',
      [
        '-f',
        `${process.cwd()}/a.yml`,
        '-f',
        `${process.cwd()}/b.yml`,
        '-f',
        `${process.cwd()}/c.yml`,
        'config',
        '--resolve-image-digests',
      ],
    ];
    let actualCall;
    const actual = { a: 'merged' };
    const expected = await merge(
      async (server, cmd, args) => {
        actualCall = [server, cmd, args];
        return 'merged';
      },
      'mgr1',
      filesByStack,
      true,
    );
    expect(actualCall).toEqual(expectedCall);
    expect(actual).toEqual(expected);
  });

  test('should write the files correctly', () => {
    const files = {
      a: 'a1',
      b: 'b1',
    };
    const contents = {};
    const paths = write(
      (filePath, content) => {
        contents[filePath] = content;
      },
      files,
      'ports',
    );

    const expectedContents = {
      [`${process.cwd()}/a-ports.yml`]: 'a1',
      [`${process.cwd()}/b-ports.yml`]: 'b1',
    };
    expect(contents).toEqual(expectedContents);

    const expectedFiles = {
      a: 'a-ports.yml',
      b: 'b-ports.yml',
    };
    expect(paths).toEqual(expectedFiles);
  });
});
