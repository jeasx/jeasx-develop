import { jsxToString } from "jsx-async-runtime";
import {
  Button,
  Callout,
  Divider,
  Email,
  Heading,
  Hero,
  KeyValue,
  Section,
  Steps,
  Table,
  Text,
} from "./components";

/** Example data, as it would come from your database. */
const USER = { name: "Ada Lovelace", email: "ada@example.com" };

export const TEMPLATES = {
  welcome: {
    title: "Welcome",
    icon: "👋",
    description: "Onboarding with a call to action",
    subject: "Welcome to Jeasx Cloud, Ada!",
    render: () => <Welcome user={USER} />,
  },
  receipt: {
    title: "Order receipt",
    icon: "🧾",
    description: "Async data and a line-item table",
    subject: "Your receipt for order #1042",
    render: () => <Receipt orderId={1042} user={USER} />,
  },
  reset: {
    title: "Password reset",
    icon: "🔐",
    description: "Transactional security email",
    subject: "Reset your password",
    render: () => <PasswordReset user={USER} />,
  },
};

/** Falls back to the first template for unknown names. */
export function templateName(value) {
  return Object.hasOwn(TEMPLATES, String(value)) ? String(value) : "welcome";
}

/**
 * Renders a template in the given format.
 *
 * @this {import("../types").ThisContext}
 * @param {keyof typeof TEMPLATES} name
 * @param {"html" | "text"} format
 */
export async function renderEmail(name, format) {
  const context = Object.assign(Object.create(this ?? {}), { format });
  if (format === "html") {
    return jsxToString.call(context, TEMPLATES[name].render());
  }
  // jsx-async-runtime escapes text for HTML. Plain text must stay as it is, so this override
  // passes strings and numbers through unchanged; everything else renders as usual.
  context.jsxToString = (element) =>
    typeof element === "string" || typeof element === "number"
      ? String(element)
      : jsxToString.call(context, element);
  const output = await jsxToString.call(context, TEMPLATES[name].render());
  return output.trim() + "\n";
}

function Welcome({ user }) {
  return (
    <Email
      title="Welcome to Jeasx Cloud"
      preview="Your account is ready. Here's how to get started."
      brand="Jeasx Cloud"
      footer="You receive this email because you signed up for Jeasx Cloud."
    >
      <Hero icon="👋" title={`Welcome aboard, ${user.name.split(" ")[0]}!`}>
        Your account for {user.email} is ready. Deploy your first app in less than a minute.
      </Hero>
      <Section>
        <Heading>Get started in three steps</Heading>
        <Steps
          steps={[
            ["Pick a template", "Start from a blog, shop or API in one click."],
            ["Push to Git", "Every commit builds and deploys automatically."],
            ["Go live", "Share your URL; HTTPS and caching are built in."],
          ]}
        />
        <Button href="https://www.jeasx.dev">Open your dashboard</Button>
        <Text muted>Questions? Just reply to this email, a human will read it.</Text>
      </Section>
    </Email>
  );
}

/** Async components work in emails, too: the order is loaded while rendering. */
async function Receipt({ orderId, user }) {
  const order = await loadOrder(orderId);
  const money = (cents) => `€${(cents / 100).toFixed(2)}`;
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return (
    <Email
      title={`Receipt for order #${orderId}`}
      preview={`Thanks for your order of ${money(total)}.`}
      brand="Jeasx Shop"
      footer="Jeasx Shop · 1 Example Street · 12345 Berlin"
    >
      <Hero icon="🧾" title="Thanks for your order!">
        Hi {user.name.split(" ")[0]}, we've received your order and will ship it shortly.
      </Hero>
      <Section>
        <Heading>Order summary</Heading>
        <Table
          rows={order.items.map((item) => [
            `${item.quantity} × ${item.name}`,
            money(item.quantity * item.price),
          ])}
          total={["Total", money(total)]}
        />
        <Button href="https://www.jeasx.dev">Track your order</Button>
        <Divider />
        <Heading>Details</Heading>
        <KeyValue
          rows={[
            ["Order", `#${orderId}`],
            ["Date", order.date],
            ["Shipping to", order.address],
            ["Delivery", "2–3 business days"],
          ]}
        />
      </Section>
    </Email>
  );
}

function PasswordReset({ user }) {
  return (
    <Email
      title="Reset your password"
      preview="Someone asked to reset your password."
      brand="Jeasx Cloud"
      footer="Sent by Jeasx Cloud for security reasons."
    >
      <Hero icon="🔐" title="Reset your password">
        We received a request to reset the password for {user.email}.
      </Hero>
      <Section>
        <Button href="https://www.jeasx.dev/reset?token=example">Choose a new password</Button>
        <Callout icon="⏱">This link is valid for 30 minutes and can only be used once.</Callout>
        <Heading>Request details</Heading>
        <KeyValue
          rows={[
            ["Requested", "2026-11-14, 19:42 CET"],
            ["Browser", "Firefox on macOS"],
            ["Location", "Berlin, Germany"],
          ]}
        />
        <Text muted>If you didn't ask for this, you can safely ignore this email.</Text>
      </Section>
    </Email>
  );
}

/** Simulates a database query. */
async function loadOrder(id) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return {
    id,
    date: "2026-11-14",
    address: "Ada Lovelace, 12 St James's Square, London",
    items: [
      { name: "Jeasx T-shirt", quantity: 2, price: 1990 },
      { name: "Sticker pack <JSX/>", quantity: 1, price: 490 },
      { name: "Coffee mug", quantity: 1, price: 1290 },
    ],
  };
}
