import { readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

// Export path mappings for routes and files

const CWD = process.cwd();

/** @type {Record<string,string>} */
const routes = {};
/** @type {Record<string,string>} */
const files = {};

// Unlike glob, readdir includes dotfiles (e.g. ".well-known"), so the "dotfiles"
// option of FASTIFY_SEND_OPTIONS decides about them like in development.
// "dist" comes first: if a file exists in both directories, "dist" wins.
// Only regular files are collected; symbolic links are skipped (unlike in development).
const entries = [];
for (const directory of ["dist", "public"]) {
  const dirents = await readdir(join(CWD, directory), {
    recursive: true,
    withFileTypes: true,
  }).catch(() => []);
  for (const dirent of dirents) {
    const path = join(dirent.parentPath, dirent.name);
    if (dirent.isFile()) {
      entries.push(relative(CWD, path));
    }
  }
}

for (const entry of entries) {
  const path = entry.split(sep).join("/");

  // Handle server routes.
  if (/^dist\/.*\[[^/]+\]\.js$/.test(path)) {
    routes[path.slice("dist".length, -".js".length)] = path;
    continue;
  }

  // Skip all other outputs of server routes, e.g. sourcemaps or CSS of components.
  if (/^dist\/.*\[[^/]+\]\.[^/]+$/.test(path)) {
    continue;
  }

  // Treat all other entries as static files.
  const key = path.slice(path.indexOf("/"));
  if (!(path.startsWith("public/") && key in files)) {
    files[key] = path;
  }
}

await writeFile(
  join(CWD, "dist", ".jeasx.manifest.js"),
  `export default ${JSON.stringify({ routes, files })};`,
);
