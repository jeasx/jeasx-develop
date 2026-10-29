import Layout from "../Layout";

const WORD_DELAY = 60;

const ANSWER = `Async iterables are rendered item by item as they arrive. This text comes from a
ReadableStream which emits one word every ${WORD_DELAY} ms. Text chunks are escaped like any other
string, so <b>this markup</b> shows up as plain text. A fetch response body works the same way:
response.body.pipeThrough(new TextDecoderStream()).`.replace(/\s+/g, " ");

/**
 * @this {import("../types").ThisContext}
 */
export default function () {
  this.jsxStream = true;
  const start = Date.now();

  return (
    <Layout
      title="ReadableStream as children"
      description="Render ReadableStreams directly in JSX and stream each item as it arrives."
    >
      <h1>ReadableStream as children</h1>
      <p>
        Besides promises, JSX children can be a <code>ReadableStream</code>. Items are rendered in
        order as they arrive. With <code>this.jsxStream = true</code> the markup rendered so far is
        sent to the browser while waiting for the next item. <a href="">Reload</a> to watch it
        again.
      </p>
      <p>
        A <code>ReadableStream</code> of strings or JSX can be used as children directly, e.g. a
        streamed answer from an AI service or the decoded body of a <code>fetch</code> response.
      </p>
      <article>
        <p>{answerStream()}</p>
      </article>
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
