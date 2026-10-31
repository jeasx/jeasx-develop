import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import RadioGroup from "./components/RadioGroup";
import Textarea from "./components/Textarea";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage details for person" data={data}>
      <Form>
        <Legend>
          You have indicated that a person was injured. Do you have any additional details?
        </Legend>
        <RadioGroup
          label="Is the injured person the same as the person you already entered?"
          options={["Yes", "No"]}
          name="same_person"
          value={form.same_person}
        />
        <RadioGroup
          name="salutation"
          label="Salutation"
          options={["Ms.", "Mr."]}
          value={form.salutation}
        />
        <Input name="firstname" label="First name" value={form.firstname} />
        <Input name="lastname" label="Last name" value={form.lastname} />
        <Textarea
          name="description"
          label="Can you provide further details about the person's injuries?"
          value={form.description}
          placeholder="e.g. broken arm, broken leg"
        />
        <RadioGroup
          label="Has anyone else been injured?"
          options={["Yes", "No"]}
          name="any_other_persons_hurt"
          value={form.any_other_persons_hurt}
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
