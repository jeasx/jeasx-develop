import Layout from "../Layout";
import jokes from "./jokes";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const body = request.body || {};
  const category = body["category"];
  const counter = Number(body["counter"] || request.cookies["counter"] || "3");
  const data = category ? jokes(category, counter) : [];
  reply.setCookie("counter", String(counter));

  return (
    <Layout title="Building forms with Jeasx" description="Some funny jokes with Jeasx">
      <h1>Building a simple form</h1>
      <p>
        Jeasx allows you to build and evaluate server rendered forms easily, so you don't have to
        rely on JavaScript in the frontend to make form submission work.
      </p>
      <form method="post">
        <fieldset class="grid">
          <button
            class="btn btn-secondary"
            name="counter"
            value={counter - 1}
            disabled={counter === 1}
          >
            -
          </button>
          <button
            class="btn btn-secondary"
            name="counter"
            value={counter + 1}
            disabled={counter === 5}
          >
            +
          </button>
        </fieldset>
        <fieldset class="grid">
          <button class="btn btn-primary" name="category" value="programming">
            Tell me {counter} nerd {counter === 1 ? "joke" : "jokes"}
          </button>
        </fieldset>
        <fieldset class="grid">
          <button class="btn btn-primary" name="category" value="general">
            Tell me {counter} {counter === 1 ? "pun" : "puns"}
          </button>
        </fieldset>
      </form>
      {data.length > 0 && (
        <ul>
          {data.map((joke) => (
            <li>{joke}</li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
