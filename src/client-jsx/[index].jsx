import Layout from "../Layout";

export default function () {
  return (
    <Layout title="Asynchronous JSX components in the browser" script="./index.js">
      <h1>(Asynchronous) JSX components in the browser</h1>
      <p>
        You can use JSX components built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> also in the
        browser for lightweight rendering of client-side markup.
      </p>
      <form
        onsubmit={
          /* js */ `
          event.preventDefault();
          const form = new FormData(event.target);
          renderJSX(
            document.getElementById("jokes"), 
            form.get("component"),
            {
                category: form.get("category"),
                amount: form.get("amount")
            }
            );`
        }
      >
        <input name="amount" type="number" min="1" max="5" value="3" />
        <select name="category">
          <option>general</option>
          <option>knock-knock</option>
          <option>programming</option>
        </select>
        <select name="component">
          <option value="JokesHTML">HTML</option>
          <option value="JokesJSON">JSON</option>
        </select>
        <button class="btn btn-primary" type="submit">
          Tell me jokes
        </button>
      </form>
      <div id="jokes"></div>
    </Layout>
  );
}
