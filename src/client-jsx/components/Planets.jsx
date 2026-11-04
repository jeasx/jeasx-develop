/**
 * Empty placeholders for all planets, plus the stats line, so the layout is
 * complete before any planet has loaded.
 */
export default function Planets({ names }) {
  return (
    <>
      <div class="planets">
        {names.map((name) => (
          <div class="planet placeholder" data-planet={name} />
        ))}
      </div>
      <p class="stats">Loading {names.length} planets…</p>
    </>
  );
}
