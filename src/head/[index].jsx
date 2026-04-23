import Layout from "../Layout";

export default function () {
  return (
    <Layout title="Default title" description="Default description">
      <h1>A Helmet for the HTML-Head</h1>
      <p>
        In Jeasx you can easily implement a helmet like functionality: use head-tags in any
        sub-component and beam the title, meta tags, styles and scripts into the head of your
        document. You only have to wire up a simple guard which takes care of the process. Have a
        look at the source to see how it works.
      </p>
      <Subcomponent />
    </Layout>
  );
}

function Subcomponent() {
  return (
    <section class="highlight">
      <h2>This is a subcomponent</h2>
      <p>If you want to add something to your head, just go ahead...</p>
      <head>
        <title>Use Helmet in Jeasx</title>
        <meta name="description" value="Move head tags to the head of a document." />
        <style>{
          /* css */ `.highlight { background-color: var(--mu-accent); text-align: center; padding: 1rem;}`
        }</style>
      </head>
    </section>
  );
}
