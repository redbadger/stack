import Head from 'next/head';
import Link from 'next/link';

const Page = ({ host }) => (
  <div>
    <Head>
      <title>Hey</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <p>
      (rendered by {host})
      <style jsx>
        {
          `
        p {
          color: red;
        }
      `
        }
      </style>
    </p>
    <div>Click <Link href="/about"><a>here</a></Link> to read more</div>
  </div>
);

Page.getInitialProps = ({ req }) => ({
  host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
});

export default Page;
