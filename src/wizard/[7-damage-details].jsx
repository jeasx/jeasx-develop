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
        <Legend>When did the damage occur or when did you become aware of the damage?</Legend>
        <Input name="date" type="date" label="Date" value={form.date} />
        <Input name="time" type="time" label="Time" value={form.time} />
        <Legend>At which address did the damage occur?</Legend>
        <Input name="street" label="Street" value={form.street} />
        <Input name="zip" label="Postal code" value={form.zip} />
        <Input name="city" label="City" value={form.city} />
        <Legend>Please briefly describe what happened.</Legend>
        <Textarea
          name="description"
          value={form.description}
          placeholder="e.g. I backed into a parked car while leaving a parking space"
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
