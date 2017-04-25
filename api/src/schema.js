export default `
type Secret {
  name: String
  value: String
}
type Query {
  server: String
  secrets: [Secret]
  token: String
}
schema {
  query: Query
}
`;
