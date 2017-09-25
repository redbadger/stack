import Layout from '../components/layout';

const Page = ({ host }) => (
  <Layout title="home" host={host}>
    <p>
      About us ...
    </p>
  </Layout>
);

Page.getInitialProps = ({ req }) => ({
  host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
});

export default Page;
