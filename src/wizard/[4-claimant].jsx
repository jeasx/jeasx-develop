import Actions from "./components/Actions";
import Error from "./components/Error";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import { SLUGS } from "./domain/constants";
import Layout from "./Layout";

export default function ({ form, errors, data }) {
  return (
    <Layout title="Claimant" data={data}>
      <Form>
        <Legend>Your personal details</Legend>
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
        <Input name="birthday" label="Date of birth" value={form.birthday} type="date" />
        <Legend>Address</Legend>
        <Input name="street" label="Street" value={form.street} />
        <Input name="zip" label="Postal code" value={form.zip} />
        <Input name="city" label="City" value={form.city} />
        <Legend>Contact details for inquiries and notifications</Legend>
        <Input name="email" label="Email" value={form.email} type="email" />
        <Input name="phone" label="Phone" value={form.phone} type="tel" />
        <Legend>Other details</Legend>
        {data[SLUGS.CLAIM_REPORT]?.["claim_report"] === "Insured" && (
          <Input name="policy_number" label="Insurance policy number" value={form.policy_number} />
        )}
        <Input name="license_plate" label="Official license plate" value={form.license_plate} />
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
