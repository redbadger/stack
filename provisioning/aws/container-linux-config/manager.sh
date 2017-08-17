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

  MANAGER_IPS="$(getent hosts swarm.local|awk '{ print $1 }')"
  for IP in $MANAGER_IPS; do
    echo "Trying to join a swarm managed by $IP..."
    if wget -q --spider -t 1 --connect-timeout 3 $IP:2377; then
      docker swarm join --token $JOIN_TOKEN $IP:2377
      break
    fi
    echo "...Timeout"
  done
else
  touch /var/tokens/lock
  echo "Swarm does not exist yet, initializing..."
  docker swarm init --advertise-addr "$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)"

  docker swarm join-token -q manager >/var/tokens/manager
  docker swarm join-token -q worker >/var/tokens/worker
fi
