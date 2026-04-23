import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Implement Active Search with HTMX and Jeasx"
      description="Implementing active search with HTMX and Jeasx"
      script="./index.js"
    >
      <h1>Active Search with HTMX and Jeasx</h1>
      <p>
        Implementing <a href="https://htmx.org/examples/active-search">Active Search</a> with HTMX
        and Jeasx is straightforward. This example uses{" "}
        <a href="https://nominatim.org/release-docs/latest/api/Search">Nominatim</a> from
        OpenStreetMap to provide addresses for a search query.
      </p>
      <input
        type="search"
        name="search"
        placeholder="Begin Typing To Search for Locations..."
        hx-post="./locations"
        hx-trigger="input changed delay:500ms, keyup[key=='Enter']"
        hx-target="#results"
        hx-indicator=".htmx-indicator"
        autofocus
      />
      <div class="htmx-indicator">Searching...</div>
      <div id="results"></div>
    </Layout>
  );
}
