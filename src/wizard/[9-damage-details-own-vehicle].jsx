import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage details for your own vehicle" data={data}>
      <Form>
        <Legend>
          You have indicated that your own vehicle was damaged. Do you have any additional details?
        </Legend>
        <Textarea
          name="description"
          label="Which parts of your vehicle were damaged?"
          value={form.description}
          placeholder="e.g. bumper or passenger door"
        />
        <RadioGroup
          label="Is the vehicle rented or leased?"
          options={["Yes", "No"]}
          name="was_rented_hired_or_leased"
          value={form.was_rented_hired_or_leased}
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
