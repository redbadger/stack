import { buildSchema } from 'graphql';

export default buildSchema(
  `
type Secret {
  name: String
  value: String
}
type Query {
  server: String
  secrets: [Secret]
  token: String
}
`,
);
