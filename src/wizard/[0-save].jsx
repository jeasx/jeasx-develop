import Layout from "./Layout";
import Form from "./components/Form";
import Headline from "./components/Headline";
import Input from "./components/Input";
import Submit from "./components/Submit";
import { SLUGS, TOKEN_PATTERN } from "./domain/constants";

/**
 * Shows the token of a claim saved by the "Save" button (see [...guard].js).
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const token = String(request.query["token"] ?? "");
  // Nothing was saved without a valid token, e.g. when the page is opened directly.
  if (!TOKEN_PATTERN.test(token)) {
    return reply.redirect(SLUGS.START);
  }

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
