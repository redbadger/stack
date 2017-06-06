import express from 'express';
import graphqlHTTP from 'express-graphql';

import schema from './schema';

const port = process.env.PORT;
const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

app.get('/_health', (req, res) => res.end());

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

export default app;
