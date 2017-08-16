#!/usr/bin/env bash

set -eux

JOIN_TOKEN=''
echo "Trying to join a swarm at swarm.local..."
while [ -z $JOIN_TOKEN ]; do
  JOIN_TOKEN=$(cat /var/tokens/worker)
  if [ -z $JOIN_TOKEN ]; then
    sleep 10
  fi
done

docker swarm join --token $JOIN_TOKEN swarm.local:2377
