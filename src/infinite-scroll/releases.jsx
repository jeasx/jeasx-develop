export const PAGE_SIZE = 10;
export const PAGES = 10;
const PAGE_DELAY = 400;

/**
 * Parses a page number from the query and keeps it between 1 and PAGES.
 *
 * @param {unknown} value
 */
export function toPage(value) {
  return Math.min(Math.max(Math.trunc(Number(value)) || 1, 1), PAGES);
}

/**
 * Yields one table row per release for the pages `from` to `to`, followed by a row
 * which loads the next page once it scrolls into view (or a note at the end of the list).
 * Each page is only fetched when the renderer needs it, and every row is streamed right away.
 *
 * @param {{ from: number, to: number }} props
 */
export async function* Releases({ from, to }) {
  for (let number = from; number <= to; number++) {
    const page = await fetchPage(number);
    for (const release of page.items) {
      yield (
        <tr>
          <td>{release.id}</td>
          <td>{release.name}</td>
          <td>{release.date}</td>
          <td>{page.number}</td>
        </tr>
      );
    }
  }

  if (to < PAGES) {
    const next = to + 1;
    // An absolute URL: relative to the <base> of the page, "?page=2" would become "/infinite-scroll/?page=2".
    const url = `/infinite-scroll?page=${next}`;
    yield (
      // HTMX replaces this row with the rows of the next page and a new row like this one.
      // Without JavaScript, the link reloads the page with one more page of releases.
      <tr
        hx-get={`./rows?page=${next}`}
        hx-trigger="revealed"
        hx-swap="outerHTML"
        hx-push-url={url}
      >
        <td colspan="4" class="center">
          <a href={url} aria-busy="true">
            Load more releases
          </a>
        </td>
      </tr>
    );
  } else {
    yield (
      <tr>
        <td colspan="4" class="center">
          <strong>You have reached the end: all {PAGES * PAGE_SIZE} releases are loaded.</strong>
        </td>
      </tr>
    );
  }
}

/** Simulates a slow, paginated API. */
async function fetchPage(number) {
  await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY));
  return {
    number,
    items: Array.from({ length: PAGE_SIZE }, (_, i) => {
      const id = (number - 1) * PAGE_SIZE + i + 1;
      // Newest release first, one release per week.
      const date = new Date(Date.UTC(2026, 9, 26) - (id - 1) * 7 * 24 * 60 * 60 * 1000);
      return {
        id,
        name: `v${Math.floor((PAGES * PAGE_SIZE - id) / 10) + 1}.${(PAGES * PAGE_SIZE - id) % 10}.0`,
        date: date.toISOString().slice(0, 10),
      };
    }),
  };
}
