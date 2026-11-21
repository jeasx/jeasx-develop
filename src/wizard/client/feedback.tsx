// Shows validation results in the slots the server renders, so both look the same.
import { jsxToString } from "jsx-async-runtime";
import ErrorSummary from "../components/ErrorSummary";
import Summary from "../components/Summary";
import type { Data, Errors } from "../domain/types";

/**
 * Writes the errors of touched fields into their slots and marks valid ones with a check.
 */
export function showFieldErrors(form: HTMLFormElement, errors: Errors, touched: Set<string>) {
  for (const slot of form.querySelectorAll("[data-error-for]")) {
    const name = slot.getAttribute("data-error-for") ?? "";
    const message = touched.has(name) ? (errors[name] ?? "") : "";
    slot.textContent = message;
    const field = form.querySelector(`[data-field="${name}"]`);
    // Radio groups are marked on their fieldset, other fields on their input.
    const control = field?.matches("fieldset") ? field : form.querySelector(`[name="${name}"]`);
    if (message) {
      control?.setAttribute("aria-invalid", "true");
    } else {
      control?.removeAttribute("aria-invalid");
    }
    field?.classList.toggle("field-ok", touched.has(name) && !message && hasValue(form, name));
  }
}

/**
 * Replaces the error summary at the top, focuses it and shakes the form.
 */
export async function showErrorSummary(form: HTMLFormElement, errors: Errors) {
  const summary = await render(<ErrorSummary errors={errors} />, "#error-summary");
  summary?.scrollIntoView({ behavior: "smooth", block: "center" });
  summary?.focus({ preventScroll: true });
  form.classList.remove("shake");
  void form.offsetWidth; // restarts the animation
  form.classList.add("shake");
}

/**
 * Renders the boarding pass again, e.g. with a new destination or price.
 */
export function showSummary(data: Data) {
  return render(<Summary data={data} />, "#summary");
}

function hasValue(form: HTMLFormElement, name: string) {
  const el = form.elements.namedItem(name);
  if (el instanceof RadioNodeList) return el.value !== "";
  if (el instanceof HTMLInputElement) return el.type === "checkbox" ? el.checked : el.value !== "";
  return false;
}

/**
 * Replaces the element matching the selector with a component, rendered like on the server.
 */
async function render(jsx: JSX.Element, selector: string) {
  const template = document.createElement("template");
  template.innerHTML = await jsxToString(jsx);
  const element = template.content.firstElementChild as HTMLElement;
  document.querySelector(selector)?.replaceWith(element);
  return element;
}
