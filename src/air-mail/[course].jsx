import Chunk from "./Chunk";
import { validSeed } from "./course";

/** Chunks per request; the browser asks again from where it left off. */
const COUNT = 200;
/** Courses are long, but not endless. */
const LAST = 100000;

/**
 * Streams the course from the requested chunk on, one chunk per line. Thanks
 * to backpressure, the next chunk is only rendered when the browser reads on.
 *
 * @this {import("../types").ThisContext}
 */
export default function ({ request, reply }) {
  const query = /** @type {Record<string, string>} */ (request.query);
  const seed = validSeed(query.seed);
  const from = Math.max(0, Math.min(LAST, Number.parseInt(query.from, 10) || 0));
  reply.header("cache-control", "no-store");
  return <Course seed={seed} from={from} />;
}

/** Yields chunk after chunk; each one is flushed while the generator waits for the next. */
async function* Course({ seed, from }) {
  for (let index = from; index < Math.min(from + COUNT, LAST); index++) {
    yield (
      <>
        <Chunk seed={seed} index={index} />
        {"\n"}
      </>
    );
  }
}
