import { html, jsxToString } from "jsx-async-runtime";

/**
 * Starts rendering all children at once, instead of one after another.
 * Returns them as promises, which JSX streams in order, each as soon as it and the
 * ones before it are ready. A failing child fails the page, so wrap risky ones in an
 * <ErrorBoundary>.
 *
 * @this {object}
 * @param {{ children: JSX.Element | JSX.Element[] }} props
 */
export default function Parallel(props) {
  return [props.children].flat().map(async (child) => html(await jsxToString.call(this, child)));
}
