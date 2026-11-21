import Layout from "./Layout";
import Actions from "./components/Actions";
import Field from "./components/Field";
import { findDestination } from "./domain/catalog";
import { travelers } from "./domain/travelers";
import type { StepProps } from "./domain/types";

const KINDS = { adult: "Adult", child: "Child", infant: "Infant" };

/**
 * One card per traveler, as many as chosen in the first step. Passports are only asked for
 * destinations that require them.
 */
export default function ({ step, data, form, errors }: StepProps) {
  const destination = findDestination(data.trip?.destination);
  const people = travelers(data.trip);
  return (
    <Layout step={step} data={data} errors={errors}>
      {destination?.passport && (
        <p class="notice">
          <span aria-hidden="true">🛂</span> {destination.country} requires a passport which is
          valid for at least 6 months after your trip.
        </p>
      )}
      <ol class="people">
        {people.map(({ key, kind, n }, index) => (
          <li class="person">
            <h2 class="person-head">
              <span class={`person-badge person-${kind}`} aria-hidden="true">
                {kind === "infant" ? "👶" : kind === "child" ? "🧒" : "🧑"}
              </span>
              {KINDS[kind]} {n}
              {index === 0 && <span class="person-lead">Lead traveler</span>}
            </h2>
            <div class="row">
              <Field
                name={`${key}_first`}
                label="First name"
                autocomplete={index === 0 ? "given-name" : "off"}
                value={form[`${key}_first`]}
                error={errors[`${key}_first`]}
              />
              <Field
                name={`${key}_last`}
                label="Last name"
                autocomplete={index === 0 ? "family-name" : "off"}
                value={form[`${key}_last`]}
                error={errors[`${key}_last`]}
              />
            </div>
            <div class="row">
              <Field
                name={`${key}_birth`}
                label="Date of birth"
                type="date"
                value={form[`${key}_birth`]}
                error={errors[`${key}_birth`]}
              />
              {!destination?.passport && <span />}
              {destination?.passport && (
                <Field
                  name={`${key}_passport`}
                  label="Passport number"
                  autocapitalize="characters"
                  spellcheck="false"
                  placeholder="C01X00T47"
                  value={form[`${key}_passport`]}
                  error={errors[`${key}_passport`]}
                />
              )}
            </div>
            {destination?.passport && (
              <div class="row">
                <Field
                  name={`${key}_expiry`}
                  label="Passport valid until"
                  type="date"
                  value={form[`${key}_expiry`]}
                  error={errors[`${key}_expiry`]}
                />
                <span />
              </div>
            )}
          </li>
        ))}
      </ol>
      <section class="contact">
        <h2>Where should we send your tickets?</h2>
        <div class="row">
          <Field
            name="email"
            label="Email"
            type="email"
            autocomplete="email"
            placeholder="ada@example.com"
            value={form.email}
            error={errors.email}
          />
          <Field
            name="phone"
            label="Mobile phone"
            type="tel"
            autocomplete="tel"
            placeholder="+49 30 1234567"
            value={form.phone}
            error={errors.phone}
          />
        </div>
      </section>
      <Actions next="Extras" />
    </Layout>
  );
}
