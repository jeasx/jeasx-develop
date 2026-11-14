import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Document, Page, Rect, Text, View, renderPdf } from "./jsx";

/** The content stream of the first page, as text. */
async function content(element) {
  const pdf = (await renderPdf(element)).toString("latin1");
  return pdf.slice(pdf.indexOf("stream\n") + 7, pdf.indexOf("\nendstream"));
}

describe("renderPdf", () => {
  it("writes a PDF file", async () => {
    const pdf = await renderPdf(
      <Document title="Test">
        <Page />
      </Document>,
    );
    assert.equal(pdf.subarray(0, 8).toString(), "%PDF-1.4");
    assert.match(pdf.toString("latin1"), /\/Title \(Test\)/);
    assert.match(pdf.toString("latin1"), /%%EOF\n$/);
  });

  it("calls components, also async ones, with this as context", async () => {
    async function Greeting({ name }) {
      await Promise.resolve();
      return (
        <Text>
          Hello {name} from {this.site}
        </Text>
      );
    }
    const pdf = await renderPdf(
      <Document>
        <Page>
          <Greeting name="Ada" />
        </Page>
      </Document>,
      { site: "Jeasx" },
    );
    assert.match(pdf.toString("latin1"), /\(Hello Ada from Jeasx\) Tj/);
  });

  it("moves the children of View", async () => {
    const ops = await content(
      <Document>
        <Page>
          <View x={10} y={20}>
            <View x={5}>
              <Rect x={1} y={2} width={3} height={4} fill="#ff0000" />
            </View>
          </View>
        </Page>
      </Document>,
    );
    // x = 10 + 5 + 1, and y counts from the bottom in PDF: 841.89 - (20 + 2) - 4.
    assert.match(ops, /16 815.89 3 4 re f/);
  });

  it("escapes text and encodes it for Helvetica", async () => {
    const ops = await content(
      <Document>
        <Page>
          <Text>(1) \ 5 € 😀</Text>
        </Page>
      </Document>,
    );
    assert.ok(ops.includes("(\\(1\\) \\\\ 5 \x80 ?) Tj"));
  });

  it("rejects what it can't draw", async () => {
    await assert.rejects(renderPdf(<Text>Hi</Text>), /<Text> must be inside <Document>/);
    await assert.rejects(
      renderPdf(<Document>{"loose text"}</Document>),
      /must be wrapped in <Text>/,
    );
    await assert.rejects(
      renderPdf(
        <Document>
          <div />
        </Document>,
      ),
      /<div> can't be drawn/,
    );
  });

  it("fails loudly when a primitive is rendered as HTML", () => {
    assert.throws(() => Text({}), /only works inside renderPdf/);
  });
});
