import express from 'express';
import graphqlHTTP from 'express-graphql';
import Schema from './schema';

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema: Schema,
    graphiql: true,
  }),
);

app.listen(4000);

export default app;
