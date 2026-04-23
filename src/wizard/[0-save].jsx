import { createHash } from "node:crypto";
import Layout from "./Layout";
import Form from "./components/Form";
import Headline from "./components/Headline";
import Input from "./components/Input";
import Submit from "./components/Submit";
import { compress } from "./utils/zip";

/**
 * @param {import("../types").RouteProps & any} props
 */
export default function ({ reply, data }) {
  const token =
    "ID-" + createHash("sha1").update(JSON.stringify(data)).digest("hex").slice(0, 8).toUpperCase();
  reply.setCookie(token, compress(data));
  reply.clearCookie("data");

  return (
    <Layout title="Save">
      <Form>
        <Headline>Your data has been saved</Headline>
        <Input
          label="To reload your data, please use the following token:"
          readonly
          value={token}
        />
        <Submit label="Start new claim report" />
      </Form>
    </Layout>
  );
}
