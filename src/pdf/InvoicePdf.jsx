import { euro, totals } from "./invoice";
import { Circle, Document, Line, Page, Rect, Text, View } from "./jsx";
import { A4, textWidth } from "./pdf";

const COLORS = {
  ink: "#0f172a",
  text: "#334155",
  muted: "#64748b",
  soft: "#94a3b8",
  line: "#e2e8f0",
  paper: "#f8fafc",
  cyan: "#0891b2",
  cyanLight: "#22d3ee",
  violet: "#6d28d9",
  purple: "#a855f7",
  white: "#ffffff",
  footer: "#f1f5f9",
  violetLight: "#7c3aed",
  violetPale: "#ddd6fe",
  cyanPale: "#cffafe",
  // Decorative circles in the header
  deepTeal: "#0c3b4d",
  deepViolet: "#2e1065",
  deepGreen: "#134e4a",
};

const MARGIN = 48;
const CONTENT = A4.width - 2 * MARGIN;
const DAY = 24 * 60 * 60 * 1000;

/**
 * The invoice as a tree of components, just like an HTML page. Render it with renderPdf().
 *
 * @param {{ invoice: import("./invoice").Invoice }} props
 */
export default function InvoicePdf({ invoice }) {
  const issued = new Date();
  const due = new Date(issued.getTime() + 14 * DAY);
  const { net, tax, gross } = totals(invoice);

  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Page>
        <Header number={invoice.number} issued={issued} due={due} vat={invoice.vat} />
        <View x={MARGIN} y={196}>
          <BillTo customer={invoice.customer} address={invoice.address} />
          <AmountDue gross={gross} due={due} />
        </View>
        <View x={MARGIN} y={322}>
          <ItemsTable items={invoice.items} />
          <View y={tableHeight(invoice.items) + 30}>
            <Notes />
            <Totals net={net} tax={tax} gross={gross} vat={invoice.vat} />
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

/** A dark band with the sender, the title and key facts. */
function Header({ number, issued, due, vat }) {
  return (
    <>
      {/* Decorative circles, partly covered by the white page drawn after them. */}
      <Rect width={A4.width} height={170} fill={COLORS.ink} />
      <Circle cx={A4.width - 20} cy={10} r={130} fill={COLORS.deepTeal} />
      <Circle cx={A4.width - 60} cy={170} r={70} fill={COLORS.deepViolet} />
      <Circle cx={A4.width - 290} cy={24} r={18} fill={COLORS.deepGreen} />
      <Rect y={170} width={A4.width} height={A4.height - 170} fill={COLORS.white} />

      <View x={MARGIN} y={42}>
        <Logo />
        <Text x={56} y={18} size={17} bold color={COLORS.white}>
          Jeasx Expo Ltd.
        </Text>
        <Text x={56} y={35} size={9} color={COLORS.soft}>
          JSX with ease · since 2024
        </Text>
        <Text x={CONTENT} y={24} size={30} bold color={COLORS.white} align="right">
          INVOICE
        </Text>
        <Text x={CONTENT} y={42} size={10} bold color={COLORS.cyanLight} align="right">
          No. {number}
        </Text>
      </View>

      <View x={MARGIN} y={130}>
        <Fact x={0} label="ISSUED" value={formatDate(issued)} />
        <Fact x={110} label="DUE" value={formatDate(due)} />
        <Fact x={220} label="VAT" value={`${vat} %`} />
      </View>
    </>
  );
}

function Logo() {
  return (
    <>
      <Rect width={42} height={42} fill={COLORS.cyanLight} radius={10} />
      <Circle cx={42} cy={2} r={8} fill={COLORS.purple} />
      <Text x={21} y={30} size={24} bold color={COLORS.ink} align="center">
        J
      </Text>
    </>
  );
}

function Fact({ x, label, value }) {
  return (
    <View x={x}>
      <Label color={COLORS.soft}>{label}</Label>
      <Text y={17} size={11} bold color={COLORS.white}>
        {value}
      </Text>
    </View>
  );
}

/** Small caps-style heading above a block. */
function Label({ x = 0, y = 0, color = COLORS.cyan, children }) {
  return (
    <Text x={x} y={y} size={7.5} bold color={color}>
      {children}
    </Text>
  );
}

const CARD_HEIGHT = 96;
const CARD_SPLIT = 270;

function BillTo({ customer, address }) {
  const width = CARD_SPLIT - 14;
  return (
    <>
      <Rect
        width={width}
        height={CARD_HEIGHT}
        fill={COLORS.paper}
        stroke={COLORS.line}
        radius={10}
      />
      <View x={18} y={24}>
        <Label>BILL TO</Label>
        <Text y={20} size={13} bold color={COLORS.ink}>
          {fit(customer, width - 56, 13)}
        </Text>
        {address
          .split("\n")
          .slice(0, 3)
          .map((line, index) => (
            <Text y={37 + index * 13} size={9.5} color={COLORS.text}>
              {line}
            </Text>
          ))}
      </View>
    </>
  );
}

function AmountDue({ gross, due }) {
  const width = CONTENT - CARD_SPLIT;
  return (
    <View x={CARD_SPLIT}>
      <Rect width={width} height={CARD_HEIGHT} fill={COLORS.violet} radius={10} />
      <Circle cx={width - 36} cy={36} r={22} fill={COLORS.violetLight} />
      <View x={18} y={24}>
        <Label color={COLORS.violetPale}>AMOUNT DUE</Label>
        <Text y={32} size={24} bold color={COLORS.white}>
          {euro.format(gross)}
        </Text>
        <Text y={54} size={9} color={COLORS.violetPale}>
          Please pay by {formatDate(due)}
        </Text>
      </View>
    </View>
  );
}

const ROW = 28;
const COLUMNS = {
  number: 14,
  description: 38,
  quantity: CONTENT - 200,
  price: CONTENT - 100,
  amount: CONTENT - 14,
};

function tableHeight(items) {
  return 34 + Math.max(items.length, 1) * ROW + 6;
}

function ItemsTable({ items }) {
  const head = { y: 18, size: 7.5, bold: true, color: COLORS.white };
  return (
    <>
      <Rect width={CONTENT} height={ROW} fill={COLORS.ink} radius={6} />
      <Text x={COLUMNS.number} {...head}>
        #
      </Text>
      <Text x={COLUMNS.description} {...head}>
        DESCRIPTION
      </Text>
      <Text x={COLUMNS.quantity} {...head} align="right">
        QTY
      </Text>
      <Text x={COLUMNS.price} {...head} align="right">
        UNIT PRICE
      </Text>
      <Text x={COLUMNS.amount} {...head} align="right">
        AMOUNT
      </Text>
      <View y={34}>
        {items.length === 0 && (
          <Text x={COLUMNS.description} y={18} color={COLORS.muted}>
            No items
          </Text>
        )}
        {items.map((item, index) => (
          <ItemRow item={item} index={index} />
        ))}
      </View>
      <Line
        x1={0}
        y1={tableHeight(items)}
        x2={CONTENT}
        y2={tableHeight(items)}
        color={COLORS.line}
      />
    </>
  );
}

function ItemRow({ item: { description, quantity, price }, index }) {
  return (
    <View y={index * ROW}>
      {index % 2 === 1 && <Rect width={CONTENT} height={ROW} fill={COLORS.paper} radius={6} />}
      <View y={18}>
        <Text x={COLUMNS.number} size={9} bold color={COLORS.cyan}>
          {String(index + 1).padStart(2, "0")}
        </Text>
        <Text x={COLUMNS.description} color={COLORS.ink}>
          {fit(description, COLUMNS.quantity - COLUMNS.description - 50, 10)}
        </Text>
        <Text x={COLUMNS.quantity} color={COLORS.text} align="right">
          {quantity}
        </Text>
        <Text x={COLUMNS.price} color={COLORS.text} align="right">
          {euro.format(price)}
        </Text>
        <Text x={COLUMNS.amount} bold color={COLORS.ink} align="right">
          {euro.format(quantity * price)}
        </Text>
      </View>
    </View>
  );
}

function Notes() {
  return (
    <>
      <Label>NOTES</Label>
      <Text y={16} size={9} color={COLORS.muted}>
        Thank you for choosing Jeasx Expo. Questions about
      </Text>
      <Text y={29} size={9} color={COLORS.muted}>
        this invoice? Simply reply to the email it came with.
      </Text>
    </>
  );
}

function Totals({ net, tax, gross, vat }) {
  const x = CONTENT - 220;
  return (
    <>
      <Text x={x} color={COLORS.muted}>
        Subtotal
      </Text>
      <Text x={COLUMNS.amount} color={COLORS.ink} align="right">
        {euro.format(net)}
      </Text>
      <Text x={x} y={20} color={COLORS.muted}>
        VAT {vat} %
      </Text>
      <Text x={COLUMNS.amount} y={20} color={COLORS.ink} align="right">
        {euro.format(tax)}
      </Text>
      <Rect x={x - 14} y={34} width={CONTENT - x + 14} height={40} fill={COLORS.cyan} radius={8} />
      <Text x={x} y={59} size={9} bold color={COLORS.cyanPale}>
        TOTAL
      </Text>
      <Text x={COLUMNS.amount} y={60} size={15} bold color={COLORS.white} align="right">
        {euro.format(gross)}
      </Text>
    </>
  );
}

/** @type {[label: string, lines: string[]][]} */
const FOOTER_COLUMNS = [
  ["PAYMENT", ["IBAN DE00 1234 5678 9012 3456 78", "BIC JEASDEXX"]],
  ["CONTACT", ["hello@example.com", "www.jeasx.dev"]],
  ["ADDRESS", ["1 Stream Street", "10115 Berlin, Germany"]],
];

function Footer() {
  const top = A4.height - 96;
  return (
    <>
      <Rect y={top} width={A4.width} height={96} fill={COLORS.footer} />
      <Rect y={A4.height - 6} width={A4.width * 0.62} height={6} fill={COLORS.cyanLight} />
      <Rect
        x={A4.width * 0.62}
        y={A4.height - 6}
        width={A4.width * 0.38}
        height={6}
        fill={COLORS.purple}
      />
      {FOOTER_COLUMNS.map(([label, lines], index) => (
        <View x={MARGIN + index * 175} y={top + 32}>
          <Label>{label}</Label>
          {lines.map((line, row) => (
            <Text y={17 + row * 13} size={8.5} color={COLORS.text}>
              {line}
            </Text>
          ))}
        </View>
      ))}
    </>
  );
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", { dateStyle: "medium" });
}

/** Shortens a text with "…" so it fits into the given width. */
function fit(text, width, size) {
  if (textWidth(text, size) <= width) {
    return text;
  }
  let short = text;
  while (short.length > 1 && textWidth(`${short}…`, size) > width) {
    short = short.slice(0, -1);
  }
  return `${short.trimEnd()}…`;
}
