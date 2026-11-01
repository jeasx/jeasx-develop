import Layout from "../Layout";

export default function () {
  return (
    <Layout title="Default title" description="Default description">
      <h1>Manage the head from any component</h1>
      <p>
        Like React Helmet, but built in userland: put a <code>&lt;head&gt;</code> tag into any
        component, and its title, meta tags, styles and scripts are moved into the head of the
        document. Duplicate titles and descriptions are replaced by the last one. A small guard
        takes care of this; have a look at the source to see how it works.
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
        <title>Manage the head » Jeasx - JSX with Ease</title>
        <meta
          name="description"
          content="Add titles, meta tags and styles to the head of the page from any component."
        />
        <style>{
          /* css */ `.highlight { background-color: var(--mu-accent); text-align: center; padding: 1rem;}`
        }</style>
      </head>
    </section>
  );
}
