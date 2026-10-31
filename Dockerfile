FROM node:26-alpine

USER node
WORKDIR /home/node

COPY --chown=node:node jsx-async-runtime.tgz ./
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . ./

RUN node --run build

# Start node directly: "node --run" doesn't forward SIGTERM, so the server couldn't shut down gracefully.
CMD ["node","cli.js","start"]
