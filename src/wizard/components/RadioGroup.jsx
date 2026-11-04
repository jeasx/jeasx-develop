export default function RadioGroup({
  label,
  name,
  value,
  options,
  required = false,
  submitOnChange = false,
}) {
  // aria-labelledby gives the group its label, so screen readers announce the question
  // together with each option (like a <legend>, without changing the layout).
  const labelId = `${name}-label`;
  return (
    <div class="wizard-field">
      <span id={labelId}>{label}</span>
      <div role="group" aria-labelledby={labelId} class="wizard-choices">
        {options.map((item) => (
          <label>
            <input
              type="radio"
              name={name}
              value={item}
              checked={value === item}
              required={required}
              data-submit={submitOnChange ? "change" : undefined}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
