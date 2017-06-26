#!/bin/sh

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

compose="./on-local.sh docker-compose"

mkdir -p /tmp/registry

$compose -f docker-compose-registry.yml -p registry up -d
