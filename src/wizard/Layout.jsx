import DefaultLayout from "../Layout";
import Header from "./components/Header";

/**
 * @this {import("../types").ThisContext}
 */
export default function Layout({ title = "", data = {}, children }) {
  return (
    // An absolute path, so the script is also found from deeper paths like the 404 page of "/wizard/a/b".
    <DefaultLayout title={title} script="/wizard/index.js">
      <Header path={this.request.path} data={data} />
      {children}
    </DefaultLayout>
  );
}
