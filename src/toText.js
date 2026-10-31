/**
 * Returns the payload as string; collects streams (Node or Web) into a string.
 * Returns undefined for anything else.
 * Response handlers need it, as a streamed payload has to be complete before it can be changed.
 *
 * @param {unknown} payload
 * @returns {Promise<string | undefined>}
 */
export default async function toText(payload) {
  if (typeof payload === "string") {
    return payload;
  }
  if (isAsyncIterable(payload)) {
    const decoder = new TextDecoder();
    let text = "";
    for await (const chunk of payload) {
      text += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
    }
    return text + decoder.decode();
  }
  return undefined;
}

/**
 * @param {unknown} value
 * @returns {value is AsyncIterable<string | Uint8Array>}
 */
function isAsyncIterable(value) {
  return value != null && typeof value[Symbol.asyncIterator] === "function";
}
