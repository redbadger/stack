#!/bin/sh

set -eux

file="deploy-app.yml"
compose="../provisioning/osx/on-local.sh docker-compose"

$compose -f $file build
$compose -f $file push
