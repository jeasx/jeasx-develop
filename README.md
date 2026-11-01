# Jeasx Develop

This repository is designed to simplify the development of [Jeasx](https://github.com/jeasx/jeasx). Think of it as an ejected Jeasx project based on [Jeasx Expo](https://github.com/jeasx/jeasx-expo) that provides greater flexibility and ease when building new features.

Please visit <https://www.jeasx.dev> to learn more about Jeasx.

To get started with this repository, just run the following commands:

```bash
npm install
npm run dev
```

The server lives in `serverless.ts`, but Node runs the compiled `serverless.js` (and `serverless.js.map`), which are committed to the repository. After changing `serverless.ts`, recompile both and commit them together:

```bash
npm run compile
```

In production, set `COOKIE_SECRET` to a long random value (e.g. `openssl rand -hex 32`) and use the same value for all instances. Several examples store their state in signed cookies, which would otherwise become invalid with every restart or deploy.
