#!/usr/bin/env bash

set -eux

env
export registry=localhost:5000
export tag=latest

cd example

cat <<EOF >app-ports.yml
version: "3.1"

services:
  rproxy:
    ports:
      - 8001:3000
EOF

cat <<EOF >services-ports.yml
version: "3.1"

services:
  visualizer:
    ports:
      - 8000:3000
EOF

for stack in "app" "services"; do
  docker-compose -f ${stack}.yml -f ${stack}-ports.yml config >${stack}-unresolved.yml
  docker-compose -f ${stack}-unresolved.yml build
done
