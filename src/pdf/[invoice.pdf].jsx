import { parseInvoice } from "./invoice";
import InvoicePdf from "./InvoicePdf";
import { renderPdf } from "./jsx";

/**
 * Returns the invoice of the form as a PDF: shown in the browser, or downloaded with "?download".
 *
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default async function ({ request }) {
  const query = /** @type {Record<string, unknown>} */ (request.query);
  const invoice = parseInvoice(query);
  const filename = `invoice-${invoice.number.replace(/[^\w-]/g, "")}.pdf`;
  // The JSX tree is drawn as PDF instead of being rendered as HTML.
  const pdf = await renderPdf(<InvoicePdf invoice={invoice} />, this);
  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${"download" in query ? "attachment" : "inline"}; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
