import { html as raw } from "jsx-async-runtime";
import * as prettier from "prettier";
import Prism from "prismjs";
import Layout from "../Layout";
import { TEMPLATES, renderEmail, templateName } from "./templates";

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const name = templateName(request.query["template"]);
  const [html, text] = await Promise.all([
    renderEmail.call(this, name, "html"),
    renderEmail.call(this, name, "text"),
  ]);
  const query = `?template=${name}`;

  return (
    <Layout
      title="JSX for emails"
      description="Write HTML emails with JSX components and get the plain-text version from the same template."
      css="/email/index.css"
    >
      <header class="em-hero">
        <span class="em-kicker">Server-side JSX</span>
        <h1>JSX for emails</h1>
        <p class="lead">
          HTML emails are stuck in the past: mail clients ignore most CSS, so layouts are built from
          tables with inline styles. JSX components hide this mess behind tidy building blocks like{" "}
          <code>&lt;Heading&gt;</code>, <code>&lt;Button&gt;</code> or <code>&lt;Table&gt;</code>,
          and templates read like any other page.
        </p>
      </header>

      <ul class="em-features">
        <li>
          <span aria-hidden="true">📐</span>
          <strong>Bulletproof markup</strong>
          <small>Tables and inline styles that survive Gmail, Outlook and Apple Mail.</small>
        </li>
        <li>
          <span aria-hidden="true">📝</span>
          <strong>Plain text for free</strong>
          <small>
            Components read <code>this.format</code> and render <code>"html"</code> or{" "}
            <code>"text"</code> from the same template.
          </small>
        </li>
        <li>
          <span aria-hidden="true">⚡</span>
          <strong>Async components</strong>
          <small>The receipt loads its order while rendering, like any other page.</small>
        </li>
      </ul>

      <nav class="em-picker" aria-label="Template">
        {Object.entries(TEMPLATES).map(([key, { title, icon, description }]) => (
          <a href={`?template=${key}`} aria-current={key === name ? "page" : undefined}>
            <span class="em-picker-icon" aria-hidden="true">
              {icon}
            </span>
            <strong>{title}</strong>
            <small>{description}</small>
          </a>
        ))}
      </nav>

      <section class="em-window" aria-label="Email preview">
        <div class="em-chrome" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
          <span>Inbox — ada@example.com</span>
        </div>
        <header class="em-message">
          <span class="em-avatar" aria-hidden="true">
            J
          </span>
          <div>
            <strong>{TEMPLATES[name].subject}</strong>
            <small>
              Jeasx Expo &lt;noreply@example.com&gt; <span aria-hidden="true">→</span> Ada Lovelace
              &lt;ada@example.com&gt;
            </small>
            <span class="em-chips">
              <span>multipart/alternative</span>
              <span>text/html · {size(html)}</span>
              <span>text/plain · {size(text)}</span>
            </span>
          </div>
          <a class="em-download" href={`/email/message.eml${query}`} download>
            <span aria-hidden="true">⬇</span> Download .eml
          </a>
        </header>
        <div class="em-panes">
          <figure>
            <figcaption>
              <span class="em-dot" data-kind="html"></span> HTML <small>{size(html)}</small>
            </figcaption>
            <iframe
              title="HTML version"
              src={`/email/preview${query}&format=html`}
              loading="lazy"
            ></iframe>
          </figure>
          <figure>
            <figcaption>
              <span class="em-dot" data-kind="text"></span> Plain text <small>{size(text)}</small>
            </figcaption>
            <iframe
              class="em-plain"
              title="Plain-text version"
              src={`/email/preview${query}&format=text`}
              loading="lazy"
            ></iframe>
          </figure>
        </div>
      </section>

      <section class="em-source">
        <h2>Generated HTML</h2>
        <p>
          What the components above turn into: nested tables and inline styles, formatted with
          Prettier and highlighted with Prism on the server.
        </p>
        <figure class="em-editor">
          <figcaption>
            <span class="em-chrome-dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <code>{name}.html</code>
            <small>{size(html)}</small>
          </figcaption>
          <pre class="em-code">
            <code>{raw(await highlight(html))}</code>
          </pre>
        </figure>
      </section>
    </Layout>
  );
}

function size(text) {
  return `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`;
}

/** Formats the compact email markup with Prettier and highlights it with Prism. */
async function highlight(markup) {
  const formatted = await prettier.format(markup, {
    parser: "html",
    printWidth: 100,
    tabWidth: 1,
    bracketSameLine: true,
  });
  return Prism.highlight(formatted, Prism.languages.markup, "markup");
}
