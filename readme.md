This repo is a noddy web ui and proxied api (on a private network) with `version 3` compose files that are designed to be deployed into a "Docker in swarm mode" cluster.

There are 3 compose files:
  1. One for a private Docker registry and nginx load balancer (external to the swarm).
  1. One for the swarm visualizer, and its reverse proxy (`services` stack)
  1. One for the web and the api, and their associated reverse proxy and gateway (`app` stack).

![Swarm Visualizer](doc/visualizer.png)

Incoming requests can hit any node of the swarm and will be routed to an instance of the service (that has published the port) by the swarm's mesh routing.

## To set up the cluster
1.  Install VirtualBox and Docker for Mac (I had a few problems deploying a stack with 17.06 so maybe use 17.05 or below).

1.  There's a script to create a swarm, which provisions 4 local VMs and joins them into a cluster ...

    ```bash
    sh provisioning/osx/swarm.sh
    ```

1.  There's also a script to create a local private registry and a load balancer (both outside the swarm). Note that if the IP addresses of your VMs change, you'll need to run this script again, so that the load balancer points to the correct nodes.

    ```sh
    sh provisioning/osx/local.sh
    ```

1. In order to push images to the local private registry, you will need to create an alias to `localhost` for `registry` in `/etc/hosts`:

  ```
  127.0.0.1 localhost registry
  ```

1. Point your Docker client at the manager.

    ```sh
    source provisioning/osx/point-to-swarm.sh
    ```

1.  Create a secret that the `api` service will use (note we use `printf` instead of `echo` to prevent a new-line being added)

    ```sh
    printf 'sssshhhh!' | docker secret create my_secret -
    ```

1.  Build, push and deploy the services stack

    ```sh
    sh deploy-services.sh
    ```

1.  Build, push and deploy the app stack

    ```sh
    sh deploy.sh
    ```

    You should now see all the services running

    ```sh
    docker service ls
    ID            NAME                 MODE        REPLICAS  IMAGE
    16aozwerflj8  app_web              replicated  3/3       registry:5000/web:latest
    8nyovw1xqnwh  app_rproxy           replicated  3/3       registry:5000/app_rproxy:latest
    d0p2a0toiizi  app_api              replicated  3/3       registry:5000/api:latest
    ivea53e00djo  services_rproxy      replicated  1/1       registry:5000/services_rproxy:latest
    n1m32eri5qay  services_visualizer  replicated  1/1       charypar/swarm-dashboard:latest
    v6ex7zwvvbng  app_gateway          replicated  3/3       registry:5000/proxy:latest
    ```

## Cleaning up

```sh
sh provisioning/osx/local-cleanup.sh
sh provisioning/osx/swarm-cleanup.sh
```

A note about overlay networks
-----

Be careful of clashes between `Boot2Docker`'s networking and `docker swarm`'s overlay networks
(they both use `10.0.n/24`). This is why we change the subnet for the `private` overlay network in
[the compose file](./docker-compose-app.yml) (as we ended up looking for a DNS server on the
`private` network rather than on the host)
