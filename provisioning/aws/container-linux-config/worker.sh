#!/usr/bin/env bash

set -eux

readonly tokensDir='/var/tokens'
readonly workerTokenFile="${tokensDir}/worker"

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
  local joinToken=''
  while [ -z $joinToken ]; do
    if [ -e $workerTokenFile ]; then joinToken=$(cat $workerTokenFile); fi
    if [ -z $joinToken ]; then sleep 10; fi
  done

  echo $joinToken
}

export joined=''
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
      joined='true'
      break
    fi
    echo "...Timeout"
  done
}

while [ -z $joined ]; do
  joinSwarm
  if [ -z $joined ]; then sleep 10; fi
done
