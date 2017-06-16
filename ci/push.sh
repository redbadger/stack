#!/usr/bin/env bash

set -eux

env

for file in "docker-compose-app.yml" "docker-compose-services.yml"; do
  docker-compose -f $file push
done
