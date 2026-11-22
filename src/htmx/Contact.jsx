// A contact card in its two states. Both are complete elements with the same id, so HTMX can
// replace one with the other ("outerHTML"). Every action is also a plain link or form,
// which reloads the page without JavaScript.
import { FIELDS } from "./contacts";

/**
 * @param {{ contact: import("./contacts").Contact, saved?: boolean }} props
 */
export function ContactView({ contact, saved = false }) {
  return (
    <article
      id={`contact-${contact.id}`}
      class={`cte-card${saved ? " cte-saved" : ""}`}
      style={`--hue: ${contact.hue}`}
    >
      <div class="cte-head">
        <Avatar contact={contact} />
        <div>
          <h2>{contact.name}</h2>
          <p>{contact.role}</p>
        </div>
        {saved && (
          <span class="cte-badge" role="status">
            ✓ Saved
          </span>
        )}
      </div>
      <dl class="cte-fields">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{contact.phone || <span class="cte-empty">not set</span>}</dd>
        </div>
      </dl>
      <a
        href={`/htmx?edit=${contact.id}`}
        hx-get={`/htmx/contact?id=${contact.id}&edit`}
        hx-target={`#contact-${contact.id}`}
        hx-swap="outerHTML"
        role="button"
        class="cte-edit outline"
        aria-label={`Edit ${contact.name}`}
      >
        ✎ Edit
      </a>
    </article>
  );
}

/**
 * The form keeps what was typed, so errors can be fixed without starting over.
 *
 * @param {{ contact: import("./contacts").Contact, values?: Record<string, string | number>,
 *   errors?: import("./contacts").Errors }} props
 */
export function ContactForm({ contact, values = contact, errors = {} }) {
  const id = contact.id;
  return (
    <form
      id={`contact-${id}`}
      class="cte-card cte-editing"
      style={`--hue: ${contact.hue}`}
      method="post"
      action="/htmx"
      hx-post="/htmx/contact"
      hx-target={`#contact-${id}`}
      hx-swap="outerHTML"
      novalidate
    >
      <input type="hidden" name="id" value={id} />
      <div class="cte-head">
        <Avatar contact={contact} />
        <div>
          <h2>Edit {contact.name}</h2>
          <p>Press Escape to cancel</p>
        </div>
      </div>
      <div class="cte-inputs">
        {FIELDS.map(({ name, label, type, autocomplete }, index) => (
          <label>
            {label}
            <input
              // @ts-ignore
              type={type}
              name={name}
              value={values[name]}
              maxlength="60"
              autocomplete={autocomplete}
              autofocus={index === 0}
              aria-invalid={errors[name] ? "true" : undefined}
              aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
            />
            {errors[name] && (
              <small id={`${id}-${name}-error`} class="cte-error">
                {errors[name]}
              </small>
            )}
          </label>
        ))}
      </div>
      <div class="cte-actions">
        <a
          href="/htmx"
          hx-get={`/htmx/contact?id=${id}`}
          hx-target={`#contact-${id}`}
          hx-swap="outerHTML"
          // Escape anywhere in the form cancels, too.
          hx-trigger={`click, keyup[key=='Escape'] from:#contact-${id}`}
          role="button"
          class="outline secondary"
        >
          Cancel
        </a>
        <button type="submit">
          <span class="cte-spinner" aria-hidden="true" />
          Save
        </button>
      </div>
    </form>
  );
}

/**
 * The last change, shown above the cards. After a save, the fragment route sends a new
 * copy along with the card ("hx-swap-oob"), and HTMX puts it in place by its id.
 *
 * @param {{ message?: string, oob?: boolean }} props
 */
export function Activity({ message = "", oob = false }) {
  return (
    <p id="activity" class="cte-activity" role="status" hx-swap-oob={oob ? "true" : undefined}>
      {message || "No changes yet. Click Edit on any card."}
    </p>
  );
}

/** @param {{ contact: import("./contacts").Contact }} props */
function Avatar({ contact }) {
  const initials = contact.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span class="cte-avatar" aria-hidden="true">
      {initials || "?"}
    </span>
  );
}
