import Layout from "./Layout";
import Actions from "./components/Actions";
import Choices from "./components/Choices";
import Field from "./components/Field";
import {
  BAG_PRICE,
  INSURANCE_RATE,
  INVOICE_LIMIT,
  SEATS_TOGETHER_PRICE,
  findDestination,
  formatPrice,
} from "./domain/catalog";
import { travelers } from "./domain/travelers";
import type { StepProps } from "./domain/types";

export default function ({ step, data, form, errors }: StepProps) {
  const destination = findDestination(data.trip?.destination);
  const seated = travelers(data.trip).filter((p) => p.kind !== "infant").length;
  const stored = form.card_last4 && !form.card_number;
  return (
    <Layout step={step} data={data} errors={errors}>
      <Choices
        name="bags"
        legend="Checked bags per traveler"
        variant="tiles"
        class="bags"
        value={form.bags ?? "0"}
        error={errors.bags}
        options={[
          { value: "0", label: "🎒 Cabin bag", detail: "Included" },
          {
            value: "1",
            label: "🧳 1 bag",
            detail: `+${formatPrice(BAG_PRICE)} per leg`,
          },
          {
            value: "2",
            label: "🧳🧳 2 bags",
            detail: `+${formatPrice(2 * BAG_PRICE)} per leg`,
          },
        ]}
      />

      {seated > 1 && (
        <label class="toggle">
          <input type="checkbox" name="seats" role="switch" checked={form.seats === "on"} />
          <span>
            <strong>Sit together</strong>
            <small>
              Reserve adjacent seats for {seated} travelers, {formatPrice(SEATS_TOGETHER_PRICE)}{" "}
              each per leg.
            </small>
          </span>
        </label>
      )}

      {destination?.passport && (
        <Choices
          name="insurance"
          legend={`Travel insurance for ${destination.country}`}
          variant="segments"
          value={form.insurance}
          error={errors.insurance}
          options={[
            {
              value: "yes",
              label: `🛡️ Insure my trip (+${Math.round(INSURANCE_RATE * 100)}%)`,
            },
            { value: "no", label: "No, thanks" },
          ]}
        />
      )}

      <Choices
        name="payment"
        legend="Payment"
        variant="segments"
        value={form.payment}
        error={errors.payment}
        options={[
          { value: "card", label: "💳 Card" },
          {
            value: "invoice",
            label: `🧾 Invoice (up to ${formatPrice(INVOICE_LIMIT)})`,
          },
        ]}
      />
      {/* Shown by CSS when "Card" is selected, so it works without JavaScript. */}
      <div class="card-fields">
        <div class="card-preview" aria-hidden="true">
          <span class="card-chip" />
          <span class="card-brand" data-card-brand>
            {form.card_brand ?? ""}
          </span>
          <span class="card-number" data-card-number>
            {stored ? `•••• •••• •••• ${form.card_last4}` : "•••• •••• •••• ••••"}
          </span>
          <span class="card-name" data-card-name>
            {form.card_name || "YOUR NAME"}
          </span>
          <span class="card-expiry" data-card-expiry>
            {form.card_expiry || "MM/YY"}
          </span>
        </div>
        <Field
          name="card_name"
          label="Name on card"
          autocomplete="cc-name"
          value={form.card_name}
          error={errors.card_name}
        />
        <Field
          name="card_number"
          label="Card number"
          inputmode="numeric"
          autocomplete="cc-number"
          placeholder={
            stored ? `${form.card_brand} ending in ${form.card_last4}` : "4242 4242 4242 4242"
          }
          hint={
            stored
              ? "Your card is saved. Enter a number only to use another card."
              : "Try 4242 4242 4242 4242. Card numbers are never stored."
          }
          value={form.card_number}
          error={errors.card_number}
        />
        {form.card_last4 && <input type="hidden" name="card_last4" value={form.card_last4} />}
        {form.card_brand && <input type="hidden" name="card_brand" value={form.card_brand} />}
        <div class="row">
          <Field
            name="card_expiry"
            label="Expiry"
            inputmode="numeric"
            autocomplete="cc-exp"
            placeholder="MM/YY"
            maxlength="5"
            value={form.card_expiry}
            error={errors.card_expiry}
          />
          <Field
            name="card_cvc"
            label="Security code"
            inputmode="numeric"
            autocomplete="cc-csc"
            placeholder="123"
            maxlength="4"
            error={errors.card_cvc}
          />
        </div>
      </div>
      <Actions next="Review" />
    </Layout>
  );
}
