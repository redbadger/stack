import { expect } from 'chai';
import { create, merge, write } from './compose-file';

describe('compose-file', () => {
  it('should create the correct port overlays', () => {
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
    expect(actual).to.deep.equal(expected);
  });

  it('should merge the files correctly', async () => {
    const filesByStack = {
      a: ['a.yml', 'b.yml', 'c.yml'],
    };
    const expectedCall = [
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
    const expected = await merge(async (cmd, args) => {
      actualCall = [cmd, args];
      return 'merged';
    }, filesByStack);
    expect(actualCall).to.deep.equal(expectedCall);
    expect(actual).to.deep.equal(expected);
  });

  it('should write the files correctly', () => {
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
      'ports-',
    );

    const expectedContents = {
      [`${process.cwd()}/ports-a.yml`]: 'a1',
      [`${process.cwd()}/ports-b.yml`]: 'b1',
    };
    expect(contents).to.deep.equal(expectedContents);

    const expectedFiles = {
      a: 'ports-a.yml',
      b: 'ports-b.yml',
    };
    expect(paths).to.deep.equal(expectedFiles);
  });
});
