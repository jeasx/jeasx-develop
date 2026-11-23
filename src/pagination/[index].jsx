import { html } from "jsx-async-runtime";
import Layout from "../Layout";
import elements, { FAMILIES, family } from "./elements";

const PAGE_SIZE = 12;

/** Where "index.js" saves the scroll position before a page link is followed. */
const SCROLL_KEY = "pagination-scroll";

/** One color per element family, in the order of FAMILIES. */
const COLORS = [
  "#f87171",
  "#fb923c",
  "#60a5fa",
  "#e879f9",
  "#f472b6",
  "#4ade80",
  "#facc15",
  "#22d3ee",
  "#2dd4bf",
  "#a78bfa",
];
const colorOf = (/** @type {number} */ number) => COLORS[FAMILIES.indexOf(family(number))];

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const pages = Math.ceil(elements.length / PAGE_SIZE);
  // Missing, invalid or out-of-range values end up on the nearest valid page.
  const page = Math.min(Math.max(Math.trunc(Number(request.query["page"])) || 1, 1), pages);
  const items = elements.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout
      title="Pagination"
      description="Split a long list into pages with plain links and a query parameter."
      css="/pagination/index.css"
      script="/pagination/index.js"
    >
      <h1>Pagination</h1>
      <p class="lead">
        Long lists are easier to browse in pages. The page number is a query parameter like{" "}
        <code>?page=3</code>, so every page has its own URL that you can bookmark and share.
      </p>
      <p>
        The server slices the list and renders plain links, so search engines can follow every page.
        Long page ranges are shortened with an ellipsis. A tiny script keeps your scroll position
        when you switch pages; without JavaScript, the links still work.
      </p>

      <ol class="pg-grid">
        {items.map((element, index) => (
          <li
            style={`--c: ${colorOf(element.number)}; --i: ${index}`}
            title={family(element.number)}
          >
            <small>{element.number}</small>
            <strong>{element.symbol}</strong>
            <span>{element.name}</span>
          </li>
        ))}
      </ol>
      <ul class="pg-legend">
        {FAMILIES.map((name, index) => (
          <li style={`--c: ${COLORS[index]}`}>{name}</li>
        ))}
      </ul>

      <div class="pg-status">
        <span>
          Elements <strong>{items[0].number}</strong>–<strong>{items.at(-1).number}</strong> of{" "}
          {elements.length}
        </span>
        {/* Where this page sits in the whole list. */}
        <span
          class="pg-progress"
          style={`--from: ${(items[0].number - 1) / elements.length}; --to: ${items.at(-1).number / elements.length}`}
          aria-hidden="true"
        ></span>
      </div>
      <Pagination page={page} pages={pages} />
    </Layout>
  );
}

/**
 * Links to the previous and next page and to the pages around the current one.
 *
 * @param {{ page: number, pages: number }} props
 */
function Pagination({ page, pages }) {
  return (
    <>
      <nav class="pg-nav" aria-label="Pages" data-pagination={SCROLL_KEY}>
        <PageLink page={page - 1} pages={pages} label="← Previous" />
        <ol>
          {pageNumbers(page, pages).map((number) =>
            number === null ? (
              <li class="pg-gap">…</li>
            ) : (
              <li>
                <a href={`?page=${number}`} aria-current={number === page ? "page" : undefined}>
                  {number}
                </a>
              </li>
            ),
          )}
        </ol>
        <PageLink page={page + 1} pages={pages} label="Next →" />
      </nav>
      {/* Restores the saved scroll position. Inline, it runs while the page is parsed, so before
          the page is first shown; a deferred script would make the page visibly jump. The rest
          of the page isn't parsed yet, so a minimum height makes room to scroll that far. */}
      <script>
        {html(`try {
  const y = sessionStorage.getItem("${SCROLL_KEY}");
  if (y !== null) {
    sessionStorage.removeItem("${SCROLL_KEY}");
    const root = document.documentElement;
    root.style.minHeight = \`\${+y + innerHeight}px\`;
    scrollTo({ top: +y, behavior: "instant" });
    addEventListener("DOMContentLoaded", () => root.style.removeProperty("min-height"));
  }
} catch {}`)}
      </script>
    </>
  );
}

/**
 * A link to a page, or a disabled placeholder if the page doesn't exist.
 *
 * @param {{ page: number, pages: number, label: string }} props
 */
function PageLink({ page, pages, label }) {
  return page >= 1 && page <= pages ? (
    <a href={`?page=${page}`} class="pg-step">
      {label}
    </a>
  ) : (
    <span class="pg-step" aria-disabled="true">
      {label}
    </span>
  );
}

/**
 * The page numbers to show: the first, the last, and the pages around the current one.
 * `null` marks a gap. There are always 7 slots (if there are that many pages), so the
 * pager keeps its width and "Previous" and "Next" stay in place:
 * [1, 2, 3, 4, 5, null, 10], [1, null, 4, 5, 6, null, 10] or [1, null, 6, 7, 8, 9, 10].
 *
 * @param {number} page
 * @param {number} pages
 * @returns {(number | null)[]}
 */
function pageNumbers(page, pages) {
  const range = (/** @type {number} */ from, /** @type {number} */ to) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index);
  if (pages <= 7) return range(1, pages);
  if (page <= 4) return [...range(1, 5), null, pages];
  if (page >= pages - 3) return [1, null, ...range(pages - 4, pages)];
  return [1, null, page - 1, page, page + 1, null, pages];
}
