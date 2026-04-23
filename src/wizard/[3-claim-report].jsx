import Actions from "./components/Actions";
import Error from "./components/Error";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Claim Report" data={data}>
      <Form>
        <Legend>I am reporting the claim as:</Legend>
        <Input
          name="claim_report"
          value="Insured"
          type="radio"
          checked={form.claim_report === "Insured"}
          label="I am the insured and have caused damage to someone else"
        />
        <Input
          name="claim_report"
          value="InvolvedParty"
          type="radio"
          checked={form.claim_report === "InvolvedParty"}
          label="Involved party who was damaged by a person who is insured"
        />
        <Actions />
        <Error message={errors} />
      </Form>
    </Layout>
  );
}
