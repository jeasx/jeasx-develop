import Layout from "./Layout";
import Actions from "./components/Actions";
import FieldError from "./components/FieldError";
import { ORIGIN, findCabin, findDestination, formatPrice } from "./domain/catalog";
import { formatDate } from "./domain/dates";
import quote from "./domain/price";
import { href } from "./domain/steps";
import { travelers } from "./domain/travelers";
import type { StepProps } from "./domain/types";

/**
 * Everything at a glance, each part with a link back to its step. The guard only lets you
 * here once all steps are valid, and checks them once more when you book.
 */
export default function ({ step, data, form, errors }: StepProps) {
  const { trip = {}, travelers: names = {}, extras = {} } = data;
  const destination = findDestination(trip.destination);
  const price = quote(data);
  return (
    <Layout step={step} data={data} errors={errors}>
      <Section title="Flight" step="trip">
        <p class="review-route">
          {ORIGIN.city} {trip.type === "oneway" ? "→" : "⇄"} {destination?.flag} {destination?.city}
        </p>
        <p>
          {formatDate(trip.depart)}
          {trip.type === "return" && <> – {formatDate(trip.return)}</>} ·{" "}
          {findCabin(trip.cabin)?.label}
        </p>
      </Section>
      <Section title="Travelers" step="travelers">
        <ul class="review-people">
          {travelers(trip).map(({ key, kind }) => (
            <li>
              <span>
                {names[`${key}_first`]} {names[`${key}_last`]}
              </span>
              <small>
                {kind} · born {formatDate(names[`${key}_birth`])}
                {destination?.passport && (
                  <>
                    {" "}
                    · passport •••
                    {String(names[`${key}_passport`] ?? "")
                      .slice(-3)
                      .toUpperCase()}
                  </>
                )}
              </small>
            </li>
          ))}
        </ul>
        <p>
          <small>
            Tickets go to {names.email} · {names.phone}
          </small>
        </p>
      </Section>
      <Section title="Extras & payment" step="extras">
        <p>
          {extras.bags === "0"
            ? "Cabin bags only"
            : `${extras.bags} checked bag${extras.bags === "2" ? "s" : ""} per traveler`}
          {extras.seats === "on" && " · seats together"}
          {destination?.passport && (extras.insurance === "yes" ? " · insured" : " · no insurance")}
        </p>
        <p>
          {extras.payment === "card"
            ? `💳 ${extras.card_brand} ending in ${extras.card_last4}`
            : "🧾 Invoice, due 14 days after booking"}
        </p>
      </Section>

      <div class="field terms" data-field="terms">
        <label class="toggle">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={form.terms === "on"}
            aria-invalid={errors.terms ? "true" : undefined}
            aria-describedby="terms-error"
          />
          <span>
            <strong>I accept the conditions of carriage</strong>
            <small>This is a demo: nothing is booked, charged or sent anywhere.</small>
          </span>
        </label>
        <FieldError name="terms" error={errors.terms} />
      </div>
      <Actions next={`Book for ${formatPrice(price?.total ?? 0)}`} />
    </Layout>
  );
}

function Section({ title, step, children }) {
  return (
    <section class="review-section">
      <header>
        <h2>{title}</h2>
        <a href={href(step)}>Edit</a>
      </header>
      {children}
    </section>
  );
}
