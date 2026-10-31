import * as prettier from "prettier";
import Layout from "../Layout";

// Limit the options, as a huge tabWidth would inflate the output to many megabytes.
const PRINT_WIDTH = { min: 20, max: 200, fallback: 80 };
const TAB_WIDTH = { min: 1, max: 8, fallback: 2 };

/**
 * @this {import("../types").ThisContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = request.body || {};
  const form = {
    printWidth: toOption(body["printWidth"], PRINT_WIDTH),
    tabWidth: toOption(body["tabWidth"], TAB_WIDTH),
  };

  if (request.query["printWidth"] && request.query["tabWidth"]) {
    this.responseHandler = async (payload) => {
      reply.type("text/plain; charset=utf-8");
      return typeof payload === "string"
        ? await prettier.format(payload, {
            parser: "html",
            printWidth: toOption(request.query["printWidth"], PRINT_WIDTH),
            tabWidth: toOption(request.query["tabWidth"], TAB_WIDTH),
          })
        : payload;
    };
  }

  return (
    <Layout
      title="Format resulting HTML with Prettier"
      description="Format the resulting HTML with Prettier via a response handler."
    >
      <h1>Post-process HTML with Prettier</h1>
      <p>
        Jeasx allows you to post-process the resulting HTML output via a response handler. Have a
        look at the source to see how things are wired up. This is an example of how to use Prettier
        to format the resulting HTML.
      </p>
      <form action="" method="post">
        <label>
          Print width:
          <input
            type="number"
            name="printWidth"
            min={PRINT_WIDTH.min}
            max={PRINT_WIDTH.max}
            value={form["printWidth"]}
          />
        </label>
        <label>
          Tab width:
          <input
            type="number"
            name="tabWidth"
            min={TAB_WIDTH.min}
            max={TAB_WIDTH.max}
            value={form["tabWidth"]}
          />
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

/**
 * Parses a number and keeps it within the given range; uses the fallback for invalid input.
 *
 * @param {unknown} value
 * @param {{ min: number, max: number, fallback: number }} range
 */
function toOption(value, { min, max, fallback }) {
  const number = Number.parseInt(String(value), 10);
  return Number.isFinite(number) ? Math.min(Math.max(number, min), max) : fallback;
}
