[![Build status](https://badge.buildkite.com/5d85736c5c70e3acecf5dc048195b85754df59febb84ddd824.svg?branch=master)](https://buildkite.com/red-badger-1/stack)

This repo is a noddy web ui and proxied api (on a private network) with `version 3` compose files that are designed to be deployed into a "Docker in swarm mode" cluster.

There are 4 compose files:
  1. private Docker registry (external to the swarm).
  1. private `nginx` load balancer (external to the swarm).
  1. the swarm visualizer, and its reverse proxy (`services` stack)
  1. the web and the api, and their associated reverse proxy and gateway (`app` stack).

![Swarm Visualizer](doc/visualizer.png)

Incoming requests can hit any node of the swarm and will be routed to an instance of the service (that has published the port) by the swarm's mesh routing.

## To set up the cluster
1.  Install VirtualBox and Docker for Mac (I had a few problems deploying a stack with 17.06 so maybe use 17.05 or below).

1.  There's a script to create a swarm, which provisions 4 local VMs and joins them into a cluster. Take a look at the script to see how straight forward it is.

    ```bash
    ./provisioning/osx/swarm.sh
    ```

1.  There's also a script to create a local private registry.

    ```sh
    ./provisioning/osx/registry.sh
    ```

1. The following steps use aliases to make working with local and swarm docker servers (you might want to add them to your `.bash_profile`):

    ```sh
    alias on-local="/path/to/provisioning/osx/on-local.sh"
    alias on-swarm="/path/to/provisioning/osx/on-swarm.sh"
    alias to-local="source /path/to/provisioning/osx/point-to-local.sh"
    alias to-swarm="source /path/to/provisioning/osx/point-to-swarm.sh"
    ```

1.  Create a secret that the `api` service will use (note we use `printf` instead of `echo` to prevent a new-line being added)

    ```sh
    printf 'sssshhhh!' | on-swarm docker secret create my_secret -
    ```

1.  Build, push and deploy the services stack

    ```sh
    ./deploy-services.sh
    ```

1.  Build, push and deploy the app stack

    ```sh
    ./deploy-app.sh
    ```

1.  There's a script to create a load balancer (also outside the swarm). Note that if the IP addresses of your VMs change, you'll need to run this script again, so that the load balancer points to the correct nodes.

    ```sh
    ./provisioning/osx/load-balancer.sh
    ```

    The app should now be available at http://localhost and the visualizer at http://localhost/_cluster/swarm/

You should now see all the services running:

```sh
on-swarm docker service ls
ID            NAME                 MODE        REPLICAS  IMAGE
16aozwerflj8  app_web              replicated  3/3       localhost:5000/web:latest
8nyovw1xqnwh  app_rproxy           replicated  3/3       localhost:5000/app_rproxy:latest
d0p2a0toiizi  app_api              replicated  3/3       localhost:5000/api:latest
ivea53e00djo  services_rproxy      replicated  1/1       localhost:5000/services_rproxy:latest
n1m32eri5qay  services_visualizer  replicated  1/1       charypar/swarm-dashboard:latest
v6ex7zwvvbng  app_gateway          replicated  3/3       localhost:5000/proxy:latest
```

## Cleaning up

```sh
./provisioning/osx/local-cleanup.sh
./provisioning/osx/swarm-cleanup.sh
```

A note about overlay networks
-----

Be careful of clashes between `Boot2Docker`'s networking and `docker swarm`'s overlay networks
(they both use `10.0.n/24`). This is why we change the subnet for the `private` overlay network in
[the compose file](./docker-compose-app.yml) (as we ended up looking for a DNS server on the
`private` network rather than on the host)
