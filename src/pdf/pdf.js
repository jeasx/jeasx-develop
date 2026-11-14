/**
 * A tiny PDF writer without dependencies: pages with text, lines, (rounded) rectangles and circles in the
 * built-in Helvetica fonts, which every PDF viewer has, so no font needs to be embedded.
 * Coordinates are in points (1/72 inch) from the top left corner, unlike PDF itself,
 * which counts from the bottom left. For images, custom fonts or automatic layout,
 * use a library like PDFKit or pdf-lib.
 */

/** A4 in points. */
export const A4 = { width: 595.28, height: 841.89 };

// Widths of the characters " " to "~" in Helvetica, in 1/1000 of the font size
// (from the font's Adobe Font Metrics). Needed to center or right-align text.
// prettier-ignore
const WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

// Characters which WinAnsiEncoding (Windows-1252) puts at other codes than Unicode.
const WIN_ANSI = {
  "€": 0x80,
  "…": 0x85,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
};

/**
 * Width of a text in points. Bold is a bit wider than regular Helvetica;
 * digits, which matter most for right-aligned amounts, have the same width in both.
 *
 * @param {string} text
 * @param {number} size
 * @param {boolean} [bold]
 */
export function textWidth(text, size, bold = false) {
  let width = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    width += code >= 32 && code <= 126 ? WIDTHS[code - 32] : 556;
  }
  return (width * size * (bold ? 1.05 : 1)) / 1000;
}

/**
 * @typedef {object} TextOptions
 * @property {number} [size] Font size in points (default 10).
 * @property {boolean} [bold]
 * @property {string} [color] Hex color like "#1e293b".
 * @property {"left" | "center" | "right"} [align] Relative to x.
 */

export class Document {
  /** @type {string[][]} Content operators of each page. */
  #pages = [];
  #title;

  /** @param {{ title?: string, width?: number, height?: number }} [options] */
  constructor({ title = "", width = A4.width, height = A4.height } = {}) {
    this.#title = title;
    this.width = width;
    this.height = height;
  }

  /** Starts a new page; all drawing goes to the last page. */
  addPage() {
    this.#pages.push([]);
    return this;
  }

  get #ops() {
    if (this.#pages.length === 0) {
      this.addPage();
    }
    return this.#pages[this.#pages.length - 1];
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y Baseline of the text, from the top.
   * @param {TextOptions} [options]
   */
  text(text, x, y, { size = 10, bold = false, color = "#000000", align = "left" } = {}) {
    const width = textWidth(text, size, bold);
    const left = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
    this.#ops.push(
      `BT ${rgb(color)} rg /${bold ? "F2" : "F1"} ${num(size)} Tf ${num(left)} ${num(this.height - y)} Td (${escape(text)}) Tj ET`,
    );
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y Top edge, from the top.
   * @param {number} width
   * @param {number} height
   * @param {{ fill?: string, stroke?: string, lineWidth?: number, radius?: number }} options
   */
  rect(x, y, width, height, { fill, stroke, lineWidth = 1, radius = 0 }) {
    const path = radius
      ? roundedPath(x, this.height - y - height, width, height, radius)
      : `${num(x)} ${num(this.height - y - height)} ${num(width)} ${num(height)} re`;
    const paint = fill && stroke ? "B" : fill ? "f" : "S";
    this.#ops.push(
      `${fill ? `${rgb(fill)} rg ` : ""}${stroke ? `${rgb(stroke)} RG ${num(lineWidth)} w ` : ""}${path} ${paint}`,
    );
    return this;
  }

  /**
   * @param {number} cx Center, from the left.
   * @param {number} cy Center, from the top.
   * @param {number} r
   * @param {{ fill?: string, stroke?: string, lineWidth?: number }} options
   */
  circle(cx, cy, r, options) {
    return this.rect(cx - r, cy - r, 2 * r, 2 * r, { ...options, radius: r });
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {{ color?: string, lineWidth?: number }} [options]
   */
  line(x1, y1, x2, y2, { color = "#000000", lineWidth = 1 } = {}) {
    this.#ops.push(
      `${rgb(color)} RG ${num(lineWidth)} w ${num(x1)} ${num(this.height - y1)} m ${num(x2)} ${num(this.height - y2)} l S`,
    );
    return this;
  }

  /**
   * Writes the PDF file: numbered objects, followed by a table with the byte offset
   * of each object (the "xref"), so viewers can jump to any object directly.
   *
   * @returns {Buffer<ArrayBuffer>}
   */
  toBuffer() {
    if (this.#pages.length === 0) {
      this.addPage();
    }
    const pageCount = this.#pages.length;
    // Object numbers: 1 catalog, 2 page tree, 3 + 4 fonts, 5 info, then a page and its content each.
    const pageIds = this.#pages.map((_, index) => 6 + index * 2);
    /** @type {(string | Buffer)[]} */
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      `<< /Title (${escape(this.#title)}) /Producer (Jeasx) /CreationDate (${pdfDate(new Date())}) >>`,
    ];
    for (const [index, ops] of this.#pages.entries()) {
      const content = encode(ops.join("\n"));
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(this.width)} ${num(this.height)}] ` +
          `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageIds[index] + 1} 0 R >>`,
        Buffer.concat([
          encode(`<< /Length ${content.length} >>\nstream\n`),
          content,
          encode("\nendstream"),
        ]),
      );
    }

    // The binary comment tells tools that the file contains non-ASCII bytes.
    const chunks = [encode("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")];
    let length = chunks[0].length;
    const offsets = objects.map((object, index) => {
      const offset = length;
      const chunk = Buffer.concat([
        encode(`${index + 1} 0 obj\n`),
        typeof object === "string" ? encode(object) : object,
        encode("\nendobj\n"),
      ]);
      chunks.push(chunk);
      length += chunk.length;
      return offset;
    });
    chunks.push(
      encode(
        [
          "xref",
          `0 ${objects.length + 1}`,
          // Every entry must be exactly 20 bytes long, including "\r\n" or " \n".
          "0000000000 65535 f ",
          ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
          "trailer",
          `<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>`,
          "startxref",
          String(length),
          "%%EOF",
          "",
        ].join("\n"),
      ),
    );
    // Buffer.concat() always allocates a plain (not shared) ArrayBuffer, which Response accepts
    // as a body. Some versions of the Node types don't say so, hence the cast.
    return /** @type {Buffer<ArrayBuffer>} */ (Buffer.concat(chunks));
  }
}

/** Encodes text for the Helvetica fonts; characters they don't have become "?". */
function encode(text) {
  const bytes = Buffer.alloc(text.length);
  let length = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 63;
    bytes[length++] = WIN_ANSI[char] ?? (code < 256 && (code < 0x80 || code > 0x9f) ? code : 63);
  }
  return bytes.subarray(0, length);
}

/** Escapes the characters which end or break a PDF string; drops line breaks. */
function escape(text) {
  return String(text)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\\()]/g, "\\$&");
}

/**
 * A rectangle with rounded corners in PDF coordinates (x, y is the bottom left corner).
 * PDF has no arcs, so each corner is a cubic Bézier curve: with control points at
 * 0.5523 times the radius, it is almost exactly a quarter circle.
 */
function roundedPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  const k = r * 0.5523;
  const [x0, y0, x1, y1] = [x, y, x + width, y + height];
  return [
    `${num(x0 + r)} ${num(y0)} m`,
    `${num(x1 - r)} ${num(y0)} l`,
    `${num(x1 - r + k)} ${num(y0)} ${num(x1)} ${num(y0 + r - k)} ${num(x1)} ${num(y0 + r)} c`,
    `${num(x1)} ${num(y1 - r)} l`,
    `${num(x1)} ${num(y1 - r + k)} ${num(x1 - r + k)} ${num(y1)} ${num(x1 - r)} ${num(y1)} c`,
    `${num(x0 + r)} ${num(y1)} l`,
    `${num(x0 + r - k)} ${num(y1)} ${num(x0)} ${num(y1 - r + k)} ${num(x0)} ${num(y1 - r)} c`,
    `${num(x0)} ${num(y0 + r)} l`,
    `${num(x0)} ${num(y0 + r - k)} ${num(x0 + r - k)} ${num(y0)} ${num(x0 + r)} ${num(y0)} c`,
    "h",
  ].join(" ");
}

/** Formats a number compactly, as PDF has no exponent notation. */
function num(value) {
  return String(Math.round(value * 100) / 100);
}

/** "#rrggbb" as the three 0..1 values PDF expects. */
function rgb(hex) {
  const value = parseInt(hex.slice(1), 16) || 0;
  return [value >> 16, (value >> 8) & 0xff, value & 0xff].map((c) => num(c / 255)).join(" ");
}

function pdfDate(date) {
  return `D:${date.toISOString().replace(/[-:T]/g, "").slice(0, 14)}Z`;
}
