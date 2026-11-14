import { readSignedCookie } from "../../@helpers/cookies";
import {
  MAX_SEATS,
  ROWS,
  SCREENINGS,
  SEATS_PER_ROW,
  TIERS,
  WHEELCHAIR,
  tierOf,
} from "../screenings";

const PATH = "/cinema";

/** @typedef {ReturnType<typeof createServerStore>} ServerStore */
/** @typedef {import("../../types").ThisContext & { store: ServerStore }} ServerContext */

/**
 * The store on the server: your selection lives in a signed cookie, the seats of other
 * guests are made up (see `isTakenByOthers`). Components only see `screening()`,
 * `seats(row)` and `selection()`, which the browser store offers as well (see "./browser.js").
 *
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
export function createServerStore(request, reply) {
  const state = readState(request);
  const current = () => SCREENINGS.find(({ id }) => id === state.screening);
  const selected = () => (state.selected[state.screening] ??= []);
  const booked = () => (state.booked[state.screening] ??= []);
  const save = () =>
    reply.setCookie("cinema", JSON.stringify(state), {
      path: PATH,
      signed: true,
    });

  /** @param {string} id */
  const statusOf = (id) =>
    booked().includes(id)
      ? "yours"
      : isTakenByOthers(state.screening, id)
        ? "taken"
        : selected().includes(id)
          ? "selected"
          : "free";

  return {
    renderer: "server",

    async screening() {
      return current();
    },

    /** @param {string} row */
    async seats(row) {
      return Array.from({ length: SEATS_PER_ROW }, (_, index) => {
        const id = `${row}${index + 1}`;
        return {
          id,
          number: index + 1,
          tier: tierOf(row),
          wheelchair: WHEELCHAIR.includes(id),
          status: statusOf(id),
        };
      });
    },

    /** Your selection. Reading it shows a message only once, like a flash message. */
    async selection() {
      // Other guests may have booked a seat you picked in the meantime.
      const lost = selected().filter((id) => statusOf(id) === "taken");
      const messages = [state.message];
      if (lost.length) {
        state.selected[state.screening] = selected().filter((id) => !lost.includes(id));
        messages.push(`Sorry, someone else just booked ${lost.join(", ")}.`);
      }
      const message = messages.filter(Boolean).join(" ");
      if (state.message || lost.length) {
        state.message = "";
        save();
      }
      const seats = selected().map((id) => {
        const tier = tierOf(id[0]);
        return { id, tier, price: TIERS[tier].price };
      });
      return {
        screening: current(),
        seats,
        total: seats.reduce((sum, { price }) => sum + price, 0),
        booked: booked(),
        message,
      };
    },

    /**
     * Applies a form submission and returns the parts of the page which changed:
     * "row:C" for a row, "summary" or "map" for everything.
     * @param {Record<string, unknown>} body
     */
    apply(body) {
      const changed = new Set();
      const screening = String(body["screening"] ?? "");
      if (SCREENINGS.some(({ id }) => id === screening) && screening !== state.screening) {
        state.screening = screening;
        changed.add("map").add("summary");
      }
      const seat = String(body["seat"] ?? "");
      if (isSeat(seat)) {
        const status = statusOf(seat);
        if (status === "selected") {
          state.selected[state.screening] = selected().filter((id) => id !== seat);
        } else if (status !== "free") {
          state.message = `${seat} isn't available any more.`;
        } else if (selected().length >= MAX_SEATS) {
          state.message = `You can pick up to ${MAX_SEATS} seats at once.`;
        } else {
          selected().push(seat);
        }
        changed.add(`row:${seat[0]}`).add("summary");
      }
      if (body["book"] || body["clear"]) {
        for (const id of selected()) {
          changed.add(`row:${id[0]}`);
        }
        if (body["book"] && selected().length) {
          booked().push(...selected());
          state.message = `Booked ${selected().join(", ")}. Enjoy the movie!`;
        }
        state.selected[state.screening] = [];
        changed.add("summary");
      }
      if (changed.size) {
        save();
      }
      return [...changed];
    },
  };
}

/** @param {string} id */
function isSeat(id) {
  const number = Number(id.slice(1));
  return ROWS.includes(id[0]) && Number.isInteger(number) && number >= 1 && number <= SEATS_PER_ROW;
}

/**
 * Other guests: a quarter of the seats are taken from the start, and over ten minutes
 * a few more get booked every now and then. Then the cinema starts over. Made up from
 * a hash, so it's the same for every request and needs no database.
 *
 * @param {string} screening
 * @param {string} seat
 */
function isTakenByOthers(screening, seat) {
  const progress = (Date.now() % 600_000) / 600_000;
  return hash(`${screening}:${seat}`) < 0.25 + 0.2 * progress;
}

/** FNV-1a, turned into a number between 0 and 1. */
function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  }
  return (value >>> 0) / 2 ** 32;
}

/**
 * The cookie is signed, but could hold a signed value of another cookie,
 * so only keep known screenings and valid seats.
 *
 * @param {import("fastify").FastifyRequest} request
 */
function readState(request) {
  /** @type {any} */
  let raw = {};
  try {
    raw = JSON.parse(readSignedCookie(request, "cinema")) ?? {};
  } catch {}
  /** @param {unknown} lists */
  const seatLists = (lists) =>
    Object.fromEntries(
      SCREENINGS.map(({ id }) => [
        id,
        Array.isArray(lists?.[id]) ? lists[id].map(String).filter(isSeat).slice(0, 48) : [],
      ]),
    );
  return {
    screening: SCREENINGS.some(({ id }) => id === raw.screening) ? raw.screening : SCREENINGS[0].id,
    selected: seatLists(raw.selected),
    booked: seatLists(raw.booked),
    message: typeof raw.message === "string" ? raw.message.slice(0, 200) : "",
  };
}
