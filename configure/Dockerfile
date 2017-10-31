FROM node:8.8.1-stretch
USER root

WORKDIR /app

RUN yarn global add https://github.com/reasonml/reason-cli/archive/3.0.0-bin-linux.tar.gz

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . ./
RUN yarn test
