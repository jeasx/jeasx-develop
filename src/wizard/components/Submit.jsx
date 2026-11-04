export default function Submit({ label, value = "", ...rest }) {
  return (
    <button type="submit" name="$action" value={value || label} {...rest}>
      {label}
    </button>
  );
}
