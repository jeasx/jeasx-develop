export default function Textarea({
  name,
  label = "",
  value = "",
  rows = 5,
  required = false,
  placeholder = "",
}) {
  return (
    <label>
      {label}
      <textarea name={name} rows={rows} placeholder={placeholder} required={required}>
        {value}
      </textarea>
    </label>
  );
}
