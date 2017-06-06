#!/usr/bin/env bash

scriptDir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd )

cd "$scriptDir"

# rmdir -p /tmp/registry

source point-to-local.sh

docker-compose -f docker-compose-local.yml down
