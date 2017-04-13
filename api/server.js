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

app.get('/health', (req, res) => res.end());

app.listen(4000);

export default app;
