import { html } from "jsx-async-runtime";

/**
 * Renders a declarative shadow root: the browser's HTML parser attaches it to the parent
 * element, so the component is encapsulated before any JavaScript runs.
 *
 * Put it as the first child of a custom element (or a div), with the light DOM content after it.
 *
 * `styles` is inserted as raw CSS, so only pass trusted strings.
 *
 * @param {{ styles?: string, children?: any }} props
 */
export default function ShadowRoot({ styles = "", children }) {
  return (
    <template shadowrootmode="open">
      {styles && <style>{html(styles)}</style>}
      {children}
    </template>
  );
}
