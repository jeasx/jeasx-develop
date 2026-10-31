import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage Details for Animal or Object" data={data}>
      <Form>
        <Legend>
          You have indicated that an object or an animal was damaged. Do you have any additional
          details?
        </Legend>
        <Input
          name="label"
          label="Which object or animal was it?"
          value={form.label}
          placeholder="e.g. glasses, bike, dog"
        />
        <Textarea
          name="description"
          label="What exactly was damaged on the object or animal?"
          value={form.description}
          placeholder="e.g. the pole was knocked over"
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
