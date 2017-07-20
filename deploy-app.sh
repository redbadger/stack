#!/bin/sh

set -eux

file="app.yml"
ports="/tmp/app-ports.yml"
export registry="localhost:5000"

compose="./provisioning/osx/on-local.sh docker-compose"
docker="./provisioning/osx/on-swarm.sh docker"

$compose -f $file -f $ports config > /tmp/$file
$compose -f /tmp/$file build
$compose -f /tmp/$file push
$docker stack deploy --compose-file=/tmp/$file --with-registry-auth app
rm /tmp/$file
