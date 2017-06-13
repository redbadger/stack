#!/usr/bin/env bash

set -eux

for file in "docker-compose-app.yml" "docker-compose-services.yml"; do
  docker-compose -f $file build
done
