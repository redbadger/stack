import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './schema';
import rootValue from './rootValue';

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  }),
);

app.get('/health', (req, res) => res.end());

app.listen(4000, () => {
  console.log('listening on port 4000');
});

export default app;
