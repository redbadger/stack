#!/usr/bin/env bash

set -ex

createMachine () { # name
  docker-machine rm -f $1 2> /dev/null
  docker-machine create \
    --driver virtualbox \
    --engine-opt experimental=true \
    --engine-insecure-registry registry:5000  \
    --virtualbox-cpu-count 2 \
    --virtualbox-memory 1024 \
    $1
  docker-machine ssh $1 "sudo sh -c 'echo \"10.0.2.2 registry\" >> /etc/hosts'"
}

initSwarm () { # mgr
  docker swarm init --advertise-addr $1
}

joinNode () { # mgr, node
  docker \
    --host tcp://$(docker-machine ip $2):2376 \
    swarm \
    join \
    --token $(docker swarm join-token worker --quiet) \
    $1:2377
}

for node in mgr1 wkr1 wkr2 wkr3
do
  createMachine $node
done

. ./point-to-swarm.sh

MGR=$(docker-machine ip mgr1)
initSwarm $MGR

for node in wkr1 wkr2 wkr3
do
  joinNode $MGR $node
done

docker node ls
