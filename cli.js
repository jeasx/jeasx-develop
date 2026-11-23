#!/usr/bin/env node
import fs from "node:fs/promises";

const START_JS = "./start.js";
const BUILD_JS = `./build-${process.versions.bun ? "bun" : "esbuild"}.js`;
const BUILD_META_JS = "./build-meta.js";

switch (process.argv[2]) {
  case "start":
    await import(START_JS);
    break;

  case "build":
    await clean();
    await import(BUILD_JS);
    await import(BUILD_META_JS);
    break;

  case "dev":
    process.env.NODE_ENV = "development";
    await clean();
    await import(BUILD_JS);
    await import(START_JS);
    break;

  case "clean":
    await clean();
    break;

  default:
    console.info(`💡 Usage: jeasx [start|build|dev|clean]`);
    process.exit(1);
}

async function clean() {
  await fs.rm("dist", { recursive: true, force: true, maxRetries: 3 });
}
