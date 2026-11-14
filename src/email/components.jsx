import { html } from "jsx-async-runtime";

/**
 * Building blocks for emails. Each one renders in two formats, picked via `this.format`:
 *
 * - "html": table layout with inline styles, as mail clients ignore most CSS
 *   (no flexbox or grid, often no <style> element)
 * - "text": the plain-text alternative that every email should carry
 *
 * The same template thus yields both parts of a multipart email.
 *
 * @typedef {import("../types").ThisContext & { format?: "html" | "text" }} EmailContext
 */

const COLORS = {
  brand: "#6d28d9",
  brandLight: "#8b5cf6",
  accent: "#ec4899",
  tint: "#f5f3ff",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#ece9f5",
  page: "#f4f2fb",
};
/** Gradients for clients that support them; `background-color` stays as fallback (Outlook). */
const GRADIENT = `linear-gradient(120deg, ${COLORS.brandLight}, ${COLORS.accent})`;
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Turns a style object into an inline style string (style objects would render as JSON). */
export function css(styles) {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`)
    .join(";");
}

/** Flattens children like "Hi, {name}!" (an array of parts) into one string for plain text. */
function plain(children) {
  return [children].flat(Infinity).join("");
}

/**
 * Document root: a centered 600px card, the most robust layout across mail clients.
 *
 * @this {EmailContext}
 */
export function Email({ title, preview, brand, footer, children }) {
  if (this.format === "text") {
    return [`*** ${brand} ***\n\n`, children, "--\n", footer, "\n"];
  }
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <title>{title}</title>
        </head>
        <body style={css({ margin: 0, padding: 0, backgroundColor: COLORS.page })}>
          {/* Preview text: shown next to the subject in the inbox, hidden in the email itself. */}
          <div style={css({ display: "none", maxHeight: 0, overflow: "hidden" })}>{preview}</div>
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style={css({ backgroundColor: COLORS.page, fontFamily: FONT })}
          >
            <tr>
              <td align="center" style={css({ padding: "32px 12px" })}>
                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  style={css({
                    width: "100%",
                    maxWidth: "600px",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: "16px",
                    boxShadow: "0 12px 32px -16px rgba(76, 29, 149, 0.25)",
                    color: COLORS.text,
                    overflow: "hidden",
                  })}
                >
                  <tr>
                    <td
                      style={css({
                        height: "6px",
                        lineHeight: "6px",
                        fontSize: 0,
                        backgroundColor: COLORS.brand,
                        backgroundImage: GRADIENT,
                      })}
                    >
                      {html("&nbsp;")}
                    </td>
                  </tr>
                  <Brand name={brand} />
                  {children}
                  <tr>
                    <td style={css({ height: "24px" })}></td>
                  </tr>
                </table>
                <Footer>{footer}</Footer>
              </td>
            </tr>
          </table>
        </body>
      </html>
    </>
  );
}

/** Logo mark and product name at the top of the card. */
function Brand({ name }) {
  return (
    <tr>
      <td style={css({ padding: "24px 40px 0" })}>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td
              width="32"
              height="32"
              align="center"
              style={css({
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: COLORS.brand,
                backgroundImage: GRADIENT,
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: 800,
              })}
            >
              J
            </td>
            <td style={css({ paddingLeft: "10px", fontSize: "16px", fontWeight: 700 })}>{name}</td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

/** Small print below the card, with links. */
function Footer({ children }) {
  const link = css({ color: COLORS.muted, textDecoration: "underline" });
  return (
    <table
      role="presentation"
      width="600"
      cellpadding="0"
      cellspacing="0"
      style={css({ width: "100%", maxWidth: "600px" })}
    >
      <tr>
        <td
          align="center"
          style={css({
            padding: "24px 40px",
            color: COLORS.muted,
            fontSize: "12px",
            lineHeight: 1.6,
          })}
        >
          <a href="https://www.jeasx.dev" style={link}>
            Help center
          </a>
          {" · "}
          <a href="https://www.jeasx.dev" style={link}>
            Email preferences
          </a>
          <br />
          {children}
        </td>
      </tr>
    </table>
  );
}

/**
 * Opening block: icon, headline and intro text.
 *
 * @this {EmailContext}
 */
export function Hero({ icon, title, children }) {
  if (this.format === "text") {
    const text = plain(title);
    return [`${text}\n${"=".repeat(text.length)}\n\n`, children, "\n\n"];
  }
  return (
    <tr>
      <td style={css({ padding: "32px 40px 8px" })}>
        <div
          style={css({
            width: "56px",
            height: "56px",
            lineHeight: "56px",
            borderRadius: "16px",
            backgroundColor: COLORS.tint,
            fontSize: "28px",
            textAlign: "center",
          })}
        >
          {icon}
        </div>
        <h1
          style={css({
            margin: "20px 0 12px",
            fontSize: "26px",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          })}
        >
          {title}
        </h1>
        <p style={css({ margin: 0, fontSize: "16px", lineHeight: 1.6, color: COLORS.muted })}>
          {children}
        </p>
      </td>
    </tr>
  );
}

/**
 * A padded row of the body.
 *
 * @this {EmailContext}
 */
export function Section({ children }) {
  if (this.format === "text") {
    return children;
  }
  return (
    <tr>
      <td style={css({ padding: "16px 40px 0" })}>{children}</td>
    </tr>
  );
}

/**
 * A small uppercase label above a group of content.
 *
 * @this {EmailContext}
 */
export function Heading({ children }) {
  if (this.format === "text") {
    return `${plain(children).toUpperCase()}\n\n`;
  }
  return (
    <h2
      style={css({
        margin: "8px 0 12px",
        color: COLORS.muted,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      })}
    >
      {children}
    </h2>
  );
}

/** @this {EmailContext} */
export function Text({ muted = false, children }) {
  if (this.format === "text") {
    return [children, "\n\n"];
  }
  return (
    <p
      style={css({
        margin: "0 0 16px",
        fontSize: muted ? "14px" : "16px",
        lineHeight: 1.6,
        color: muted ? COLORS.muted : COLORS.text,
      })}
    >
      {children}
    </p>
  );
}

/**
 * A "bulletproof" button: a link styled inside a table cell, so it also works in Outlook.
 *
 * @this {EmailContext}
 */
export function Button({ href, children }) {
  if (this.format === "text") {
    return `${plain(children)}: ${href}\n\n`;
  }
  return (
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style={css({ margin: "8px 0 24px" })}
    >
      <tr>
        <td
          style={css({
            borderRadius: "10px",
            backgroundColor: COLORS.brand,
            backgroundImage: GRADIENT,
            boxShadow: "0 8px 20px -8px rgba(109, 40, 217, 0.6)",
          })}
        >
          <a
            href={href}
            style={css({
              display: "inline-block",
              padding: "14px 28px",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
            })}
          >
            {children} →
          </a>
        </td>
      </tr>
    </table>
  );
}

/**
 * Numbered steps, each with a title and a short description.
 *
 * @this {EmailContext}
 * @param {{ steps: [string, string][] }} param0
 */
export function Steps({ steps }) {
  if (this.format === "text") {
    return [...steps.map(([title, text], i) => `${i + 1}. ${title}: ${text}\n`), "\n"];
  }
  return (
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style={css({ marginBottom: "8px" })}
    >
      {steps.map(([title, text], i) => (
        <tr>
          <td width="44" valign="top" style={css({ paddingBottom: "16px" })}>
            <div
              style={css({
                width: "28px",
                height: "28px",
                lineHeight: "28px",
                borderRadius: "50%",
                backgroundColor: COLORS.tint,
                color: COLORS.brand,
                fontSize: "14px",
                fontWeight: 800,
                textAlign: "center",
              })}
            >
              {i + 1}
            </div>
          </td>
          <td
            valign="top"
            style={css({ paddingBottom: "16px", fontSize: "15px", lineHeight: 1.5 })}
          >
            <strong>{title}</strong>
            <br />
            <span style={css({ color: COLORS.muted })}>{text}</span>
          </td>
        </tr>
      ))}
    </table>
  );
}

/**
 * A tinted box for notes and warnings.
 *
 * @this {EmailContext}
 */
export function Callout({ icon, children }) {
  if (this.format === "text") {
    return ["> ", children, "\n\n"];
  }
  return (
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style={css({ margin: "8px 0 20px" })}
    >
      <tr>
        <td
          style={css({
            borderLeft: `4px solid ${COLORS.brandLight}`,
            borderRadius: "8px",
            backgroundColor: COLORS.tint,
            padding: "14px 16px",
            fontSize: "14px",
            lineHeight: 1.5,
          })}
        >
          {icon && <span style={css({ marginRight: "8px" })}>{icon}</span>}
          {children}
        </td>
      </tr>
    </table>
  );
}

/**
 * Label/value pairs, e.g. order details.
 *
 * @this {EmailContext}
 * @param {{ rows: [string, string][] }} param0
 */
export function KeyValue({ rows }) {
  if (this.format === "text") {
    return [...rows.map(([label, value]) => `${`${label}:`.padEnd(14)}${value}\n`), "\n"];
  }
  const cell = { padding: "4px 0", fontSize: "14px", lineHeight: 1.5 };
  return (
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style={css({ marginBottom: "16px" })}
    >
      {rows.map(([label, value]) => (
        <tr>
          <td width="120" valign="top" style={css({ ...cell, color: COLORS.muted })}>
            {label}
          </td>
          <td style={css({ ...cell, fontWeight: 600 })}>{value}</td>
        </tr>
      ))}
    </table>
  );
}

/** @this {EmailContext} */
export function Divider() {
  if (this.format === "text") {
    return `${"-".repeat(40)}\n\n`;
  }
  return (
    <hr style={css({ margin: "8px 0 24px", border: 0, borderTop: `1px solid ${COLORS.line}` })} />
  );
}

/**
 * Line items with right-aligned amounts and a highlighted total.
 * The text version pads the columns instead.
 *
 * @this {EmailContext}
 * @param {{ rows: [string, string][], total: [string, string] }} param0
 */
export function Table({ rows, total }) {
  if (this.format === "text") {
    const line = ([label, value]) => `${label.padEnd(30)}${value.padStart(10)}\n`;
    return [...rows.map(line), "-".repeat(40), "\n", line(total), "\n"];
  }
  const cell = { padding: "12px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: "15px" };
  const totalCell = { padding: "14px 12px", backgroundColor: COLORS.tint, fontWeight: 800 };
  return (
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style={css({ marginBottom: "20px" })}
    >
      {rows.map(([label, value]) => (
        <tr>
          <td style={css(cell)}>{label}</td>
          <td align="right" style={css({ ...cell, whiteSpace: "nowrap" })}>
            {value}
          </td>
        </tr>
      ))}
      <tr>
        <td colspan="2" style={css({ height: "12px" })}></td>
      </tr>
      <tr>
        <td style={css({ ...totalCell, borderRadius: "8px 0 0 8px", fontSize: "16px" })}>
          {total[0]}
        </td>
        <td
          align="right"
          style={css({
            ...totalCell,
            borderRadius: "0 8px 8px 0",
            color: COLORS.brand,
            fontSize: "18px",
          })}
        >
          {total[1]}
        </td>
      </tr>
    </table>
  );
}
