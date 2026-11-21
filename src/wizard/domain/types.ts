/** The fields of one step as submitted by its form, e.g. { destination: "lis", adults: "2" }. */
export type Form = Record<string, string>;

/** The answers of all steps, e.g. { trip: { destination: "lis" }, travelers: { ... } }. */
export type Data = Partial<Record<StepId, Form>>;

/** Messages by field name, e.g. { depart: "Enter your departure date." }. */
export type Errors = Record<string, string>;

export type StepId = "trip" | "travelers" | "extras" | "review";

/** What the guard passes to the page of a step. */
export type StepProps = {
  step: StepId;
  data: Data;
  form: Form;
  errors: Errors;
};
