FROM oven/bun:alpine

# Alpine has no fonts, so sharp would draw SVG text as empty boxes (see "src/og").
RUN apk add --no-cache fontconfig font-liberation

WORKDIR /home/bun/app

COPY package.json bun.lock ./
RUN bun install && rm -rf ~/.bun/install/cache
COPY . ./

ENV NODE_ENV=production
RUN bun cli.js build

HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://localhost:${PORT:-3000}/health" > /dev/null || exit 1

USER bun
CMD ["bun", "start.js"]
