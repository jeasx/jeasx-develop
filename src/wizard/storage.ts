// Answers and the finished booking live in signed cookies, only sent to the wizard
// (see "../@helpers/cookies.js"). Nothing is stored on the server.
import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fitsCookie, readSignedCookie } from "../@helpers/cookies";
import type { Data } from "./domain/types";

export type Booking = { ref: string; bookedAt: string; data: Data };

// Clearing a cookie needs the same path as setting it.
const COOKIE = { path: "/wizard", signed: true };

export function loadAnswers(request: FastifyRequest): Data {
  return (readCookie(request, "data") as Data) ?? {};
}

/**
 * Returns false if the answers are too large for a cookie: the browser would drop it.
 */
export function saveAnswers(reply: FastifyReply, data: Data) {
  const value = JSON.stringify(data);
  if (!fitsCookie(reply, value)) {
    return false;
  }
  reply.setCookie("data", value, COOKIE);
  return true;
}

/**
 * Turns the answers into a booking: they move to a cookie of their own, which the
 * confirmation page reads, so a new booking starts empty.
 */
export function book(reply: FastifyReply, data: Data) {
  const booking: Booking = {
    ref: reference(),
    bookedAt: new Date().toISOString(),
    data,
  };
  reply.setCookie("booking", JSON.stringify(booking), COOKIE);
  reply.clearCookie("data", COOKIE);
}

export function loadBooking(request: FastifyRequest): Booking | undefined {
  const booking = readCookie(request, "booking");
  return typeof booking?.ref === "string" ? (booking as Booking) : undefined;
}

/**
 * Reads a JSON object from a signed cookie. A broken or edited cookie is ignored.
 * Only plain objects are accepted, as the signature covers the value, not the cookie name.
 */
function readCookie(request: FastifyRequest, name: string): Record<string, any> | undefined {
  try {
    const value = JSON.parse(readSignedCookie(request, name) ?? "null");
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  } catch {}
  return undefined;
}

/** A booking reference like "JX7K2QF", without easily confused characters like 0/O or 1/I. */
function reference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "JX" + [...randomBytes(5)].map((byte) => alphabet[byte % alphabet.length]).join("");
}
