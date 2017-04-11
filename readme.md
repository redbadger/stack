This repo is a noddy web ui, api and db with `version 3` compose files that are designed to be deployed into a "Docker in swarm mode" cluster.

## To set up a cluster
1. Install VirtualBox and Docker for Mac
1. Create 4 VMs using `docker-machine`:

  ```bash
  for node in mgr1 wkr1 wkr2 wkr3
  do
    docker-machine create --driver=virtualbox --engine-opt experimental=true --engine-insecure-registry registry:5000 $node
    docker-machine ssh $node "sudo sh -c 'echo \"$(docker-machine ip mgr1) registry\" >> /etc/hosts'"
  done
  ```
  You should be able to see four machines:
  ```sh
  docker-machine ls
  NAME   ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER        ERRORS
  mgr1   *        virtualbox   Running   tcp://192.168.99.106:2376           v17.04.0-ce
  wkr1   -        virtualbox   Running   tcp://192.168.99.107:2376           v17.04.0-ce
  wkr2   -        virtualbox   Running   tcp://192.168.99.108:2376           v17.04.0-ce
  wkr3   -        virtualbox   Running   tcp://192.168.99.109:2376           v17.04.0-ce  
  ```
1. Point local Docker to the manager node:
  ```sh
  eval (docker-machine env mgr1)
  ```
1. Create a swarm:

  ```sh
  docker swarm init --advertise-addr (docker-machine ip mgr1)
  ```
1. Join the workers to the swarm:

  ```bash
  for node in wkr1 wkr2 wkr3
  do
    docker --host=tcp://(docker-machine ip $node):2376 swarm join --token (docker swarm join-token worker --quiet) (docker-machine ip mgr1):2377
  done
  ```
  You should now have a cluster with one manager and 3 workers:

  ```sh
  docker node ls
  ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
  mtwmobz3ow6tdbplktjc36w7b    wkr2      Ready   Active
  p3kzv15pwso77c8ok3wgz8u7b *  mgr1      Ready   Active        Leader
  q3g17wlf08eqbrntks3mt1710    wkr3      Ready   Active
  z7b3qp771b2258gh3js9f6t7r    wkr1      Ready   Active
  ```
1. Create a folder on the manager for the registry data
  ```sh
  docker-machine ssh mgr1 sudo mkdir /var/lib/registry
  ```
1. Deploy the services stack
  ```sh
  docker stack deploy --compose-file=docker-compose-services.yml services
  ```
1. Deploy the app stack
  ```sh
  docker stack deploy --compose-file=docker-compose-app.yml app
  ```
