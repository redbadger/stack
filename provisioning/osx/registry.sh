#!/usr/bin/env bash

scriptDir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd )

cd "$scriptDir"

source point-to-local.sh

docker-compose -f docker-compose-registry.yml -p registry up -d
