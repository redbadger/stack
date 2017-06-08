#!/usr/bin/env bash

scriptDir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd )

cd "$scriptDir"

# rmdir -p /tmp/registry

source point-to-local.sh

docker-compose -f docker-compose-load-balancer.yml down
docker-compose -f docker-compose-registry.yml down
