import ShadowRoot from "../shadow-dom/ShadowRoot";
import { LoadedWidget, WIDGETS } from "./widgets";

/**
 * Puts a widget anywhere in the page. Only a skeleton is sent, and the browser fetches the
 * widget once it scrolls into view. Without JavaScript nothing would ever load, so with "?noscript"
 * in the URL the server renders the widget inline instead. Wrap the widgets in <Parallel>, so
 * the async ones don't wait for each other then.
 *
 * `props` are passed on to the widget component. For lazy loading they travel as JSON in the
 * query string, so they must be serializable (strings, numbers, booleans, arrays, objects).
 *
 * @this {import("../types").ThisContext}
 * @param {{ name: keyof typeof WIDGETS, props?: Record<string, unknown> }} props
 */
export default function Lazy({ name, props = {} }) {
  if (this.request.query["noscript"] !== undefined) {
    return <LoadedWidget name={name} props={props} />;
  }
  const query = new URLSearchParams({ name, props: JSON.stringify(props) });
  return (
    <lazy-load src={`/lazy-load/widget?${query}`} aria-busy="true">
      <ShadowRoot styles={SKELETON_STYLES}>
        <slot>
          <div class="skeleton" role="status" aria-label={`Loading ${WIDGETS[name].title}`}>
            <div class="row">
              <span class="bone icon"></span>
              <span class="bone title"></span>
              <span class="bone pill"></span>
            </div>
            <span class="bone line"></span>
            <span class="bone line short"></span>
          </div>
        </slot>
      </ShadowRoot>
    </lazy-load>
  );
}

// A plain string: the styles live inside the shadow root and apply only there.
const SKELETON_STYLES = /* css */ `
  :host { display: block; margin: 1.5rem 0; }
  /* A skeleton screen: grey "bones" in the shape of a widget, with a light sweeping across. */
  .skeleton { display: grid; align-content: start; gap: 0.9rem; min-height: 10.5rem;
    box-sizing: border-box; padding: 1.1rem 1.25rem; border-radius: 1rem; border: 1px solid #fff1;
    background: #181d27; }
  .row { display: flex; align-items: center; gap: 0.6rem; }
  .bone { display: block; height: 0.9rem; border-radius: 0.25rem;
    background: linear-gradient(90deg, #fff1 0%, #fff1 40%, #fff3 50%, #fff1 60%, #fff1 100%)
      0 0 / 300% 100% fixed;
    animation: shimmer 1.4s linear infinite; }
  .icon { width: 2.1rem; height: 2.1rem; border-radius: 0.6rem; }
  .title { width: 40%; height: 1.1rem; margin-inline-end: auto; }
  .pill { width: 4rem; border-radius: 1rem; }
  .line { width: 100%; }
  .short { width: 65%; }
  @keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) { .bone { animation: none; } }
`;
