import { deflateSync, inflateSync } from "node:zlib";

// A few KB of compressed cookie could otherwise expand to many MB.
const MAX_INFLATED_SIZE = 64 * 1024;

/**
 * @param {any} obj
 */
export function compress(obj) {
  return deflateSync(JSON.stringify(obj)).toString("base64");
}

/**
 * Throws if the data is invalid or inflates beyond MAX_INFLATED_SIZE.
 *
 * @param {string} compressed
 */
export function decompress(compressed) {
  return compressed
    ? JSON.parse(
        inflateSync(Buffer.from(compressed, "base64"), {
          maxOutputLength: MAX_INFLATED_SIZE,
        }).toString(),
      )
    : undefined;
}
