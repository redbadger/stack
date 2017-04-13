FROM node:6-alpine

RUN apk add --update tini curl
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /home/node/app
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./
RUN chown -R node:node .

USER node

EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl --fail http://localhost:4000/health || exit 1

# Run under Tini
CMD ["node", "index.js"]
