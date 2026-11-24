import CONFIG_BUN from "./jeasx.config.bun.js";
import CONFIG_ESBUILD from "./jeasx.config.esbuild.js";
import CONFIG_FASTIFY from "./jeasx.config.fastify.js";

export default {
  ...CONFIG_BUN,
  ...CONFIG_ESBUILD,
  ...CONFIG_FASTIFY,
};
