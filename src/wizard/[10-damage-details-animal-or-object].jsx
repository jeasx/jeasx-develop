import Actions from "./components/Actions";
import Error from "./components/Error";
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
          You have indicated that an object was damaged. Do you have any additional details?
        </Legend>
        <Input
          name="label"
          label="Label of the object or animal?"
          value={form.label}
          placeholder="e.g. glasses, bike, dog"
        />
        <Textarea
          name="description"
          label="What was exactly damaged on the object or animal?"
          value={form.description}
          placeholder="e.g. the pole was knocked over"
        />
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
