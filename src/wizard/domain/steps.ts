import type { Data, StepId } from "./types";
import validate from "./validate";

export const BASE = "/wizard";

/** The steps in order. The confirmation ("done") isn't a step: it has nothing to fill in. */
export const STEPS: { id: StepId; label: string; title: string }[] = [
  { id: "trip", label: "Trip", title: "Where to?" },
  { id: "travelers", label: "Travelers", title: "Who's flying?" },
  { id: "extras", label: "Extras & payment", title: "Make it yours" },
  { id: "review", label: "Review", title: "Check and book" },
];

export const STEP_IDS = STEPS.map((s) => s.id);

export const href = (id: StepId | "done") => `${BASE}/${id}`;

/**
 * The first step whose answers are missing or invalid, e.g. because the travelers
 * no longer fit after the trip was changed. Undefined when everything can be booked.
 */
export function firstIncomplete(data: Data, now?: Date): StepId | undefined {
  return STEP_IDS.find((id) => Object.keys(validate(id, data, now)).length > 0);
}

/**
 * Where "Next" leads: the next step that still needs answers, so editing a step
 * from the review jumps straight back to it instead of walking through every step again.
 */
export function nextStep(step: StepId, data: Data, now?: Date): StepId {
  const later = STEP_IDS.slice(STEP_IDS.indexOf(step) + 1);
  return later.find((id) => Object.keys(validate(id, data, now)).length > 0) ?? "review";
}

export function previousStep(step: StepId): StepId | undefined {
  return STEP_IDS[STEP_IDS.indexOf(step) - 1];
}
