import Actions from "./components/Actions";
import Error from "./components/Error";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Insured (Perpetrator)" data={data}>
      <Form>
        <Legend>Insured (Perpetrator) Details</Legend>
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
        <Input name="firstname" label="First Name" value={form.firstname} />
        <Input name="lastname" label="Last Name" value={form.lastname} />
        <Legend>Address</Legend>
        <Input name="street" label="Street" value={form.street} />
        <Input name="zip" label="Postal Code" value={form.zip} />
        <Input name="city" label="City" value={form.city} />
        <Input
          name="license_plate"
          label="Official License Plate (if applicable)"
          value={form.license_plate}
        />
        <Legend>Contact for inquiries and notifications</Legend>
        <Input name="phone" label="Phone" value={form.phone} type="tel" />
        <Input
          name="policy_number"
          label="Insurance Policy Number (if applicable)"
          value={form.policy_number}
        />
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
