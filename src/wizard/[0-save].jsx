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
export default function ({ request, reply, data }) {
  const token =
    "ID-" + createHash("sha1").update(JSON.stringify(data)).digest("hex").slice(0, 8).toUpperCase();
  // Keep only the latest saved report. Each one takes up to 4 KB, so piling them up
  // would push the Cookie header beyond the server's limit and every request would fail.
  for (const name of Object.keys(request.cookies)) {
    if (name !== token && /^ID-[0-9A-F]{8}$/.test(name)) {
      reply.clearCookie(name);
    }
  }
  // Keep the saved report for 10 days, as promised on the start page.
  reply.setCookie(token, compress(data), { maxAge: 10 * 24 * 60 * 60 });
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
        <Submit label="Start new claim" />
      </Form>
    </Layout>
  );
}
