import Layout from "../Layout";

export default function () {
  return (
    <Layout title="Default title" description="Default description">
      <h1>A Helmet for the HTML-Head</h1>
      <p>
        In Jeasx you can build helmet-like functionality yourself: put a head tag into any
        subcomponent, and its title, meta tags, styles and scripts are moved into the head of the
        document. A small guard takes care of this. Have a look at the source to see how it works.
      </p>
      <Subcomponent />
    </Layout>
  );
}

function Subcomponent() {
  return (
    <section class="highlight">
      <h2>This is a subcomponent</h2>
      <p>This component adds its own title, description and styles to the head of the page.</p>
      <head>
        <title>Use Helmet in Jeasx</title>
        <meta name="description" content="Move head tags to the head of a document." />
        <style>{
          /* css */ `.highlight { background-color: var(--mu-accent); text-align: center; padding: 1rem;}`
        }</style>
      </head>
    </section>
  );
}
