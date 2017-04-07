FROM node:6-alpine

RUN apk add --update tini
ENTRYPOINT ["/sbin/tini", "--"]
EXPOSE 3000

WORKDIR /home/node/app
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . ./
RUN chown -R node:node .

USER node

# Run under Tini
CMD ["node", "index.js"]
