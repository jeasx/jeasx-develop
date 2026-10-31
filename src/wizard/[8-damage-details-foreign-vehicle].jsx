import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage Details for Other Vehicle" data={data}>
      <Form>
        <Legend>
          You have indicated that another vehicle was damaged. Do you have any additional details?
        </Legend>
        <Input
          name="license_plate"
          label="Official license plate"
          value={form.license_plate}
          placeholder="XYZ-XV 123"
        />
        <Textarea
          name="description"
          label="Where was the vehicle damaged?"
          value={form.description}
          placeholder="e.g. bumper or passenger door"
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
