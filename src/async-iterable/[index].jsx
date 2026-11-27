import Layout from "../Layout";

const PAGES = 5;
const PAGE_SIZE = 3;
const PAGE_DELAY = 700;
const WORD_DELAY = 60;

const ANSWER = `ReadableStreams are rendered chunk by chunk as they arrive. This text comes from a
ReadableStream which emits one word every ${WORD_DELAY} ms. Text chunks are escaped like any other
string, so <b>this markup</b> shows up as plain text. A fetch response body works the same way:
response.body.pipeThrough(new TextDecoderStream()).`.replace(/\s+/g, " ");

export default function () {
  const start = Date.now();

  return (
    <Layout
      title="Render ReadableStreams and async iterables"
      description="Render ReadableStreams and async generators directly in JSX and stream each item as it arrives."
      css="/async-iterable/index.css"
    >
      <h1>Render ReadableStreams and async iterables</h1>
      <p class="lead">
        JSX children can be a <code>ReadableStream</code> or an async iterable: every item is
        streamed to the browser as soon as it is ready.
      </p>
      <p>
        Items are rendered in order, and the markup rendered so far is sent while waiting for the
        next one.
      </p>

      <p class="center">
        <a class="sx-button" href="">
          Watch it again
        </a>
      </p>

      <div class="ai-columns">
        <section>
          <h2>ReadableStreams</h2>
          <p>
            A <code>ReadableStream</code> is rendered chunk by chunk, e.g. a streamed answer from an
            AI service or the decoded body of a <code>fetch</code> response. Its <code>pull</code>{" "}
            method is only called when the renderer wants the next chunk.
          </p>
          <section class="sx-card rs-chat" aria-live="polite">
            <p class="rs-bubble rs-question">How does Jeasx render a ReadableStream?</p>
            <p class="rs-bubble rs-answer">
              {answerStream()}
              <span class="rs-end"></span>
            </p>
          </section>
        </section>
        <section>
          <h2>Async iterables</h2>
          <p>
            A component written as <code>async function*</code> yields markup. It starts once the
            stream is done, as JSX renders in order. This is a natural fit for paginated APIs or
            database cursors: the next page is only loaded when the renderer needs it. If the
            browser stops loading the page, the generator is stopped like a <code>for await</code>{" "}
            loop on <code>break</code>, so its <code>finally</code> block runs and can release
            resources.
          </p>
          <section class="sx-card">
            <header>
              <h3>Releases</h3>
              <small>
                {PAGES} pages of {PAGE_SIZE}, {PAGE_DELAY} ms per page
              </small>
            </header>
            <table class="ai-table">
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
          </section>
        </section>
      </div>
      <Done start={start} />
    </Layout>
  );
}

/** Rendered after the async iterable and the stream are finished. */
function Done({ start }) {
  return <output class="sx-done">All done after {Date.now() - start} ms</output>;
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
      for (const [index, release] of page.items.entries()) {
        yield (
          <tr data-first={index === 0}>
            <td>{release.id}</td>
            <td>{release.name}</td>
            <td>
              <span class="ai-page">
                {page.number} / {PAGES}
              </span>
            </td>
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

/** Emits the answer word by word. `pull` is only called when the renderer wants more. */
function answerStream() {
  const words = ANSWER.split(/(?<= )/);
  return new ReadableStream({
    async pull(controller) {
      await sleep(WORD_DELAY);
      const word = words.shift();
      if (word === undefined) {
        controller.close();
      } else {
        controller.enqueue(word);
      }
    },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
