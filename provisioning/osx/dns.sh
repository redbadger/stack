#!/bin/sh

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

compose="./on-local.sh docker-compose"

export LOCAL_IP=${1:-127.0.0.1}
$compose -f docker-compose-dns.yml -p dns up -d
