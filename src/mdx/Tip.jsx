/** Replaces Markdown blockquotes ("> ...") in MDX content, see the components prop in Cookbook.jsx. */
export default function Tip({ children }) {
  return (
    <aside class="tip">
      <span aria-hidden="true">💡</span>
      <div>{children}</div>
    </aside>
  );
}
