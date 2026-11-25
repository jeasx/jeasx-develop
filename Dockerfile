FROM node:lts-alpine

# Alpine has no fonts, so sharp would draw SVG text as empty boxes (see "src/og").
RUN apk add --no-cache fontconfig font-liberation

# Runtime for building and running the server: "node" (default) or "bun".
# Example: docker build --build-arg RUNTIME=bun -t jeasx .
ARG RUNTIME=node
ENV RUNTIME=${RUNTIME}

# Bun is only installed when requested, so Node images don't grow. npm picks the musl build for Alpine.
RUN if [ "$RUNTIME" = "bun" ]; then npm install --global bun && npm cache clean --force; fi

USER node
WORKDIR /home/node

# npm installs the dependencies for both runtimes, so package-lock.json stays the only lockfile.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . ./

# Libraries like React check NODE_ENV and otherwise load their slower development builds.
ENV NODE_ENV=production
RUN "$RUNTIME" cli.js build

# Uses the health route of the examples ("src/[health].json"): keep that route or remove this check. wget is part of Alpine.
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://localhost:${PORT:-3000}/health" > /dev/null || exit 1

# Start the runtime directly ("exec" replaces the shell): "node --run" doesn't forward SIGTERM,
# so the server couldn't shut down gracefully.
CMD ["sh", "-c", "exec \"$RUNTIME\" cli.js start"]
