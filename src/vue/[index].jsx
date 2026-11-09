import { PLANETS } from "../@helpers/planets";
import Layout from "../Layout";
import Vue from "./Vue";

export default function () {
  return (
    <Layout
      title="Use Vue with Jeasx"
      description="Render Vue components on the server and hydrate them as interactive islands."
      css="/vue/index.css"
      script="/vue/index.js"
    >
      <section class="center">
        <h1>Use Vue with Jeasx</h1>
        <p>
          <a href="https://vuejs.org">Vue</a> is a reactive UI framework. Jeasx renders Vue
          components on the server and hydrates them in the browser, so you get islands of
          interactivity in otherwise static pages.
        </p>
      </section>
      <details>
        <summary>How do I integrate Vue with Jeasx?</summary>
        <p>Install Vue and the esbuild plugin for single-file components:</p>
        <pre>
          <code>npm install vue unplugin-vue</code>
        </pre>
        <p>
          Then register the plugin for the server and the browser build in{" "}
          <code>jeasx.config.js</code>:
        </p>
        <pre>
          <code>
            {`export default {
  // The server imports this config at startup too, so import build-only plugins lazily.
  ESBUILD_SERVER_OPTIONS: async () => {
    const { default: vuePlugin } = await import("unplugin-vue/esbuild");
    return { plugins: [vuePlugin({ ssr: true, sourceMap: false })] };
  },

  ESBUILD_BROWSER_OPTIONS: async () => {
    const { default: vuePlugin } = await import("unplugin-vue/esbuild");
    return {
      // Vue's feature flags: avoid a console warning and drop unused code.
      define: {
        __VUE_OPTIONS_API__: "false",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      },
      plugins: [vuePlugin({ sourceMap: false })],
    };
  },
};`}
          </code>
        </pre>
        <p>
          The styles of all components imported by a browser bundle end up in a CSS file next to it
          (e.g. <code>index.css</code> next to <code>index.js</code>). Link it in your page, so the
          components are styled before hydration and without JavaScript.
        </p>
        <p>
          On the server, <code>renderToString</code> from <code>vue/server-renderer</code> turns a
          component into HTML. In the browser, <code>createSSRApp(...).mount()</code> takes over
          this markup without rendering it again.
        </p>
        <p>
          Have a look at the{" "}
          <a href="https://github.com/jeasx/jeasx-expo/tree/main/src/vue">
            source code of this page
          </a>{" "}
          to see how the components are rendered on the server and hydrated in the browser.
        </p>
      </details>
      <section>
        <h2>Planet explorer</h2>
        <p>
          Search, filter and sort the planets. <code>computed</code> derives the visible list, and{" "}
          <code>&lt;TransitionGroup&gt;</code> animates the cards to their new positions. Click a
          planet to reveal a fact.
        </p>
        <Vue component="Planets" planets={PLANETS} />
      </section>
      <hr />
      <section>
        <h2>Kanban board</h2>
        <p>
          Drag tasks between columns, or use the arrow buttons. The counts and the progress bar
          update on their own, because they are computed from the same reactive state.
        </p>
        <Vue
          component="Kanban"
          columns={["To do", "Doing", "Done"]}
          cards={[
            { title: "Install Vue", column: "Done" },
            { title: "Register unplugin-vue", column: "Done" },
            { title: "Render on the server", column: "Doing" },
            { title: "Hydrate in the browser", column: "To do" },
            { title: "Ship it", column: "To do" },
          ]}
        />
      </section>
    </Layout>
  );
}
