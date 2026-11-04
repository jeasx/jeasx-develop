import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { niceTicks, scaleLinear, spreadLabels } from "./scale";

describe("scaleLinear", () => {
  it("maps the domain to the range", () => {
    const y = scaleLinear([0, 100], [300, 0]);
    assert.equal(y(0), 300);
    assert.equal(y(50), 150);
    assert.equal(y(100), 0);
  });
});

describe("niceTicks", () => {
  it("returns round ticks which include min and max", () => {
    assert.deepEqual(niceTicks(-4.3, 25.6, 6), [-5, 0, 5, 10, 15, 20, 25, 30]);
    assert.deepEqual(niceTicks(0, 285, 5), [0, 100, 200, 300]);
  });

  it("avoids floating point noise", () => {
    assert.deepEqual(niceTicks(0, 0.3, 3), [0, 0.1, 0.2, 0.3]);
  });
});

describe("spreadLabels", () => {
  it("keeps a minimum gap between labels", () => {
    const labels = spreadLabels([{ y: 10 }, { y: 12 }, { y: 50 }], 16);
    assert.deepEqual(
      labels.map(({ y }) => y),
      [10, 26, 50],
    );
  });
});
