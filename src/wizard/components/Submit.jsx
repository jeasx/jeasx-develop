export default function Submit({ label, value = "", ...rest }) {
  return (
    <button class="btn btn-primary" type="submit" name="$action" value={value || label} {...rest}>
      {label}
    </button>
  );
}
