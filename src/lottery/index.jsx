// The server rendered the first page. From here on, the browser handles every click
// with the same reducer and component, so no request is needed.
import { mount } from "../@helpers/isomorphic";
import Lottery from "./Lottery";
import { reduce } from "./state";

mount({ root: "[data-lottery]", View: Lottery, reduce });
