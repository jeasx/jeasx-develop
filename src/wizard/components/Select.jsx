export default function Select({
  label,
  name,
  required = false,
  submitOnChange = false,
  children,
}) {
  return (
    <label>
      {label}
      <div class="flex-space-between">
        <select
          name={name}
          data-submit={submitOnChange ? "change" : undefined}
          required={required}
          autofocus
        >
          {children}
        </select>
        {submitOnChange && (
          <noscript>
            <button class="btn btn-primary" value="Refresh">
              Refresh
            </button>
          </noscript>
        )}
      </div>
    </label>
  );
}
