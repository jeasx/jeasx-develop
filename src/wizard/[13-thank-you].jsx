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
        <Paragraph>
          You have successfully reported your claim to your car insurance.
        </Paragraph>
        <Paragraph>
          If you have any further questions, please contact us via chat or phone.
        </Paragraph>
        <Submit label="Start new claim" />
      </Form>
    </Layout>
  );
}
