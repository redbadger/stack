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
    },
  }),
});
