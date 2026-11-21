import assert from "node:assert/strict";
import { test } from "node:test";
import { checkout, findDiscount } from "./checkout";
import { SHIPPING, isServerAction, reduce, toItems, totals } from "./state";

test("adds, increases, decreases and removes items by id", () => {
  let state = reduce({ items: [] }, { add: "tea" });
  state = reduce(state, { increase: "tea" });
  assert.deepEqual(state.items, [{ id: "tea", qty: 2 }]);
  state = reduce(state, { decrease: "tea" });
  state = reduce(state, { decrease: "tea" });
  assert.deepEqual(state.items, []);
  assert.deepEqual(reduce({ items: [] }, { add: "unknown" }).items, []);
});

test("caps quantities", () => {
  const state = reduce({ items: [{ id: "tea", qty: 9 }] }, { add: "tea" });
  assert.equal(state.items[0].qty, 9);
});

test("computes totals in cents with discount, shipping and VAT", () => {
  const small = totals({ items: [{ id: "tea", qty: 1 }] });
  assert.equal(small.shipping, SHIPPING);
  assert.equal(small.total, 790 + SHIPPING);

  const big = totals({ items: [{ id: "teapot", qty: 3 }], discount: findDiscount("SAVE10") });
  assert.equal(big.discount, 567);
  assert.equal(big.shipping, 0);
  assert.equal(big.total, 5103);
  assert.equal(big.vat, 815);
});

test("only the server applies discount codes", () => {
  assert.equal(isServerAction({ applyCode: "1" }), true);
  assert.equal(isServerAction({ add: "tea" }), false);
  assert.equal(checkout({ items: [] }, { applyCode: "1", code: " save10 " }).discount?.code, "SAVE10");
  const wrong = checkout({ items: [] }, { applyCode: "1", code: "nope" });
  assert.equal(wrong.discount, undefined);
  assert.match(wrong.error ?? "", /not a valid code/);
  assert.equal(findDiscount("toString"), undefined);
});

test("placing an order empties the cart and drops the code", () => {
  const state = checkout(
    { items: [{ id: "tea", qty: 2 }], discount: findDiscount("FREESHIP") },
    { order: "1" },
  );
  assert.deepEqual(state.items, []);
  assert.equal(state.discount, undefined);
  assert.deepEqual(state.ordered, { total: 1580, count: 2 });
});

test("drops invalid cookie items", () => {
  assert.deepEqual(toItems([{ id: "tea", qty: 2 }, { id: "x", qty: 1 }, { id: "tea", qty: 99 }]), [
    { id: "tea", qty: 2 },
  ]);
});
