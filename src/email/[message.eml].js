import { TEMPLATES, renderEmail, templateName } from "./templates";

/**
 * Both formats of a template as a ready-to-send multipart/alternative email (RFC 2046).
 * Open the downloaded .eml file in your mail app, or hand the two parts to a mailer
 * like Nodemailer: `transport.sendMail({ subject, html, text, ... })`.
 *
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const name = templateName(request.query["template"]);
  const [html, text] = await Promise.all([
    renderEmail.call(this, name, "html"),
    renderEmail.call(this, name, "text"),
  ]);
  const boundary = `jeasx-${crypto.randomUUID()}`;
  const message = [
    "From: Jeasx Expo <noreply@example.com>",
    "To: Ada Lovelace <ada@example.com>",
    `Subject: ${encodeHeader(TEMPLATES[name].subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    // Mail clients show the last part they support, so plain text goes first.
    part(boundary, "text/plain", text),
    part(boundary, "text/html", html),
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return new Response(message, {
    headers: {
      "content-type": "message/rfc822",
      "content-disposition": `attachment; filename="${name}.eml"`,
    },
  });
}

function part(boundary, type, content) {
  // Base64 keeps any character safe; lines must not exceed 76 characters.
  const body = Buffer.from(content).toString("base64").replace(/.{76}/g, "$&\r\n");
  return [
    `--${boundary}`,
    `Content-Type: ${type}; charset=utf-8`,
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");
}

/** Encodes non-ASCII header values as RFC 2047 "encoded words". */
function encodeHeader(value) {
  return /^[\x20-\x7e]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`;
}
