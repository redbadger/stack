#!/usr/bin/env bash

set -eux

scriptDir=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd
)

cd "$scriptDir"

createMachine() {
  local name="$1"
  docker-machine rm -f $name 2>/dev/null
  docker-machine create \
    --driver virtualbox \
    --engine-opt experimental=true \
    --engine-insecure-registry registry:5000 \
    --virtualbox-cpu-count 2 \
    --virtualbox-memory 1024 \
    $name
  docker-machine ssh $name "sudo sh -c 'echo \"10.0.2.2 registry\" >> /etc/hosts'"
}

initSwarm() {
  local mgr="$1"
  docker swarm init --advertise-addr $mgr
}

joinNode() {
  local mgr="$1"
  local node="$2"
  docker \
    --host "tcp://$(docker-machine ip $node):2376" \
    swarm \
    join \
    --token "$(docker swarm join-token worker --quiet)" \
    $mgr:2377
}

for node in mgr1 wkr1 wkr2 wkr3; do
  createMachine $node
done

source point-to-swarm.sh

MGR=$(docker-machine ip mgr1)
initSwarm $MGR

for node in wkr1 wkr2 wkr3; do
  joinNode $MGR $node
done

docker node ls
