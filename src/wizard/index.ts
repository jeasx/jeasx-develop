// Without JavaScript, the wizard works as plain forms: the server validates every submit.
// This script adds instant feedback in the browser with the *same* validator and summary
// component the server uses, so both always agree. The server still checks every submit.
import formatCard from "./client/card";
import { showErrorSummary, showFieldErrors, showSummary } from "./client/feedback";
import { addDays, parseDate, toDateString } from "./domain/dates";
import type { Data, Form, StepId } from "./domain/types";
import validate from "./domain/validate";

const form = document.querySelector("form.wizard-form");
if (form instanceof HTMLFormElement) {
  enhance(form);
}

function enhance(form: HTMLFormElement) {
  const step = form.dataset.step as StepId;
  // Answers of the other steps, needed for rules across steps.
  const others: Data = JSON.parse(form.dataset.state ?? "{}");
  const slots = () => [...form.querySelectorAll("[data-error-for]")];

  // Errors are only shown for fields you're done with: those left once, or all after a submit.
  // Fields the server already complained about keep updating as they are fixed.
  const touched = new Set(
    slots()
      .filter((slot) => slot.textContent?.trim())
      .map((slot) => slot.getAttribute("data-error-for") ?? ""),
  );

  const answers = () => {
    const values: Form = {};
    for (const [key, value] of new FormData(form)) {
      if (!key.startsWith("$") && typeof value === "string") values[key] = value;
    }
    return { ...others, [step]: values };
  };

  const check = () => {
    const errors = validate(step, answers());
    showFieldErrors(form, errors, touched);
    return errors;
  };

  form.addEventListener("focusout", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type !== "radio" && target.name) {
      touched.add(target.name);
      check();
    }
  });

  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type === "radio" || target.type === "checkbox") touched.add(target.name);
    // Rules depend on each other (e.g. infants ≤ adults), so a change can fix another field.
    if (target.name === "adults") touched.add("infants");
    if (target.name === "depart") limitReturn(form, target.value);
    if (target.name.startsWith("card_")) formatCard(target);
    check();
    showSummary(answers());
  });

  form.addEventListener("submit", (event) => {
    const submitter = event.submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "back") return;
    slots().forEach((slot) => touched.add(slot.getAttribute("data-error-for") ?? ""));
    const errors = check();
    if (Object.keys(errors).length === 0) {
      submitter?.setAttribute("aria-busy", "true");
      return;
    }
    event.preventDefault();
    showErrorSummary(form, errors);
  });

  const depart = form.elements.namedItem("depart");
  if (depart instanceof HTMLInputElement) limitReturn(form, depart.value);
}

/**
 * The return date picker offers the days from the day after departure on.
 */
function limitReturn(form: HTMLFormElement, value: string) {
  const time = parseDate(value);
  const back = form.elements.namedItem("return");
  if (time !== undefined && back instanceof HTMLInputElement) {
    back.min = toDateString(addDays(time, 1));
    back.max = toDateString(addDays(time, 30));
  }
}
