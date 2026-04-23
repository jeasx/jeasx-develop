import * as prettier from "prettier";
import Layout from "../Layout";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const form = request.body || { printWidth: 80, tabWidth: 2 };

  if (request.query["printWidth"] && request.query["tabWidth"]) {
    this.responseHandler = async (payload) => {
      reply.type("text/plain; charset=utf-8");
      return typeof payload === "string"
        ? await prettier.format(payload, {
            parser: "html",
            printWidth: Number(request.query["printWidth"]),
            tabWidth: Number(request.query["tabWidth"]),
          })
        : payload;
    };
  }

  return (
    <Layout title="Format resulting HTML with Prettier">
      <h1>Post process HTML with Prettier</h1>
      <p>
        Jeasx allows you to post-process the resulting HTML output via a response handler. Have a
        look at the source how things are wired up. This is an example for how to use prettier to
        format the resulting HTML.
      </p>
      <form action="" method="post">
        <label>
          Print width:
          <input type="number" name="printWidth" value={form["printWidth"]} />
        </label>
        <label>
          Tab width:
          <input type="number" name="tabWidth" value={form["tabWidth"]} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <iframe
        src={`?printWidth=${form["printWidth"]}&tabWidth=${form["tabWidth"]}`}
        style="width: 100%; height: 300px; border: 1px solid lightgray;"
      ></iframe>
    </Layout>
  );
}
