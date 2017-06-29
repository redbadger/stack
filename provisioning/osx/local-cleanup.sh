#!/bin/sh

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

# rmdir -p /tmp/registry

compose="./on-local.sh docker-compose"

$compose -f docker-compose-load-balancer.yml -p load-balancer down
$compose -f docker-compose-registry.yml -p registry down
