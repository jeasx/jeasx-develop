import Form from "./components/Form";
import Headline from "./components/Headline";
import Paragraph from "./components/Paragraph";
import Submit from "./components/Submit";
import Layout from "./Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ reply }) {
  reply.clearCookie("data");

  return (
    <Layout title="Thank you">
      <Form>
        <Headline>Thank you</Headline>
        <Paragraph>
          You have successfully reported your claim to the private liability insurance.
        </Paragraph>
        <Paragraph>
          If you have any further questions, please contact us via chat or phone.
        </Paragraph>
        <Submit label="Start new claim" />
      </Form>
    </Layout>
  );
}
