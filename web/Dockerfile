FROM node:6-alpine

RUN apk add --update tini curl \
  && rm -r /var/cache
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /home/node/app
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn run build \
  && npm prune --production --silent \
  && chown -R node:node .

EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl --fail http://localhost:3000/health || exit 1

USER node
# Run under Tini
CMD ["./node_modules/.bin/next", "start"]
