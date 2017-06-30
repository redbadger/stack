#!/usr/bin/env bash

set -eux

manager="mgr1"
workers="wkr1 wkr2 wkr3"

scriptDir=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd
)

cd "$scriptDir"

export docker
docker="./on-swarm.sh docker"

createMachine() {
  local name="$1"
  docker-machine create \
    --driver virtualbox \
    --engine-opt experimental=true \
    --engine-registry-mirror http://10.0.2.2:5001 \
    --engine-insecure-registry localhost:5000 \
    --virtualbox-boot2docker-url https://github.com/boot2docker/boot2docker/releases/download/v17.06.0-ce/boot2docker.iso \
    --virtualbox-cpu-count 2 \
    --virtualbox-memory 1024 \
    $name
}

initSwarm() {
  local mgr_ip="$1"
  $docker swarm init --advertise-addr $mgr_ip
}

joinNode() {
  local mgr_ip="$1"
  local node="$2"
  $docker \
    --host "tcp://$(docker-machine ip $node):2376" \
    swarm \
    join \
    --token "$($docker swarm join-token worker --quiet)" \
    $mgr_ip:2377
}

docker-machine rm -f $manager $workers 2>/dev/null

for node in $manager $workers; do
  createMachine $node
done

MGR_IP=$(docker-machine ip $manager)
initSwarm $MGR_IP

for node in $workers; do
  joinNode $MGR_IP $node
done

$docker node ls
