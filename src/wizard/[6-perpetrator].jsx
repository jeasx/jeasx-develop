import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Insured (perpetrator)" data={data}>
      <Form>
        <Legend>Insured (perpetrator) details</Legend>
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
        <Legend>Address</Legend>
        <Input name="street" label="Street" value={form.street} />
        <Input name="zip" label="Postal code" value={form.zip} />
        <Input name="city" label="City" value={form.city} />
        <Legend>Contact details for inquiries and notifications</Legend>
        <Input name="phone" label="Phone" value={form.phone} type="tel" />
        <Legend>Other details</Legend>
        <Input
          name="policy_number"
          label="Insurance policy number (if applicable)"
          value={form.policy_number}
        />
        <Input
          name="license_plate"
          label="Official license plate (if applicable)"
          value={form.license_plate}
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
