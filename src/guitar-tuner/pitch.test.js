import assert from "node:assert/strict";
import { test } from "node:test";
import { STRINGS, detectPitch, nearestString, noteOf } from "./pitch";

const RATE = 44100;

/** A plucked-string-like tone with overtones. */
function tone(frequency, length = 4096) {
  return Float32Array.from({ length }, (_, i) => {
    const t = (2 * Math.PI * frequency * i) / RATE;
    return 0.5 * Math.sin(t) + 0.3 * Math.sin(2 * t) + 0.15 * Math.sin(3 * t);
  });
}

test("detects the open strings within a cent", () => {
  for (const string of STRINGS) {
    const detected = detectPitch(tone(string.frequency), RATE);
    assert.ok(Math.abs(noteOf(detected).cents) <= 1, `${string.name}${string.octave}: ${detected}`);
    assert.equal(nearestString(detected), string);
  }
});

test("ignores silence", () => {
  assert.equal(detectPitch(new Float32Array(4096), RATE), null);
});

test("names notes and cents", () => {
  assert.deepEqual(noteOf(440), { name: "A", octave: 4, midi: 69, cents: 0 });
  assert.equal(noteOf(445).cents, 20);
  assert.equal(noteOf(82.41).name, "E");
});
