FROM node:8-alpine

WORKDIR /home/node/app

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn build && yarn test
