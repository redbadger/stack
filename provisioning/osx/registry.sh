#!/usr/bin/env bash

set -eux

scriptDir=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd
)

cd "$scriptDir"

source point-to-local.sh

mkdir -p /tmp/registry

docker-compose -f docker-compose-registry.yml -p registry up -d
