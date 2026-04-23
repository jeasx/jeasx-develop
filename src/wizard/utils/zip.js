import { deflateSync, inflateSync } from "node:zlib";

/**
 * @param {any} obj
 */
export function compress(obj) {
  return deflateSync(JSON.stringify(obj)).toString("base64");
}

/**
 * @param {string} compressed
 */
export function decompress(compressed) {
  return compressed
    ? JSON.parse(inflateSync(Buffer.from(compressed, "base64")).toString())
    : undefined;
}
