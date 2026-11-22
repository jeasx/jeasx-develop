import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate, format } from "./formula";
import { DEFAULT_CELLS } from "./grid";

const value = (cells) => evaluate(cells).A1;

test("keeps numbers and text", () => {
  assert.equal(value({ A1: "42" }), 42);
  assert.equal(value({ A1: "Hotel" }), "Hotel");
});

test("calculates formulas", () => {
  assert.equal(value({ A1: "=1+2*3" }), 7);
  assert.equal(value({ A1: "=(1+2)*3" }), 9);
  assert.equal(value({ A1: "=-2+10/4" }), 0.5);
  assert.equal(value({ A1: "=b1*2", B1: "4" }), 8);
  assert.equal(value({ A1: "=SUM(B1:C2)", B1: "1", B2: "2", C1: "3", C2: "x" }), "#VALUE!");
  assert.equal(value({ A1: "=SUM(B1:B3)", B1: "1", B3: "2" }), 3);
});

test("reports errors", () => {
  assert.equal(value({ A1: "=1/0" }), "#DIV/0!");
  assert.equal(value({ A1: "=B1", B1: "=A1" }), "#CYCLE!");
  assert.equal(value({ A1: "=1+" }), "#ERROR!");
  assert.equal(value({ A1: "=B1+1", B1: "=1/0" }), "#DIV/0!");
});

test("calculates the default sheet", () => {
  const values = evaluate(DEFAULT_CELLS);
  assert.equal(values.B6, 2650);
  assert.equal(values.B8, 350);
  assert.equal(format(values.D6), "735");
});
