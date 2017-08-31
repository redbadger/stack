#!/bin/sh

set -ex

file="deploy-services.yml"

docker stack deploy --compose-file=$file --with-registry-auth services
