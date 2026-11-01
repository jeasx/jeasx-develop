import DefaultLayout from "../Layout";
import Header from "./components/Header";

/**
 * @this {import("../types").ThisContext}
 */
export default function Layout({ title = "", data = {}, children }) {
  return (
    // An absolute path, so the script is also found from deeper paths like the 404 page of "/wizard/a/b".
    <DefaultLayout
      title={title}
      description="Report a car insurance claim step by step with a server-rendered form wizard."
      script="/wizard/index.js"
    >
      {/* Like the guard, ignore trailing slashes: a post to "/wizard/4-claimant/" isn't redirected. */}
      <Header path={this.request.path.replace(/\/+$/, "")} data={data} />
      {children}
    </DefaultLayout>
  );
}
