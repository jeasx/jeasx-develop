import FieldError from "./FieldError";

/**
 * Radios styled as tiles, pills or a segmented control. The first radio gets the field's
 * name as id, so a <label for> in the error summary can focus the group.
 */
export default function Choices({
  name,
  legend,
  value = "",
  error = "",
  options,
  variant = "pills",
  class: className = "",
}: {
  name: string;
  legend: string;
  value?: string;
  error?: string;
  options: {
    value: string;
    label: JSX.Element | string;
    detail?: JSX.Element | string;
    style?: string;
  }[];
  variant?: "tiles" | "pills" | "segments";
  class?: string;
}) {
  return (
    <fieldset
      class={`field choices choices-${variant} ${className}`}
      data-field={name}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={`${name}-error`}
    >
      <legend>{legend}</legend>
      <div class="choices-list">
        {options.map((option, index) => (
          <label class="choice" style={option.style}>
            <input
              type="radio"
              id={index === 0 ? name : undefined}
              name={name}
              value={option.value}
              checked={String(value) === option.value}
            />
            <span class="choice-label">{option.label}</span>
            {option.detail && <span class="choice-detail">{option.detail}</span>}
          </label>
        ))}
      </div>
      <FieldError name={name} error={error} />
    </fieldset>
  );
}
