FROM node:current-alpine

USER node
WORKDIR /home/node

COPY --chown=node:node jsx-async-runtime-3.0.0.tgz package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . ./

RUN node --run build

CMD ["node","--run","start"]
