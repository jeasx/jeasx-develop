import { watch } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import env from "./env.js";

env();

const CWD = process.cwd();
const CONFIG = (await import(pathToFileURL(join(CWD, "jeasx.config.js")).href)).default;
const NODE_ENV_IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/** @type {Bun.BuildConfig} */
const COMMON_OPTIONS = {
  minify: !NODE_ENV_IS_DEVELOPMENT,
  root: "src",
  outdir: "dist",
  publicPath: "/",
  naming: { asset: "[dir]/[name]-[hash].[ext]" },
  format: "esm",
  // Bun doesn't reliably pick up "jsxImportSource" from tsconfig.json.
  jsx: { importSource: "jsx-async-runtime", development: NODE_ENV_IS_DEVELOPMENT },
};

/** @type {Bun.BuildConfig} */
const SERVER_OPTIONS = {
  ...COMMON_OPTIONS,
  entrypoints: ["src/**/\\[*\\].*"],
  target: "node",
  packages: "external",
  ...(await CONFIG.BUN_SERVER_OPTIONS?.()),
};

/** @type {Bun.BuildConfig} */
const BROWSER_OPTIONS = {
  ...COMMON_OPTIONS,
  entrypoints: ["src/**/index.*"],
  target: "browser",
  packages: "bundle",
  ...(await CONFIG.BUN_BROWSER_OPTIONS?.()),
};

async function build() {
  const start = performance.now();
  for (const options of [SERVER_OPTIONS, BROWSER_OPTIONS]) {
    // Bun.build doesn't expand globs. Expand them on every build, so new files are picked up while watching.
    const entrypoints = (
      await Promise.all(
        options.entrypoints.map((glob) => Array.fromAsync(new Bun.Glob(glob).scan())),
      )
    ).flat();
    const result = await Bun.build({ ...options, entrypoints, throw: false });
    result.logs
      .filter((log) => log.message !== "invalid @ rule encountered: '@view-transition'")
      .forEach((log) => console.warn(log));

    if (!NODE_ENV_IS_DEVELOPMENT) {
      if (result.success) {
        for (const output of result.outputs) {
          const size =
            output.size < 1024 ? `${output.size}b ` : `${(output.size / 1024).toFixed(1)}kb`;
          console.info(`  ${relative(CWD, output.path).padEnd(48)} ${size.padStart(8)}`);
        }
      } else {
        process.exit(1);
      }
    }
  }
  console.info(`⚡ Done in ${Math.round(performance.now() - start)}ms`);
}

await build();

if (NODE_ENV_IS_DEVELOPMENT) {
  // Bun.build has no watch mode, so rebuild on changes. Build errors are logged, so don't stop on them.
  // A single save often fires several events, so debounce them and never run builds concurrently:
  // changes during a build trigger exactly one rebuild afterwards.
  let timer;
  let building = false;
  let pending = false;
  const rebuild = async () => {
    if (building) {
      pending = true;
      return;
    }
    building = true;
    try {
      do {
        pending = false;
        await build().catch(console.error);
      } while (pending);
    } finally {
      building = false;
    }
  };
  watch("src", { recursive: true }, (_event, filename) => {
    console.info(`Changed: ${join("src", filename ?? "")}`);
    clearTimeout(timer);
    timer = setTimeout(rebuild, 50);
  });
}
