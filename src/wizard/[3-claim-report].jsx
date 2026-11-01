import Actions from "./components/Actions";
import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Legend from "./components/Legend";
import Layout from "./Layout";

export default function ({ data, form, errors }) {
  return (
    <Layout title="Claim report" data={data}>
      <Form>
        <Legend>Who are you in this claim?</Legend>
        <Input
          name="claim_report"
          value="Insured"
          type="radio"
          checked={form.claim_report === "Insured"}
          label="I am insured and caused damage to someone else"
        />
        <Input
          name="claim_report"
          value="InvolvedParty"
          type="radio"
          checked={form.claim_report === "InvolvedParty"}
          label="Someone who is insured caused damage to me"
        />
        <Actions />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
