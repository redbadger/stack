#!/bin/sh

set -ex

file="deploy-services.yml"

docker="./provisioning/osx/on-swarm.sh docker"

$docker stack deploy --compose-file=$file --with-registry-auth services
