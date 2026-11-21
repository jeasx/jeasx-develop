import Layout from "./Layout";
import Actions from "./components/Actions";
import Choices from "./components/Choices";
import Field from "./components/Field";
import { CABINS, DESTINATIONS, LIMITS, formatPrice } from "./domain/catalog";
import { addDays, addMonths, toDateString, today } from "./domain/dates";
import type { StepProps } from "./domain/types";

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

export default function ({ step, data, form, errors }: StepProps) {
  const start = today();
  return (
    <Layout step={step} data={data} errors={errors}>
      <Choices
        name="destination"
        legend="Destination"
        variant="tiles"
        value={form.destination}
        error={errors.destination}
        options={DESTINATIONS.map((d) => ({
          value: d.id,
          style: `--hue: ${d.hue}`,
          label: (
            <>
              <span class="tile-flag" aria-hidden="true">
                {d.flag}
              </span>
              <span class="tile-city">{d.city}</span>
              <span class="tile-code">{d.code}</span>
            </>
          ),
          detail: (
            <>
              <span>{d.tagline}</span>
              <span class="tile-price">from {formatPrice(d.fare)}</span>
            </>
          ),
        }))}
      />

      <Choices
        name="type"
        legend="Trip"
        variant="segments"
        value={form.type ?? "return"}
        error={errors.type}
        options={[
          { value: "return", label: "⇄ Return" },
          { value: "oneway", label: "→ One-way" },
        ]}
      />
      <div class="row">
        <Field
          name="depart"
          label="Departure"
          type="date"
          value={form.depart}
          error={errors.depart}
          min={toDateString(addDays(start, 1))}
          max={toDateString(addMonths(start, 12))}
        />
        {/* Hidden by CSS for one-way trips, so it works without JavaScript. */}
        <Field
          name="return"
          label="Return"
          type="date"
          class="only-return"
          value={form.return}
          error={errors.return}
          min={toDateString(addDays(start, 2))}
        />
      </div>

      <div class="row row-3">
        <Choices
          name="adults"
          legend="Adults (18+)"
          value={form.adults ?? "1"}
          error={errors.adults}
          options={range(1, LIMITS.adults).map((n) => ({ value: n, label: n }))}
        />
        <Choices
          name="children"
          legend="Children (2–17)"
          value={form.children ?? "0"}
          error={errors.children}
          options={range(0, LIMITS.children).map((n) => ({
            value: n,
            label: n,
          }))}
        />
        <Choices
          name="infants"
          legend="Infants (under 2)"
          value={form.infants ?? "0"}
          error={errors.infants}
          options={range(0, LIMITS.infants).map((n) => ({
            value: n,
            label: n,
          }))}
        />
      </div>

      <Choices
        name="cabin"
        legend="Cabin"
        variant="tiles"
        class="cabins"
        value={form.cabin ?? "economy"}
        error={errors.cabin}
        options={CABINS.map((c) => ({
          value: c.id,
          label: c.label,
          detail: (
            <>
              <span>{c.perk}</span>
              <span class="tile-price">{c.factor === 1 ? "base fare" : `× ${c.factor}`}</span>
            </>
          ),
        }))}
      />
      <Actions back={false} next="Travelers" />
    </Layout>
  );
}
