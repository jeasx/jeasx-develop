import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Injured party" data={data}>
      <Form>
        <Legend>Who suffered the damage?</Legend>
        <RadioGroup
          name="salutation"
          label="Salutation"
          options={["Ms.", "Mr.", "Company"]}
          value={form.salutation}
          submitOnChange
        />
        {["Company", undefined].includes(form.salutation) && (
          <Input name="company" label="Company" value={form.company} />
        )}
        <Input name="firstname" label="First name" value={form.firstname} />
        <Input name="lastname" label="Last name" value={form.lastname} />
        <Input name="license_plate" label="Official license plate" value={form.license_plate} />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
