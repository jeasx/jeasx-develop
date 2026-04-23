import Submit from "./Submit";

export default function Actions() {
  return (
    <section role="group">
      <Submit label="Back" value="Back" />
      &nbsp;
      <Submit label="Save" value="Save" class="secondary" />
      &nbsp;
      <Submit label="Next" value="Next" />
    </section>
  );
}
