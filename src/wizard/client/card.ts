import { cardBrand } from "../domain/validate";

/**
 * Groups the card number in blocks of four, adds the slash to the expiry date and mirrors
 * the fields on the card preview.
 */
export default function formatCard(input: HTMLInputElement) {
  if (input.name === "card_number") {
    const digits = input.value.replace(/\D/g, "").slice(0, 19);
    const grouped = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    if (grouped !== input.value) input.value = grouped;
    setText("[data-card-number]", grouped || "•••• •••• •••• ••••");
    setText("[data-card-brand]", cardBrand(digits) ?? "");
  } else if (input.name === "card_expiry") {
    const digits = input.value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    // Leaves "08/" alone while deleting, otherwise the slash would come right back.
    if (formatted !== input.value && !input.value.endsWith("/")) input.value = formatted;
    setText("[data-card-expiry]", input.value || "MM/YY");
  } else if (input.name === "card_name") {
    setText("[data-card-name]", input.value.toUpperCase() || "YOUR NAME");
  }
}

function setText(selector: string, text: string) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}
