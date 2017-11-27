import express from 'express';
import graphqlHTTP from 'express-graphql';
import winston from 'winston';
import expressWinston from 'express-winston';

import schema from './schema';

const port = process.env.PORT;
const app = express();

process.on('SIGTERM', () => {
  process.exit(0);
});

app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true,
      }),
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function(req, res) {
      return req.path === '/_health';
    }, // optional: allows to skip some log messages based on request and/or response
  }),
);

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
