#!/usr/bin/env bash

set -eux

scriptDir=$(
  cd "$(dirname "$0")"
  pwd
)

cd "$scriptDir"

compose="./on-local.sh docker-compose"

for node in mgr1 wkr1 wkr2 wkr3; do
  eval "export ${node}=$(docker-machine ip $node)"
done

config=/tmp/haproxy/haproxy.cfg

mkdir -p /tmp/haproxy
if [ ! -f $config ]; then
  cat  > $config <<EOF
global
  maxconn 256

defaults
  mode http

listen http-in
  bind *:80
EOF
fi

$compose -f docker-compose-load-balancer.yml -p load-balancer up -d
