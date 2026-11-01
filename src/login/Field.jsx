/**
 * A labelled input which shows its error message below and links it for screen readers.
 *
 * @param {{ label: string, name: string, error?: string, hint?: string } & Record<string, unknown>} props
 */
export default function Field({ label, name, error, hint, ...attributes }) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <label>
      {label}
      <input
        name={name}
        id={name}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...attributes}
      />
      {error ? (
        <small id={`${name}-error`}>{error}</small>
      ) : (
        hint && <small id={`${name}-hint`}>{hint}</small>
      )}
    </label>
  );
}
