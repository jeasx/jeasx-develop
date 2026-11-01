import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Damage types" data={data}>
      <Form>
        <Legend>What happened? Select all that apply.</Legend>
        {[
          "I had a traffic accident with another person, and I know who they are",
          "I had a traffic accident involving an animal",
          "My vehicle was damaged",
          "Another person's vehicle was damaged",
          "I damaged an object or an animal",
          "Someone damaged my vehicle, but I don't know who",
          "Someone was injured in the accident (including me)",
        ].map((damageType, index) => (
          <Input
            type="checkbox"
            name="damage_types[]"
            value={`${index + 1}`}
            // A single selection arrives as string, several as array.
            checked={[form["damage_types[]"] ?? []].flat().includes(String(index + 1))}
            label={damageType}
          />
        ))}
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
