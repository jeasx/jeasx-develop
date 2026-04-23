import Actions from "./components/Actions";
import Error from "./components/Error";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage Details for Person" data={data}>
      <Form>
        <Legend>
          You have indicated that a person was damaged. Do you have any additional details?
        </Legend>
        <RadioGroup
          label="Is the person who was damaged the same as the person you already entered?"
          options={["Yes", "No"]}
          name="additional_person"
          value={form.additional_person}
        />
        <RadioGroup
          name="salutation"
          label="Salutation"
          options={["Ms.", "Mr."]}
          value={form.salutation}
        />
        <Input name="firstname" label="First Name" value={form.firstname} />
        <Input name="lastname" label="Last Name" value={form.lastname} />
        <Textarea
          name="description"
          label="Can you provide further details about the person's injuries?"
          value={form.description}
          placeholder="e.g. broken arm, broken leg"
        />
        <RadioGroup
          label="Have any other persons been damaged?"
          options={["Yes", "No"]}
          name="any_other_persons_hurt"
          value={form.any_other_persons_hurt}
        />
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
