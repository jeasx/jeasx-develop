export default function Input({
  name = "",
  label = "",
  value = "",
  required = false,
  type = undefined,
  ...rest
}) {
  const labelAfter = type === "radio" || type === "checkbox";
  return (
    <label>
      {!labelAfter && label}
      <input type={type || "text"} name={name} value={value} required={required} {...rest} />
      {labelAfter && label}
    </label>
  );
}
