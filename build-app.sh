#!/bin/sh

set -eux

file="deploy-app.yml"
export registry="localhost:5000"

compose="./provisioning/osx/on-local.sh docker-compose"

$compose -f $file build
$compose -f $file push
