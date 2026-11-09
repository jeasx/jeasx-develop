/**
 * Renders a declarative shadow root: the browser's HTML parser attaches it to the parent
 * element, so the component is encapsulated before any JavaScript runs.
 *
 * Put it as the first child of a custom element (or a div), with the light DOM content after it.
 *
 * @param {{ styles?: string, children?: any }} props
 */
export default function ShadowRoot({ styles = "", children }) {
  return (
    <template shadowrootmode="open">
      {styles && <style>{styles}</style>}
      {children}
    </template>
  );
}
