#!/usr/bin/env bash

set -eux

env
export registry=localhost:5000

./provisioning/osx/configure/lib/index.js --file stacks.yml


for stack in "app" "services"; do
  docker-compose -f ${stack}.yml -f /tmp/${stack}-ports.yml build
done
