import Form from "./components/Form";
import Headline from "./components/Headline";
import Paragraph from "./components/Paragraph";
import Submit from "./components/Submit";
import Layout from "./Layout";

/**
 * The answers are cleared when the last step is submitted (see [...guard].js),
 * so opening this page never deletes anything.
 */
export default function () {
  return (
    <Layout title="Thank you">
      <Form>
        <Headline>Thank you</Headline>
        <Paragraph>You have completed all steps of the claim report.</Paragraph>
        <Paragraph>
          This is a demo, so your answers weren't stored on the server or forwarded, and they have
          been deleted from your browser.
        </Paragraph>
        <Submit label="Start new claim" />
      </Form>
    </Layout>
  );
}
