/**
 * Constants shared by the server, which renders the landscape, and the
 * browser, which flies the plane over it.
 */

export const WIDTH = 320;
export const HEIGHT = 180;
/** The course is streamed in chunks, each one screen wide. */
export const CHUNK = 320;
/** Distance between two points of a chunk's collision outline. */
export const SAMPLE = 8;
/** Airstrips are flat at this height, so the plane can start on the first one. */
export const STRIP_Y = 148;
/** The plane flies at this distance from the left edge of the screen. */
export const PLANE_X = 90;
/** Chunks rendered into the page by the server; the rest are streamed. */
export const FIRST_CHUNKS = 3;
/** The sun stands still in the sky; the sky and the lens flare both use it. */
export const SUN = { x: 262, y: 34 };
