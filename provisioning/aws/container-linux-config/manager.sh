#!/bin/sh

if [ -f /var/tokens/manager ]; then
  echo "Trying to join a swarm at swarm.local..."
  while [ -z $JOIN_TOKEN ]; do
    JOIN_TOKEN=$(cat /var/tokens/manager)
    sleep 10
  done

  docker swarm join --token $JOIN_TOKEN swarm.local:2377
else
  echo "Swarm does not exist yet, initializing..."
  docker swarm init --advertise-addr swarm.local >/dev/null

  docker swarm join-token -q manager >/var/tokens/manager
  docker swarm join-token -q worker >/var/tokens/worker
fi
