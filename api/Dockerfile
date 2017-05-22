FROM node:6-alpine

RUN apk add --update tini curl \
  && rm -r /var/cache
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /home/node/app
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./
RUN chown -R node:node .

USER node

HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl --fail http://localhost:$PORT/_health || exit 1

# Run under Tini
CMD ["node", "index.js"]
