/**
 * Back on the left, Next on the right.
 */
export default function Actions({
  next = "Continue",
  back = true,
}: {
  next?: string;
  back?: boolean;
}) {
  return (
    <div class="actions">
      {/* Pressing Enter submits the form with its first submit button, which would be "Back".
          This invisible copy of "Next" comes first, so Enter moves forward instead. */}
      <button
        type="submit"
        name="$action"
        value="next"
        tabindex="-1"
        aria-hidden="true"
        class="actions-enter"
      >
        {next}
      </button>
      {back ? (
        <button type="submit" name="$action" value="back" class="outline secondary">
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button type="submit" name="$action" value="next" class="actions-next">
        {next} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
