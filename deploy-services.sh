#!/bin/sh

set -ex

file="deploy-services.yml"
export registry="localhost:5000"

compose="./provisioning/osx/on-local.sh docker-compose"
docker="./provisioning/osx/on-swarm.sh docker"

$compose -f $file build
$compose -f $file push
$docker stack deploy --compose-file=$file --with-registry-auth services
