import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Implement active search with HTMX and Jeasx"
      description="Search addresses as you type with HTMX, Jeasx and Nominatim."
      script="/nominatim/index.js"
    >
      <h1>Active search with HTMX and Jeasx</h1>
      <p>
        Implementing <a href="https://htmx.org/examples/active-search">active search</a> with HTMX
        and Jeasx is straightforward. This example uses{" "}
        <a href="https://nominatim.org/release-docs/latest/api/Search">Nominatim</a> from
        OpenStreetMap to find addresses: the results update while you type, without reloading the
        page.
      </p>
      <input
        type="search"
        name="search"
        placeholder="Start typing an address or place, e.g. Brandenburg Gate..."
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
