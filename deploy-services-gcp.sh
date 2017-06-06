#!/usr/bin/env bash

set -ex

file="docker-compose-services.yml"
export registry="eu.gcr.io/microplatform-demo"

docker-compose -f $file build
docker-compose -f $file push
docker stack deploy --compose-file=$file --with-registry-auth services
