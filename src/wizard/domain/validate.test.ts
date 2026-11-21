import assert from "node:assert/strict";
import { test } from "node:test";
import quote from "./price";
import { firstIncomplete, nextStep } from "./steps";
import validate, { cardBrand, luhn } from "./validate";

const now = new Date("2026-11-21T12:00:00Z");
const trip = {
  destination: "jfk",
  type: "return",
  depart: "2027-03-01",
  return: "2027-03-10",
  adults: "1",
  children: "1",
  infants: "0",
  cabin: "economy",
};
const travelers = {
  t0_first: "Ada",
  t0_last: "Lovelace",
  t0_birth: "1990-12-10",
  t0_passport: "C01X00T47",
  t0_expiry: "2030-01-01",
  t1_first: "Kid",
  t1_last: "Lovelace",
  t1_birth: "2018-05-01",
  t1_passport: "C01X00T48",
  t1_expiry: "2030-01-01",
  email: "ada@example.com",
  phone: "+49 30 1234567",
};
const extras = {
  bags: "1",
  insurance: "no",
  payment: "card",
  card_name: "Ada Lovelace",
  card_last4: "4242",
  card_brand: "Visa",
  card_expiry: "12/29",
};
const data = { trip, travelers, extras, review: { terms: "on" } };

test("a complete booking has no errors", () => {
  assert.equal(firstIncomplete(data, now), undefined);
});

test("checks dates against today and each other", () => {
  assert.ok(validate("trip", { trip: { ...trip, depart: "2026-11-21" } }, now).depart);
  assert.ok(validate("trip", { trip: { ...trip, return: "2027-03-01" } }, now).return);
  assert.ok(validate("trip", { trip: { ...trip, return: "2027-04-15" } }, now).return);
  assert.ok(validate("trip", { trip: { ...trip, depart: "2027-02-31" } }, now).depart);
  assert.equal(
    validate("trip", { trip: { ...trip, type: "oneway", return: "" } }, now).return,
    undefined,
  );
});

test("infants need a lap", () => {
  assert.ok(validate("trip", { trip: { ...trip, infants: "2" } }, now).infants);
});

test("checks ages on the day of departure and passports after the trip", () => {
  const errors = validate(
    "travelers",
    {
      trip,
      travelers: {
        ...travelers,
        t0_birth: "2009-03-02",
        t0_expiry: "2027-06-01",
      },
    },
    now,
  );
  assert.match(errors.t0_birth, /18 on departure/);
  assert.match(errors.t0_expiry, /6 months/);
});

test("a changed trip invalidates later steps", () => {
  const more = { ...data, trip: { ...trip, adults: "2" } };
  assert.equal(firstIncomplete(more, now), "travelers");
  assert.ok(validate("travelers", more, now).t2_first);
});

test("Next skips steps which are already complete", () => {
  assert.equal(nextStep("trip", data, now), "review");
  assert.equal(nextStep("trip", { trip }, now), "travelers");
});

test("validates cards and limits invoices", () => {
  assert.ok(luhn("4242424242424242"));
  assert.ok(!luhn("4242424242424241"));
  assert.equal(cardBrand("378282246310005"), "Amex");
  const card = {
    ...extras,
    card_last4: "",
    card_number: "4242 4242 4242 4242",
    card_cvc: "12",
  };
  assert.ok(validate("extras", { trip, extras: card }, now).card_cvc);
  assert.ok(
    validate("extras", { trip, extras: { ...extras, card_expiry: "02/27" } }, now).card_expiry,
  );
  const business = {
    ...data,
    trip: { ...trip, cabin: "business" },
    extras: { ...extras, payment: "invoice" },
  };
  assert.ok(quote(business).total > 250000);
  assert.match(validate("extras", business, now).payment, /pay by card/);
});
