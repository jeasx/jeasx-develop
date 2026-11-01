import ErrorMessage from "./components/ErrorMessage";
import Form from "./components/Form";
import Input from "./components/Input";
import Paragraph from "./components/Paragraph";
import Submit from "./components/Submit";
import Layout from "./Layout";

export default function ({ form, errors }) {
  return (
    <Layout title="Start">
      <Form>
        <Paragraph>
          <small>
            This demo shows a multi-step form rendered entirely on the server: the next step depends
            on your answers, which are stored in a cookie in your browser. Nothing is stored on the
            server or forwarded.
          </small>
        </Paragraph>
        <Paragraph>
          Answer a few questions about the damage, so we can process your claim. Steps that don't
          apply to you are skipped.
        </Paragraph>
        <Paragraph>
          You can save your claim at any time and get a token to continue it in this browser within
          24 hours. Saving again replaces your previously saved claim.
        </Paragraph>
        <Input
          label="Continue a saved claim (optional): enter your token"
          name="$hash"
          placeholder="ID-1A2B3C4D"
          value={form["$hash"]}
        />
        <Submit label="Start claim" />
        <ErrorMessage message={errors} />
      </Form>
    </Layout>
  );
}
