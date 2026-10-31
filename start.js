import serverless from "./serverless.js";

await serverless.listen({
  // The dev server is only reachable from this machine, unless HOST is set (e.g. HOST=:: in a container).
  host: process.env.HOST || (process.env.NODE_ENV === "development" ? "localhost" : "::"),
  port: Number(process.env.PORT || 3000),
});

process.on("SIGTERM", () => serverless.close());
