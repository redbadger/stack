#!/usr/bin/env bash

set -eux

readonly tokensDir='/var/tokens'
readonly workerTokenFile="${tokensDir}/worker"
readonly lockDir="${tokensDir}/init.lock"

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

joinSwarm() {
  echo "Trying to join a swarm as a worker..."
  local joinToken
  local managers
  managers=$(findManagers)
  joinToken=$(cat $workerTokenFile)
  for mgrIP in $managers; do
    echo "Trying to join a swarm managed by $mgrIP..."
    if isManagerListening $mgrIP; then
      docker swarm join --token $joinToken $mgrIP:2377
      break
    fi
    echo "...Timeout"
  done
}

createLock() {
  mkdir $lockDir &>/dev/null # atomic
}

removeLock() {
  if [ -e $lockDir ]; then rmdir $lockDir; fi
}

trap 'removeLock; exit 0' INT TERM EXIT
while true; do
  if createLock; then
    joinSwarm
    break
  fi
  sleep 1
done
