#!/usr/bin/env bash

scriptDir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd )

cd "$scriptDir"

mkdir -p /tmp/registry

source point-to-local.sh

for node in mgr1 wkr1 wkr2 wkr3
do
  eval "export ${node}=$(docker-machine ip $node)"
done

docker-compose -f docker-compose-local.yml up -d
