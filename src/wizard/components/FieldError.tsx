// Every field renders an (often empty) error slot with a stable id, so the browser script can
// fill in the same messages the server would, and screen readers find them via aria-describedby.

export default function FieldError({ name, error = "" }: { name: string; error?: string }) {
  return (
    <p class="field-error" id={`${name}-error`} data-error-for={name}>
      {error}
    </p>
  );
}
