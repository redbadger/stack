import fetch from 'node-fetch';
import Layout from '../components/layout';

const Page = ({ host, data }) => (
  <Layout title="home" host={host}>
    <p>
      Welcome!
    </p>
    <p>
      from api:
    </p>
    <p>
      {JSON.stringify(data)}
    </p>
  </Layout>
);

Page.getInitialProps = async ({ req }) => {
  const response = await fetch('http://api:4000/graphql', {
    method: 'POST',
    body: JSON.stringify({ query: 'query {server, secret}', variables: null }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return {
    host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
    data,
  };
};

export default Page;
