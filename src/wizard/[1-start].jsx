import Form from "./components/Form";
import Input from "./components/Input";
import Paragraph from "./components/Paragraph";
import Submit from "./components/Submit";
import Layout from "./Layout";

export default function () {
  return (
    <Layout title="Start">
      <Form>
        <Paragraph>
          In the following, we will ask you some questions to be able to assign and process the
          reported damage.
        </Paragraph>
        <Paragraph>
          You can save your damage report at any time and retrieve it within 10 days using the code.
        </Paragraph>
        <Input
          label="If you want to continue an already started damage report:"
          name="$hash"
          placeholder="ID-XVYZ9SH"
        />
        <Submit label="Start damage report" />
      </Form>
    </Layout>
  );
}
