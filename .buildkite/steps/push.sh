#!/usr/bin/env bash

set -eux

env

# install gcloud
# credentials.json
# gcloud docker -a


for file in "docker-compose-app.yml" "docker-compose-services.yml"; do
  docker-compose -f $file push
done
