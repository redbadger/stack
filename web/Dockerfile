FROM node:6-alpine
MAINTAINER stuart.harris@red-badger.com

RUN apk add --update tini
ENTRYPOINT ["/sbin/tini", "--"]
EXPOSE 3000

WORKDIR /home/node/app
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn run build \
  && npm prune --production --silent \
  && chown -R node:node .

USER node

# Run under Tini
CMD ["./node_modules/.bin/next", "start"]
