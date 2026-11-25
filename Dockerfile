FROM node:lts-alpine AS runtime

# Alpine has no fonts, so sharp would draw SVG text as empty boxes.
RUN apk add --no-cache fontconfig font-liberation

# Runtime for building and running the server: "node" (default) or "bun".
# Example: docker build --build-arg RUNTIME=bun -t jeasx .
ARG RUNTIME=node
ENV RUNTIME=${RUNTIME}

RUN if [ "$RUNTIME" = "bun" ]; then npm install --global bun && npm cache clean --force; fi

USER node
WORKDIR /home/node

# Libraries like React check NODE_ENV and otherwise load their slower development builds.
ENV NODE_ENV=production

FROM runtime AS build

COPY --chown=node:node package.json package-lock.json ./
# NODE_ENV=production would skip the dev dependencies.
RUN npm ci --include=dev && npm cache clean --force
COPY --chown=node:node . ./
RUN "$RUNTIME" cli.js build && npm prune --omit=dev && find node_modules -type d -empty -delete

FROM runtime AS production

COPY --from=build --chown=node:node /home/node ./

# wget is part of Alpine.
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://localhost:${PORT:-3000}/health" > /dev/null || exit 1

# Start the server with installed runtime.
CMD ["sh", "-c", "exec \"$RUNTIME\" start.js"]
