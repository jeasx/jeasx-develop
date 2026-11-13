import serverless from "../serverless.js";

await serverless.ready();

export default (req, res) => {
  serverless.server.emit("request", req, res);
};
