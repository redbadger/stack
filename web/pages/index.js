import Head from 'next/head';
import Link from 'next/link';

const Page = ({ host }) => (
  <div>
    <Head>
      <title>Hey</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <p>Hey! (from {host})</p>
    <div>Click <Link href="/about"><a>here</a></Link> to read more</div>
  </div>
);

Page.getInitialProps = ({ req }) => ({
  host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
});

export default Page;
