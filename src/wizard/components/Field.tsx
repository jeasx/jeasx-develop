import FieldError from "./FieldError";

type Props = {
  name: string;
  label: string;
  value?: string;
  error?: string;
  hint?: string;
  type?: "text" | "date" | "email" | "tel";
  class?: string;
  /** Other attributes of the input, e.g. autocomplete or placeholder. */
  [attribute: string]: unknown;
};

export default function Field({
  name,
  label,
  value = "",
  error = "",
  hint = "",
  type = "text",
  class: className = "",
  ...rest
}: Props) {
  return (
    <div class={`field ${className}`} data-field={name}>
      <label for={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        maxlength="100"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={`${name}-error${hint ? ` ${name}-hint` : ""}`}
        {...rest}
      />
      {hint && (
        <small class="field-hint" id={`${name}-hint`}>
          {hint}
        </small>
      )}
      <FieldError name={name} error={error} />
    </div>
  );
}
