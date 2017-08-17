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

MANAGER_IPS="$(getent hosts swarm.local|awk '{ print $1 }')"
for IP in $MANAGER_IPS; do
  echo "Trying to join a swarm managed by $IP..."
  if wget -q --spider -t 1 --connect-timeout 3 $IP:2377; then
    docker swarm join --token $JOIN_TOKEN $IP:2377
    break
  fi
  echo "...Timeout"
done
