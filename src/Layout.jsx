import { html } from "jsx-async-runtime";
import GithubIcon from "./github.svg";
import sitemap from "./sitemap.json";

const REPOSITORY = "https://github.com/jeasx/jeasx-expo";

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
  children,
}) {
  const path = this.request.path;
  // The path is decoded, so encode it again for URLs: a decoded "?" or "#" (from "%3F" or "%23")
  // would otherwise end the path, and relative links would resolve against the wrong URL.
  const url = encodeURI(path).replace(/[?#]/g, encodeURIComponent);
  // Link to the source of the current example; unknown paths (e.g. 404 pages) get the repository.
  const example = path.split("/")[1];
  const sourceUrl = EXAMPLES.has(example) ? `${REPOSITORY}/tree/main/src/${example}` : REPOSITORY;
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en" data-theme="dark">
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
            href={`https://expo.jeasx.dev${url.endsWith("/") ? url.slice(0, -1) : url}`}
          ></link>
          <script type="module" src={addCacheBuster("/index.js")}></script>
          {script && <script type="module" src={addCacheBuster(script)}></script>}
          <title>{title ? `${title} » Jeasx - JSX with Ease` : "Jeasx - JSX with Ease"}</title>
        </head>
        <body>
          {path !== "/" && (
            <header>
              <nav class="container">
                <ul>
                  <li>
                    <a href="/">&laquo; Back to overview</a>
                  </li>
                </ul>
                <ul>
                  <li>
                    <a href={sourceUrl}>
                      <img
                        src={GithubIcon}
                        width="24"
                        height="24"
                        alt="GitHub Logo"
                        title="View source code"
                      />
                    </a>
                  </li>
                </ul>
              </nav>
            </header>
          )}
          <main class="container">{children}</main>
          <footer class="container">
            <hr />
            <p class="center">
              &copy; {new Date().getFullYear()} - powered by{" "}
              <a href="https://www.jeasx.dev">Jeasx</a> -{" "}
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

/** @param {string} path  */
function addCacheBuster(path) {
  return `${path}?v=${process.env.BUILD_ID}`;
}
