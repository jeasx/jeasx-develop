// Isomorphic JSX: the browser renders the same ServerList component as the server with
// jsxToString, and saves every change in the background (see "../../@helpers/isomorphic").
import { mount, postForm } from "../../@helpers/isomorphic";
import ServerList from "../ServerList";
import { reduceForm } from "../shopping";

/** Called by the loader ("../index.js"). */
export function start() {
  mount({
    root: "#jeasx-list",
    View: (items) => <ServerList framework="jeasx" items={items} />,
    reduce: reduceForm,
    persist: postForm,
  });
}
