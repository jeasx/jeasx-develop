import Layout from "../Layout";

const PAGES = 5;
const PAGE_SIZE = 3;
const PAGE_DELAY = 700;

/**
 * @this {import("../types").ThisContext}
 */
export default function () {
  this.jsxStream = true;
  const start = Date.now();

  return (
    <Layout
      title="Render async iterables"
      description="Render async generators directly in JSX and stream each item as it arrives."
    >
      <h1>Render async iterables</h1>
      <p>
        Besides promises, JSX children can be async iterables, e.g. an async generator. Their items
        are rendered in order as they arrive. With <code>this.jsxStream = true</code> the markup
        rendered so far is sent to the browser while waiting for the next item.{" "}
        <a href="">Reload</a> to watch it again.
      </p>
      <p>
        A component can be an <code>async function*</code> which yields JSX. This is a natural fit
        for paginated APIs or database cursors: the next page is only loaded when the renderer needs
        it, and each page is streamed as soon as it is ready. If the browser stops loading the page,
        the generator is stopped like a <code>for await</code> loop on <code>break</code>, so its{" "}
        <code>finally</code> block runs and can release resources.
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Release</th>
            <th>Page</th>
            <th>Flushed after</th>
          </tr>
        </thead>
        <tbody>
          <Releases start={start} />
        </tbody>
      </table>

      <Done start={start} />
    </Layout>
  );
}

/** Rendered after both async iterables are finished. */
function Done({ start }) {
  return (
    <p class="center">
      <strong>All done after {Date.now() - start} ms.</strong>
    </p>
  );
}

/**
 * Walks through all pages of a paginated API and yields one table row per item.
 * The renderer pulls the next row only when the previous one is rendered.
 */
async function* Releases({ start }) {
  const connection = openConnection();
  try {
    let cursor = 1;
    while (cursor) {
      const page = await connection.fetchPage(cursor);
      for (const release of page.items) {
        yield (
          <tr>
            <td>{release.id}</td>
            <td>{release.name}</td>
            <td>{page.number}</td>
            <td>{Date.now() - start} ms</td>
          </tr>
        );
      }
      cursor = page.next;
    }
  } finally {
    // Runs when all pages are rendered, but also when rendering fails or the browser aborts.
    connection.close();
  }
}

/** Simulates a connection to a slow, paginated API. */
function openConnection() {
  return {
    async fetchPage(number) {
      await sleep(PAGE_DELAY);
      return {
        number,
        next: number < PAGES ? number + 1 : null,
        items: Array.from({ length: PAGE_SIZE }, (_, i) => {
          const id = (number - 1) * PAGE_SIZE + i + 1;
          return { id, name: `v1.${id - 1}.0` };
        }),
      };
    },
    close() {},
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
