import { makeExecutableSchema } from 'graphql-tools';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import typeDefs from './schema';
import resolvers from './resolvers';

const app = express();

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

app.get('/health', (req, res) => res.end());

app.listen(4000, () => {
  console.log('listening on port 4000');
});

export default app;
