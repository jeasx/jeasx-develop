import DefaultLayout from "../Layout";
import Header from "./components/Header";

/**
 * @this {import("../types").ThisContext}
 */
export default function Layout({ title = "", data = {}, children }) {
  return (
    // An absolute path, so the script is also found from deeper paths like the 404 page of "/wizard/a/b".
    <DefaultLayout
      // Name the example, so a tab reads "Start - Car insurance claim" instead of just "Start".
      title={title ? `${title} - Car insurance claim` : "Car insurance claim"}
      description="Report a car insurance claim step by step with a server-rendered form wizard."
      css="/wizard/index.css"
      script="/wizard/index.js"
    >
      {/* Like the guard, ignore trailing slashes: a post to "/wizard/4-claimant/" isn't redirected. */}
      <div class="wizard">
        <Header path={this.request.path.replace(/\/+$/, "")} data={data} />
        {children}
      </div>
    </DefaultLayout>
  );
}
