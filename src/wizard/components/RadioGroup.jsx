export default function RadioGroup({
  label,
  name,
  value,
  options,
  required = false,
  submitOnChange = false,
}) {
  return (
    <div>
      {label}
      <div role="group">
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
