#!/usr/bin/env bash

set -eux

JOIN_TOKEN=''
if [ -f /var/tokens/lock ]; then
  echo "Trying to join a swarm at swarm.local..."
  while [ -z $JOIN_TOKEN ]; do
    JOIN_TOKEN=$(cat /var/tokens/manager)
    if [ -z $JOIN_TOKEN ]; then
      sleep 10
    fi
  done

  docker swarm join --token $JOIN_TOKEN swarm.local:2377
else
  touch /var/tokens/lock
  echo "Swarm does not exist yet, initializing..."
  docker swarm init --advertise-addr "$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)"

  docker swarm join-token -q manager >/var/tokens/manager
  docker swarm join-token -q worker >/var/tokens/worker
fi
