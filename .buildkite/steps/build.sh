#!/usr/bin/env bash

set -eux

env
export registry=localhost:5000
export tag=latest

cd example

cat <<EOF >ports-app.yml
version: "3.1"

services:
  rproxy:
    ports:
      - 8001:3000
EOF

cat <<EOF >ports-services.yml
version: "3.1"

services:
  visualizer:
    ports:
      - 8000:3000
EOF

for stack in "app" "services"; do
  docker-compose -f ${stack}.yml -f ports-${stack}.yml config >deploy-${stack}.yml
  docker-compose -f deploy-${stack}.yml build
done
