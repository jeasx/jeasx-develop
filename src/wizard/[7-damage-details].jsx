import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage details" data={data}>
      <Form>
        <Legend>When did the damage happen (or when did you notice it)?</Legend>
        <Input name="date" type="date" label="Date" value={form.date} />
        <Input name="time" type="time" label="Time" value={form.time} />
        <Legend>Where did it happen?</Legend>
        <Input name="street" label="Street" value={form.street} />
        <Input name="zip" label="Postal code (5 digits)" value={form.zip} />
        <Input name="city" label="City" value={form.city} />
        <Legend id="description-label">Please briefly describe what happened.</Legend>
        {/* The heading is the label of the field, so screen readers announce it. */}
        <Textarea
          name="description"
          aria-labelledby="description-label"
          value={form.description}
          placeholder="e.g. I backed into a parked car while leaving a parking space"
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
