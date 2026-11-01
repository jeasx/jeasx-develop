/**
 * Greets someone. JSX escapes the name, so it can't inject markup.
 *
 * @param {{ name: string }} props
 */
export function Greeting({ name }) {
  return <p class="greeting">Hello, {name}!</p>;
}

/**
 * Formats a price in the locale and currency from the "this" context.
 *
 * @this {{ locale?: string, currency?: string } | undefined}
 * @param {{ amount: number }} props
 */
export function Price({ amount }) {
  const { locale = "en-US", currency = "USD" } = this ?? {};
  const price = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  return <data value={amount}>{price}</data>;
}

/**
 * Loads a user and shows a card. The loader is a prop, so tests can pass a fake one
 * instead of calling the remote API.
 *
 * @param {{ id: number, loadUser?: (id: number) => Promise<{ name: string, email: string }> }} props
 */
export async function UserCard({ id, loadUser = fetchUser }) {
  try {
    const { name, email } = await loadUser(id);
    return (
      <article class="user">
        <h3>{name}</h3>
        <a href={`mailto:${email}`}>{email}</a>
      </article>
    );
  } catch {
    return (
      <article class="user">
        <p>User {id} is unavailable.</p>
      </article>
    );
  }
}

/** @param {number} id */
async function fetchUser(id) {
  const response = await fetch(`https://dummyjson.com/users/${id}`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) {
    throw new Error(`User ${id}: ${response.status}`);
  }
  const { firstName, lastName, email } = await response.json();
  return { name: `${firstName} ${lastName}`, email };
}
