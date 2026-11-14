/** @typedef {import("./registry").Registry} Registry */
/** @typedef {import("./registry").Manifest} Manifest */

/**
 * An async component: it awaits the manifest of one package from the
 * registry and renders it with PackageRow. Its dependencies are rendered as
 * nested Package components down to the given depth; deeper packages stay
 * collapsed until they are opened in the browser (see index.jsx).
 *
 * @param {{ name: string, depth: number, registry: Registry, ancestors?: string[] }} props
 */
export default async function Package({ name, depth, registry, ancestors = [] }) {
  if (ancestors.includes(name)) {
    return <Leaf name={name} badge="↻ circular" kind="cycle" />;
  }
  try {
    const manifest = await registry.get(name);
    return (
      <PackageRow
        manifest={manifest}
        dependencies={registry.children(manifest)}
        depth={depth}
        registry={registry}
        ancestors={ancestors}
      />
    );
  } catch (error) {
    return <Leaf name={name} badge={`⚠ ${error.message}`} kind="failed" />;
  }
}

/**
 * The markup of a loaded package: a plain component without any loading, so
 * it can be rendered (and tested) with any manifest.
 *
 * @param {{
 *   manifest: Manifest,
 *   dependencies: string[],
 *   depth: number,
 *   registry: Registry,
 *   ancestors: string[],
 * }} props
 */
export function PackageRow({ manifest, dependencies, depth, registry, ancestors }) {
  const info = (
    <>
      <span class="name">{manifest.name}</span>
      <span class="version">v{manifest.version}</span>
      {dependencies.length > 0 && (
        <span class="count" title={`${dependencies.length} dependencies`}>
          {dependencies.length}
        </span>
      )}
      <a
        class="npm"
        href={`https://www.npmjs.com/package/${manifest.name}`}
        target="_blank"
        rel="noopener"
        title={`${manifest.name} on npm`}
      >
        ↗
      </a>
      {manifest.description && <small>{manifest.description}</small>}
    </>
  );

  // Without dependencies there is nothing to open, so no disclosure marker.
  if (dependencies.length === 0) {
    return (
      <li class="package leaf">
        <div class="summary">{info}</div>
      </li>
    );
  }

  const path = [...ancestors, manifest.name];
  const expand = depth > 0;
  return (
    <li class="package">
      <details
        open={expand}
        data-name={expand ? undefined : manifest.name}
        data-ancestors={JSON.stringify(path)}
      >
        <summary>{info}</summary>
        {expand ? (
          <Dependencies
            names={dependencies}
            depth={depth - 1}
            registry={registry}
            ancestors={path}
          />
        ) : (
          <ul class="more" aria-label={`Loading ${dependencies.join(", ")}`}>
            {dependencies.map(() => (
              <Ghost />
            ))}
          </ul>
        )}
      </details>
    </li>
  );
}

/**
 * The dependencies of a package as Package components, in a list or, with
 * `list={false}`, as bare list items to stream into an existing list.
 *
 * @param {{
 *   names: string[],
 *   depth: number,
 *   registry: Registry,
 *   ancestors: string[],
 *   list?: boolean,
 * }} props
 */
export function Dependencies({ names, depth, registry, ancestors, list = true }) {
  const items = names.map((name) => (
    <Package name={name} depth={depth} registry={registry} ancestors={ancestors} />
  ));
  return list ? <ul>{items}</ul> : <>{items}</>;
}

/**
 * A package that can't be opened: a circular dependency or a failed request.
 *
 * @param {{ name: string, badge: string, kind: "cycle" | "failed" }} props
 */
function Leaf({ name, badge, kind }) {
  return (
    <li class={`package leaf ${kind}`}>
      <div class="summary">
        <span class="name">{name}</span>
        <span class="badge">{badge}</span>
      </div>
    </li>
  );
}

/**
 * A placeholder row with the size of a package row. Opening a collapsed package
 * replaces them one by one with the streamed packages, so nothing jumps.
 */
export function Ghost() {
  return (
    <li class="package ghost" aria-hidden="true">
      <div class="summary">
        <span class="skeleton" />
        <small class="skeleton" />
      </div>
    </li>
  );
}
