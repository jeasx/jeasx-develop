import Actions from "./components/Actions";
import Form from "./components/Form";
import Headline from "./components/Headline";
import Paragraph from "./components/Paragraph";
import Layout from "./Layout";

export default function ({ data }) {
  return (
    <Layout title="Legal Notice" data={data}>
      <Form>
        <Headline>Legal Notice</Headline>
        <Paragraph>
          I am aware that false, incomplete or delayed information, evidence and documents can lead
          to a loss of insurance coverage, to the extent that they are relevant to the determination
          of the insurance claim or the insurance company's obligation to provide benefits.
        </Paragraph>
        <Paragraph>
          In the event of intentional false, incomplete or delayed information, evidence and
          documents, the insurance company may be entitled to refuse to provide benefits. If the
          breach is due to gross negligence, the insurance company may be entitled to reduce its
          benefits in a proportionate manner, up to a complete loss of the claim.
        </Paragraph>
        <Actions />
      </Form>
    </Layout>
  );
}
