#!/usr/bin/env bash

set -eux

readonly tokensDir='/var/tokens'
readonly managerTokenFile="${tokensDir}/manager"
readonly workerTokenFile="${tokensDir}/worker"
readonly lockDir="${tokensDir}/init.lock"

isManagerListening() {
  local ip="$1"
  wget -q --spider -t 1 --connect-timeout 3 $ip:2377
}

findManagers() {
  local registeredNodes=''
  local listeningNodes=''
  while [[ -z $registeredNodes ]]; do
    registeredNodes="$(getent hosts swarm.local | awk '{ print $1 }')"
    for node in $registeredNodes; do
      if isManagerListening $node; then
        listeningNodes="${listeningNodes} ${node}"
      fi
    done
    sleep 2
  done
  echo $listeningNodes
}

joinSwarm() {
  echo "Trying to join a swarm as a manager..."
  local joinToken
  local managers
  managers=$(findManagers)
  if [[ -z $managers ]]; then
    initSwarm
  else
    joinToken=$(cat $managerTokenFile)
    for mgrIP in $managers; do
      echo "Trying to join a swarm managed by $mgrIP..."
      if isManagerListening $mgrIP; then
        docker swarm join --token $joinToken $mgrIP:2377
        joined='true'
        break
      fi
      echo "...Timeout"
    done
  fi
}

initSwarm() {
  echo "Swarm does not exist yet, initializing..."
  local privateIpAddress
  privateIpAddress="$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)"
  docker swarm init --advertise-addr $privateIpAddress

  docker swarm join-token -q manager >$managerTokenFile
  docker swarm join-token -q worker >$workerTokenFile
  joined='true'
}

createLock() {
  mkdir $lockDir &>/dev/null # atomic
}

removeLock() {
  if [[ -e $lockDir ]]; then rmdir $lockDir; fi
}

trap 'removeLock; exit 0' INT TERM EXIT
joined='false'
while true; do
  if createLock; then
    joinSwarm
    if [[ $joined = 'true' ]]; then break; else removeLock; fi
  fi
  sleep 2
done
