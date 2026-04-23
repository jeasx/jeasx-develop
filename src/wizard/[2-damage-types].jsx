import Actions from "./components/Actions";
import Error from "./components/Error";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage Types" data={data}>
      <Form>
        <Legend>Please select from the following options (multiple selections possible):</Legend>
        {[
          "I had a traffic accident with another person, who is known to me",
          "I had a traffic accident with or caused by an animal",
          "My vehicle has been damaged",
          "The other person's vehicle is damaged",
          "I damaged an object or an animal",
          "The person who damaged my car is unknown to me (could not be identified)",
          "People were injured in the accident (including yourself)",
        ].map((damageType, index) => (
          <Input
            type="checkbox"
            name="damage_types[]"
            value={`${index + 1}`}
            checked={form["damage_types[]"]?.includes(String(index + 1))}
            label={damageType}
          />
        ))}
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
