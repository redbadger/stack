import fs from 'fs';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

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
      secret: {
        type: GraphQLString,
        resolve() {
          return new Promise((resolve, reject) => {
            fs.readFile(
              '/run/secrets/my_secret',
              (e, a) => e != null ? reject(e) : resolve(a),
            );
          });
        },
      },
    },
  }),
});
