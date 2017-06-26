#!/bin/sh

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

compose="./on-local.sh docker-compose"

for node in mgr1 wkr1 wkr2 wkr3; do
  eval "export ${node}=$(docker-machine ip $node)"
done

$compose -f docker-compose-load-balancer.yml -p load-balancer up -d
