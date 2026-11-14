import { jsxToStream } from "jsx-async-runtime";

/**
 * Streams JSX into an element in the browser.
 *
 * jsxToStream() sends the markup rendered so far whenever a component waits,
 * e.g. for data. Each chunk is appended to the markup so far and the whole
 * thing is assigned to innerHTML: the browser closes the tags that are still
 * open, so every intermediate state is valid, partial markup.
 *
 * With `placeholder` and `count`, placeholder markup fills the element up to
 * `count` children until the real children have arrived, so its height stays
 * the same while it loads.
 *
 * Aborting the signal cancels the stream, which stops the runtime from calling
 * further components, and leaves the element as it is.
 *
 * @param {Element} element
 * @param {JSX.Element} jsx
 * @param {{ signal?: AbortSignal, placeholder?: string, count?: number }} [options]
 */
export default async function streamInto(
  element,
  jsx,
  { signal, placeholder = "", count = 0 } = {},
) {
  const reader = jsxToStream(jsx).getReader();
  const cancel = () => reader.cancel().catch(() => {});
  if (signal?.aborted) {
    cancel();
    return;
  }
  signal?.addEventListener("abort", cancel, { once: true });
  let html = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (signal?.aborted) {
        return;
      }
      if (!done) {
        html += value;
      }
      element.innerHTML = html;
      if (done) {
        return;
      }
      const missing = count - element.children.length;
      if (placeholder && missing > 0) {
        element.insertAdjacentHTML("beforeend", placeholder.repeat(missing));
      }
    }
  } catch (error) {
    if (!signal?.aborted) {
      element.textContent = `Rendering failed: ${error.message}`;
    }
  } finally {
    signal?.removeEventListener("abort", cancel);
  }
}
