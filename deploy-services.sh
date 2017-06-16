#!/usr/bin/env bash

set -ex

file="docker-compose-services.yml"
export registry="registry:5000"

source provisioning/osx/point-to-swarm.sh

docker-compose -f $file build
docker-compose -f $file push
docker stack deploy --compose-file=$file --with-registry-auth services
