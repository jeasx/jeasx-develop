/**
 * @this {import("./types").ThisContext}
 */
export default function Layout({
  title = "",
  description = "",
  css = undefined,
  script = undefined,
  robots = undefined,
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
          <meta name="robots" content={robots} />
          <link rel="stylesheet" href={`/index.css?${process.env.BUILD_TIME}`} />
          {css && <link rel="stylesheet" href={`${css}?${process.env.BUILD_TIME}`} />}
          <link
            rel="canonical"
            href={`https://expo.jeasx.dev${path.endsWith("/") ? path.slice(0, -1) : path}`}
          ></link>
          <script type="module" src={`/index.js?${process.env.BUILD_TIME}`}></script>
          {script && <script type="module" src={`${script}?${process.env.BUILD_TIME}`}></script>}
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
                        src="/icons/github.svg"
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
