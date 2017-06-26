#!/bin/sh

set -ex

file="docker-compose-services.yml"
export registry="registry:5000"

docker="./provisioning/osx/on-swarm.sh docker"
compose="./provisioning/osx/on-swarm.sh docker-compose"

$compose -f $file build
$compose -f $file push
$docker stack deploy --compose-file=$file --with-registry-auth services
