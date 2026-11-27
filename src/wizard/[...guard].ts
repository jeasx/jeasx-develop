import type { RouteProps } from "../types";
import { toAnswers, toStorable } from "./domain/answers";
import { STEP_IDS, firstIncomplete, href, nextStep, previousStep } from "./domain/steps";
import type { Errors, StepId, StepProps } from "./domain/types";
import validate from "./domain/validate";
import { book, loadAnswers, loadBooking, saveAnswers } from "./storage";

/**
 * Runs before every page of the wizard: it loads the answers, stores submitted ones,
 * validates them and decides where to go next. The pages only render what it returns.
 */
export default function ({ request, reply }: RouteProps) {
  // Static files (e.g. "/wizard/index.js") need no answers.
  if (reply.file) {
    return;
  }
  const step = request.path.replace(/\/+$/, "").slice("/wizard/".length);
  if (step === "done") {
    const booking = loadBooking(request);
    return booking ? { booking } : reply.redirect(href("trip"));
  }
  if (!isStep(step)) {
    return;
  }
  return request.method === "POST" && request.body
    ? submit(step, { request, reply })
    : show(step, { request, reply });
}

function isStep(value: string): value is StepId {
  return (STEP_IDS as string[]).includes(value);
}

/**
 * Steps can't be skipped: a later step needs the answers of the earlier ones, e.g. the
 * travelers need the trip. After a change (e.g. one more traveler), the first step which
 * no longer fits is shown with its errors ("?check"), so it's clear what to fix.
 */
function show(step: StepId, { request, reply }: RouteProps) {
  const data = loadAnswers(request);
  const missing = firstIncomplete(data);
  if (missing && STEP_IDS.indexOf(missing) < STEP_IDS.indexOf(step)) {
    // An untouched step starts without errors.
    return reply.redirect(href(missing) + (data[missing] ? "?check" : ""));
  }
  const query = (request.query ?? {}) as Record<string, unknown>;
  const errors = "check" in query ? validate(step, data) : {};
  return { step, data, form: data[step] ?? {}, errors } satisfies StepProps;
}

/**
 * Stores the submitted answers, even invalid ones, so nothing typed is lost. "Back" leaves
 * without validating; "Next" only moves on once the step is valid.
 * Redirects use 303, so the browser loads the target with GET and a reload doesn't resubmit.
 */
function submit(step: StepId, { request, reply }: RouteProps) {
  const body = request.body as Record<string, unknown>;
  const back = body["$action"] === "back";
  const submitted = toAnswers(body);
  const input = { ...loadAnswers(request), [step]: submitted };
  const errors: Errors = back ? {} : validate(step, input);
  const data = { ...input, [step]: toStorable(step, submitted, errors) };

  if (!saveAnswers(reply, data)) {
    errors.size = "Your answers are too long to be stored. Please shorten them.";
  } else if (back) {
    return reply.redirect(href(previousStep(step) ?? step), 303);
  } else if (Object.keys(errors).length === 0) {
    if (step !== "review") {
      return reply.redirect(href(nextStep(step, data)), 303);
    }
    // Earlier steps were valid when they were sent, but time passes: e.g. tomorrow's
    // departure is in the past by now. So check everything once more before booking.
    const missing = firstIncomplete(data);
    if (missing) {
      return reply.redirect(`${href(missing)}?check`, 303);
    }
    book(reply, data);
    return reply.redirect(href("done"), 303);
  }

  // Show the page again with what was typed, so it can be fixed.
  // The security code is never sent back into the page.
  const { card_cvc: _, ...form } = submitted;
  return { step, data: input, form, errors } satisfies StepProps;
}
