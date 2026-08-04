import GithubIcon from "./github.svg";

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
  return (
    <>
      {{ html: "<!DOCTYPE html>" }}
      <html lang="en" data-theme="dark">
        <head>
          <base href={path.endsWith("/") ? path : `${path}/`} />
          <meta charset="utf-8" />
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {robots && <meta name="robots" content={robots} />}
          <link rel="stylesheet" href={addCacheBuster("/index.css")} />
          {css && <link rel="stylesheet" href={addCacheBuster(css)} />}
          <link
            rel="canonical"
            href={`https://expo.jeasx.dev${path.endsWith("/") ? path.slice(0, -1) : path}`}
          ></link>
          <script type="module" src={addCacheBuster("/index.js")}></script>
          {script && <script type="module" src={addCacheBuster(script)}></script>}
          <title>{title} &raquo; Jeasx - JSX with Ease</title>
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
                    <a
                      href={`https://github.com/jeasx/jeasx-expo/tree/main/src/${path.split("/")[1]}`}
                    >
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
              {process.versions.deno
                ? `Deno@${process.versions.deno}`
                : process.versions.bun
                  ? `Bun@${process.versions.bun}`
                  : `Node@${process.versions.node}`}
            </p>
          </footer>
        </body>
      </html>
    </>
  );
}

const VERSION = process.env.VERSION;

/** @param {string} path  */
function addCacheBuster(path, seperator = "~") {
  const index = path.lastIndexOf(".");
  return index !== -1 ? path.slice(0, index) + seperator + VERSION + path.slice(index) : path;
}
