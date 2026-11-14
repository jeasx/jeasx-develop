import { Fragment, isJsxNode } from "jsx-async-runtime";
import { Document as PdfWriter } from "./pdf";

/**
 * Renders JSX to a PDF instead of HTML.
 *
 * JSX elements of jsx-async-runtime are plain objects like `{ tag, props }`, so the tree can
 * be walked without turning it into markup: components (also async ones) are called with
 * `this` as context, and the primitives below are drawn with the tiny PDF writer.
 *
 * - `<Document title>`: the root element.
 * - `<Page>`: starts a new page.
 * - `<View x y>`: moves its children, so components can draw relative to their own origin.
 * - `<Text x y size bold color align>`: a line of text; its children must be strings or numbers.
 * - `<Rect x y width height fill stroke lineWidth radius>`, `<Circle cx cy r fill stroke>`,
 *   `<Line x1 y1 x2 y2 color lineWidth>`: shapes.
 *
 * All coordinates are points from the top left corner of the page (or the enclosing View).
 *
 * @param {JSX.Element} element
 * @param {object} [context] Passed to components as `this`.
 * @returns {Promise<Buffer<ArrayBuffer>>}
 */
export async function renderPdf(element, context = {}) {
  /** @type {PdfWriter | undefined} */
  let writer;

  /** @param {{ x: number, y: number }} origin */
  async function walk(node, origin) {
    node = await node;
    if (node == null || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        await walk(child, origin);
      }
      return;
    }
    if (!isJsxNode(node) || node.type !== "tag") {
      throw new Error(`Text like ${JSON.stringify(node)} must be wrapped in <Text>.`);
    }

    const { tag, props } = node;
    const { children, ...attributes } = props;
    if (tag === Fragment) {
      return walk(children, origin);
    }
    if (tag === Document) {
      writer = new PdfWriter({ title: attributes.title });
      return walk(children, origin);
    }
    if (!writer && PRIMITIVES.includes(tag)) {
      throw new Error(`<${/** @type {Function} */ (tag).name}> must be inside <Document>.`);
    }
    /** @type {(x?: number, y?: number) => [number, number]} */
    const at = (x = 0, y = 0) => [origin.x + x, origin.y + y];

    switch (tag) {
      case Page:
        writer.addPage();
        return walk(children, { x: 0, y: 0 });
      case View: {
        const [x, y] = at(attributes.x, attributes.y);
        return walk(children, { x, y });
      }
      case Text: {
        const { x, y, ...options } = attributes;
        writer.text(await toText(children), ...at(x, y), options);
        return;
      }
      case Rect: {
        const { x, y, width, height, ...options } = attributes;
        writer.rect(...at(x, y), width, height, options);
        return;
      }
      case Circle: {
        const { cx, cy, r, ...options } = attributes;
        writer.circle(...at(cx, cy), r, options);
        return;
      }
      case Line: {
        const { x1, y1, x2, y2, ...options } = attributes;
        writer.line(...at(x1, y1), ...at(x2, y2), options);
        return;
      }
    }
    if (typeof tag === "function") {
      return walk(await tag.call(context, props), origin);
    }
    throw new Error(`<${tag}> can't be drawn in a PDF.`);
  }

  await walk(element, { x: 0, y: 0 });
  if (!writer) {
    throw new Error("The root element must be <Document>.");
  }
  return writer.toBuffer();
}

/** Joins the children of <Text> into one string. */
async function toText(children) {
  children = await children;
  if (children == null || typeof children === "boolean") {
    return "";
  }
  if (Array.isArray(children)) {
    return (await Promise.all(children.map(toText))).join("");
  }
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  throw new Error("<Text> only takes strings and numbers as children.");
}

// The primitives are only markers for renderPdf(), which never calls them.
// Rendering them as HTML by mistake fails loudly instead of printing nothing.
const primitive = (name) =>
  Object.defineProperty(
    function () {
      throw new Error(`<${name}> only works inside renderPdf().`);
    },
    "name",
    { value: name },
  );

/** @type {(props: { title?: string, children?: unknown }) => JSX.Element} */
export const Document = primitive("Document");
/** @type {(props: { children?: unknown }) => JSX.Element} */
export const Page = primitive("Page");
/** @type {(props: { x?: number, y?: number, children?: unknown }) => JSX.Element} */
export const View = primitive("View");
/** @type {(props: { x?: number, y?: number, children?: unknown } & import("./pdf").TextOptions) => JSX.Element} */
export const Text = primitive("Text");
/** @type {(props: { x?: number, y?: number, width: number, height: number, fill?: string, stroke?: string, lineWidth?: number, radius?: number }) => JSX.Element} */
export const Rect = primitive("Rect");
/** @type {(props: { cx: number, cy: number, r: number, fill?: string, stroke?: string, lineWidth?: number }) => JSX.Element} */
export const Circle = primitive("Circle");
/** @type {(props: { x1: number, y1: number, x2: number, y2: number, color?: string, lineWidth?: number }) => JSX.Element} */
export const Line = primitive("Line");

/** @type {unknown[]} */
const PRIMITIVES = [Page, View, Text, Rect, Circle, Line];
