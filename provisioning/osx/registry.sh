#!/bin/sh

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

compose="./on-local.sh docker-compose"
docker="./on-swarm.sh docker"

mkdir -p /tmp/registry

$compose -f docker-compose-registry.yml -p registry up -d
$docker stack deploy -c docker-compose-registry-ambassador.yml swarm
