import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const typeDefs = `
type Secret {
  name: String
  value: String
}
type Query {
  server: String
  secrets: [Secret]
  headers: String
}
schema {
  query: Query
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export default schema;
