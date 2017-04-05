const Page = ({ host }) => (
  <div>
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
    <p>
      Welcome to About!
    </p>
  </div>
);

Page.getInitialProps = ({ req }) => ({
  host: process.env['HOSTNAME'] || (req ? 'localhost' : 'client'),
});

export default Page;
