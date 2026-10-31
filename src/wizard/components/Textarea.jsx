export default function Textarea({
  name,
  label = "",
  value = "",
  rows = 5,
  required = false,
  placeholder = "",
  maxlength = 1000,
}) {
  return (
    <label>
      {label}
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        maxlength={maxlength}
      >
        {value}
      </textarea>
    </label>
  );
}
