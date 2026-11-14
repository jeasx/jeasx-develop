import { html } from "jsx-async-runtime";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import Layout from "../Layout";
import { MAX_ITEMS, SAMPLE } from "./invoice";

// A simplified version of the "amount due" card in InvoicePdf.jsx.
const SNIPPET = /*jsx*/ `function AmountDue({ gross, due }) {
  return (
    <View x={270}>
      <Rect width={229} height={96} fill="#6d28d9" radius={10} />
      <View x={18} y={24}>
        <Text size={7.5} bold color="#ddd6fe">
          AMOUNT DUE
        </Text>
        <Text y={32} size={24} bold color="#ffffff">
          {euro.format(gross)}
        </Text>
        <Text y={54} size={9} color="#ddd6fe">
          Please pay by {formatDate(due)}
        </Text>
      </View>
    </View>
  );
}`;

const PRIMITIVES = [
  ["<Document title>", "The root element of the PDF."],
  ["<Page>", "Starts a new A4 page."],
  ["<View x y>", "Moves its children, so components draw relative to their own origin."],
  ["<Text x y size bold color align>", "One line of Helvetica text."],
  ["<Rect … radius>", "A box, filled or stroked, with optional rounded corners."],
  ["<Circle cx cy r>", "A circle, drawn with four Bézier curves."],
  ["<Line x1 y1 x2 y2>", "A straight line."],
];

export default function () {
  const rows = Array.from({ length: MAX_ITEMS }, (_, index) => SAMPLE.items[index]);

  return (
    <Layout
      title="PDF invoices with JSX"
      description="Write PDF documents with JSX components, drawn by a tiny PDF writer without any dependency."
      css="/pdf/index.css"
      script="/pdf/index.js"
    >
      <header class="pdf-hero">
        <span class="pdf-kicker">Server-side JSX · no dependencies</span>
        <h1>PDF invoices with JSX</h1>
        <p>
          JSX isn't tied to HTML. Compose a PDF from components, just like a page, and let a tiny
          writer turn it into bytes. Edit the invoice below and watch the PDF update.
        </p>
        <ul class="pdf-chips">
          <li>Components &amp; async</li>
          <li>
            <code>this</code> context
          </li>
          <li>~250-line PDF writer</li>
          <li>No embedded fonts</li>
        </ul>
      </header>

      <div class="pdf-studio">
        <form
          id="invoice-form"
          class="pdf-form"
          action="/pdf/invoice.pdf"
          method="get"
          target="preview"
        >
          <section>
            <h2>
              <span aria-hidden="true">1</span> Customer
            </h2>
            <label>
              Name
              <input name="customer" value={SAMPLE.customer} maxlength="60" required />
            </label>
            <label>
              Address
              <textarea name="address" rows="2" maxlength="200">
                {SAMPLE.address}
              </textarea>
            </label>
            <div class="pdf-pair">
              <label>
                Invoice no.
                <input name="number" value={SAMPLE.number} maxlength="20" />
              </label>
              <label>
                VAT %
                <input name="vat" type="number" value={SAMPLE.vat} min="0" max="100" step="0.1" />
              </label>
            </div>
          </section>

          <section>
            <h2>
              <span aria-hidden="true">2</span> Items
            </h2>
            <div class="pdf-items">
              <span>Description</span>
              <span>Qty</span>
              <span>Price €</span>
              {rows.map((item) => (
                <>
                  <input
                    name="description"
                    value={item?.description}
                    maxlength="60"
                    placeholder="Empty rows are left out"
                    aria-label="Description"
                  />
                  <input
                    name="quantity"
                    type="number"
                    value={item?.quantity ?? 1}
                    min="0"
                    max="9999"
                    aria-label="Quantity"
                  />
                  <input
                    name="price"
                    type="number"
                    value={item?.price ?? ""}
                    step="0.01"
                    aria-label="Unit price"
                  />
                </>
              ))}
            </div>
          </section>

          <footer class="pdf-actions">
            <button type="submit" class="pdf-update">
              Update preview
            </button>
            <span id="status" class="pdf-status" role="status"></span>
          </footer>
        </form>

        <figure class="pdf-viewer">
          <figcaption>
            <span class="pdf-dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span class="pdf-file">invoice.pdf</span>
            <span class="pdf-viewer-actions">
              <button type="submit" form="invoice-form" formtarget="_blank">
                Open
              </button>
              <button
                type="submit"
                form="invoice-form"
                name="download"
                value=""
                formtarget="_self"
                class="pdf-primary"
              >
                Download
              </button>
            </span>
          </figcaption>
          <iframe name="preview" title="Invoice preview" src="/pdf/invoice.pdf"></iframe>
        </figure>
      </div>

      <section class="pdf-how">
        <h2>How it works</h2>
        <ol class="pdf-steps">
          <li>
            <strong>JSX builds a tree</strong>
            <p>
              jsx-async-runtime turns every element into a plain object like{" "}
              <code>{"{ tag, props }"}</code>, which doesn't have to become HTML.
            </p>
          </li>
          <li>
            <strong>renderPdf() walks it</strong>
            <p>
              It calls components (also async ones, with <code>this</code> as context) and collects
              drawing primitives like <code>&lt;Text&gt;</code> and <code>&lt;Rect&gt;</code>.
            </p>
          </li>
          <li>
            <strong>pdf.js writes the bytes</strong>
            <p>
              Numbered objects, operators like <code>BT /F1 10 Tf … Tj ET</code> and a table of byte
              offsets, returned by the route as a <code>Response</code>.
            </p>
          </li>
        </ol>

        <div class="pdf-reference">
          <figure class="pdf-editor">
            <figcaption>
              <span class="pdf-dots" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <code>InvoicePdf.jsx</code>
              <small>JSX</small>
            </figcaption>
            <pre class="pdf-code language-jsx">
              <code>{html(Prism.highlight(SNIPPET, Prism.languages.jsx, "jsx"))}</code>
            </pre>
          </figure>

          <dl class="pdf-primitives">
            {PRIMITIVES.map(([name, description]) => (
              <div>
                <dt>
                  <code>{name}</code>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </Layout>
  );
}
