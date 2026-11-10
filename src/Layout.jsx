import { html } from "jsx-async-runtime";
import GithubIcon from "./github.svg";
import sitemap from "./sitemap.json";

// Top-level folders of all examples, e.g. "blog" for "/blog".
const EXAMPLES = new Set(
  sitemap.flatMap(({ links }) => links.map(({ path }) => path.split(/[/?]/)[1])),
);

/**
 * @this {import("./types").ThisContext}
 */
export default function Layout({
  title = "",
  description = "",
  css = "",
  script = "",
  robots = "",
  lang = "en",
  children,
}) {
  const path = this.request.path;

  // The path is decoded, so encode it again for URLs: a decoded "?" or "#" (from "%3F" or "%23")
  // would otherwise end the path, and relative links would resolve against the wrong URL.
  const url = encodeURI(path).replace(/[?#]/g, encodeURIComponent);

  // Link to the source of the current example; unknown paths (e.g. 404 pages) get the repository.
  const example = path.split("/")[1];
  const sourcePath = EXAMPLES.has(example) ? `/tree/main/src/${example}` : "";

  return (
    <>
      {html("<!DOCTYPE html>")}
      <html lang={lang}>
        <head>
          <base href={url.endsWith("/") ? url : `${url}/`} />
          <meta charset="utf-8" />
          {description && <meta name="description" content={description} />}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {robots && <meta name="robots" content={robots} />}
          <link rel="stylesheet" href={addCacheBuster("/index.css")} />
          {css && <link rel="stylesheet" href={addCacheBuster(css)} />}
          <link
            rel="canonical"
            href={`https://expo.jeasx.dev${url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url}`}
          />
          {/* The nonce is only set by pages with a Content Security Policy (see "/csp"). */}
          <script type="module" src={addCacheBuster("/index.js")} nonce={this.nonce}></script>
          {script && (
            <script type="module" src={addCacheBuster(script)} nonce={this.nonce}></script>
          )}
          <title>{title ? `${title} » Jeasx - JSX with Ease` : "Jeasx - JSX with Ease"}</title>
        </head>
        <body>
          {path !== "/" && (
            <header class="shell-header">
              <nav class="container">
                <ul>
                  <li>
                    <a href="/" class="shell-brand">
                      <span class="shell-gradient">Jeasx</span> Expo
                    </a>
                  </li>
                  <li>
                    <a href="/" class="shell-back">
                      &larr; All examples
                    </a>
                  </li>
                </ul>
                <ul>
                  <li>
                    <a
                      href={`https://github.com/jeasx/jeasx-expo${sourcePath}`}
                      class="shell-source"
                      title="View source code"
                    >
                      <img src={GithubIcon} width="20" height="20" alt="" />
                      <span>Source</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </header>
          )}
          <main class="container">{children}</main>
          <footer class="container shell-footer">
            <p>
              <a href="https://www.jeasx.dev">jeasx.dev</a>
              <span aria-hidden="true">·</span>
              <a href="https://github.com/jeasx/jeasx-expo">GitHub</a>
            </p>
            <p>
              &copy; {new Date().getFullYear()} · powered by Jeasx on{" "}
              {process.versions.bun
                ? `Bun@${process.versions.bun}`
                : `Node@${process.versions.node}`}
            </p>
          </footer>
        </body>
      </html>
    </>
  );
}

/**
 * Appends the build id, so browsers load a changed file instead of a cached copy.
 *
 * @param {string} path
 */
export function addCacheBuster(path) {
  return `${path}?v=${process.env.BUILD_ID}`;
}
