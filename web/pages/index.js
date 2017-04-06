import Layout from '../components/layout';
import fetch from 'node-fetch';

const Page = ({ host, data }) => (
  <Layout title="home" host={host}>
    <p>
      Welcome!
    </p>
    <p>
      from api:
      {JSON.stringify(data)}
    </p>
  </Layout>
);

const query = { query: 'query {server}', variables: null };
Page.getInitialProps = async ({ req }) => {
  const response = await fetch('http://api:4000/graphql', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return {
    host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
    data,
  };
};

export default Page;
