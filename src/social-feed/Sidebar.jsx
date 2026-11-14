import { Avatar } from "./Post";
import { FEEDS } from "./feed";

/** The feed filter on the left. */
export function Feeds({ active, counts }) {
  return (
    <nav class="card feeds" id="feeds" aria-label="Feeds">
      <button type="button" class={active === "all" ? "active" : ""} data-feed="all">
        <span aria-hidden="true">🏠</span> All posts
      </button>
      {FEEDS.map((feed) => (
        <button type="button" class={active === feed.id ? "active" : ""} data-feed={feed.id}>
          <span aria-hidden="true">{feed.icon}</span> {feed.label}
          {counts[feed.id] > 0 && <span class="badge">{counts[feed.id]}</span>}
        </button>
      ))}
    </nav>
  );
}

/**
 * Contacts on the right, with who is online right now.
 *
 * @param {{ people: { id: string, name: string, avatar: string, hue: number }[], online: string[] }} props
 */
export function Contacts({ people, online }) {
  return (
    <section class="card contacts">
      <h2>Contacts</h2>
      <ul>
        {people.map((person) => (
          <li class={online.includes(person.id) ? "online" : ""}>
            <Avatar person={person} size="sm" />
            {person.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Live activity: what happened in the feed lately.
 *
 * @param {{ entries: string[] }} props
 */
export function Activity({ entries }) {
  return (
    <section class="card activity">
      <h2>Live activity</h2>
      {entries.length === 0 ? (
        <p class="muted">Waiting for something to happen…</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li>{entry}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
