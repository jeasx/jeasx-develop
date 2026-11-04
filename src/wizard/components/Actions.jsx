import Submit from "./Submit";

export default function Actions() {
  return (
    <section class="wizard-actions">
      {/* Pressing Enter in a field submits the form with its first submit button, which would be
          "Back". This invisible copy of "Next" comes first, so Enter moves forward instead.
          It is moved off-screen rather than hidden, as browsers may skip hidden buttons. */}
      <Submit
        label="Next"
        value="Next"
        tabindex="-1"
        aria-hidden="true"
        style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
      />
      <Submit label="← Back" value="Back" class="outline secondary" />
      <span class="wizard-actions-end">
        <Submit label="Save" value="Save" class="secondary" />
        <Submit label="Next →" value="Next" />
      </span>
    </section>
  );
}
