#!/usr/bin/env bash

set -eux

workerTokenFile='/var/tokens/worker'

isManagerListening() {
  local ip="$1"
  wget -q --spider -t 1 --connect-timeout 3 $ip:2377
}

findManagers() {
  local registeredNodes
  local listeningNodes=''
  registeredNodes="$(getent hosts swarm.local | awk '{ print $1 }')"
  for node in $registeredNodes; do
    if isManagerListening $node; then
      listeningNodes="${listeningNodes} ${node}"
    fi
  done
  echo $listeningNodes
}

getJoinToken() {
  local tokenFile="$1"
  local joinToken=''
  while [ -z $joinToken ]; do
    [ -e $tokenFile ] && joinToken=$(cat $tokenFile)
    if [ -z $joinToken ]; then
      sleep 10
    fi
  done

  echo $joinToken
}

joinSwarm() {
  echo "Trying to join a swarm as a worker..."
  local joinToken
  local managers
  managers=$(findManagers)
  joinToken=$(getJoinToken $workerTokenFile)
  for mgrIP in $managers; do
    echo "Trying to join a swarm managed by $mgrIP..."
    if isManagerListening $mgrIP; then
      docker swarm join --token $joinToken $mgrIP:2377
      break
    fi
    echo "...Timeout"
  done
}

joinSwarm
