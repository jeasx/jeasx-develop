FROM node:lts-alpine

# Libraries like React check NODE_ENV at runtime and otherwise load their slower development builds.
ENV NODE_ENV=production

USER node
WORKDIR /home/node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . ./

RUN node --run build

# Uses the health route of the examples ("src/[health].json"): keep that route or remove this check. wget is part of Alpine.
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://localhost:${PORT:-3000}/health" > /dev/null || exit 1

# Start node directly: "node --run" doesn't forward SIGTERM, so the server couldn't shut down gracefully.
CMD ["node","cli.js","start"]
