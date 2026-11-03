import Layout from "../Layout";

export default function () {
  return (
    <Layout
      title="Asynchronous JSX components in the browser"
      description="Render asynchronous JSX components in the browser with jsx-async-runtime."
      script="/client-jsx/index.js"
    >
      <h1>Asynchronous JSX components in the browser</h1>
      <p>
        You can also use JSX components built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a> in the browser
        for lightweight rendering of client-side markup. Choose how many jokes you want and how they
        should be shown: the components fetch the jokes and render them right in your browser.
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
        <label>
          Number of jokes
          <input name="amount" type="number" min="1" max="5" value="3" />
        </label>
        <label>
          Category
          <select name="category">
            <option>general</option>
            <option>knock-knock</option>
            <option>programming</option>
          </select>
        </label>
        <label>
          Show as
          <select name="component">
            <option value="JokesHTML">List (HTML)</option>
            <option value="JokesJSON">Raw data (JSON)</option>
          </select>
        </label>
        <button class="btn btn-primary" type="submit">
          Tell me jokes
        </button>
      </form>
      <div id="jokes"></div>
    </Layout>
  );
}
