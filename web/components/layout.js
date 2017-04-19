import Link from 'next/link';
import Head from 'next/head';

export default ({ host, children, title = '!!!' }) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header>
      <nav>
        <Link href="/"><a>Home</a></Link> |
        <Link href="/about"><a>About</a></Link> |
      </nav>
    </header>

    {children}

    <footer>
      (rendered by {host})
      <style jsx>
        {`
        footer {
          color: red;
        }
      `}
      </style>
    </footer>
  </div>
);
