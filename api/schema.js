import fs from 'fs';
import Path from 'path';
import Promise from 'bluebird';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      server: {
        type: GraphQLString,
        resolve() {
          return process.env['HOSTNAME'] || 'localhost';
        },
      },
      secrets: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: 'Secret',
            fields: {
              name: { type: GraphQLString },
              value: { type: GraphQLString },
            },
          }),
        ),
        async resolve() {
          const path = '/run/secrets';
          const files = await readdir(path);
          return files.map(async file => ({
            name: file,
            value: await readFile(Path.resolve(path, file), 'utf8'),
          }));
        },
      },
      token: {
        type: GraphQLString,
        resolve: (obj, args, req) => {
          return req.headers['x-extra'];
        },
      },
    },
  }),
});
