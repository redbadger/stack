[![Build status](https://badge.buildkite.com/5d85736c5c70e3acecf5dc048195b85754df59febb84ddd824.svg?branch=master)](https://buildkite.com/red-badger-1/stack)

This repo is a noddy web ui and proxied api (on a private network) with `version 3` compose files that are designed to be deployed into a "Docker in swarm mode" cluster.

There are 4 containers running outside the cluster:
  1. private Docker registry (for pushing local images)
  1. registry mirror (for caching public images)
  1. `nginx` load balancer (for hostname to upstream mapping)
  1. `dnsmasq` dns server (for `.local` tld resolution)

And 3 stacks running inside the cluster:
  1. the swarm visualizer (`services` stack)
  1. the registry ambassador (`swarm` stack)
  1. the web and the api, and their associated reverse proxy and gateway (`app` stack)

![Swarm Visualizer](doc/visualizer.png)

Incoming requests can hit any node of the swarm and will be routed to an instance of the service (that has published the port) by the swarm's mesh routing.

You can also describe stack configurations (published services) in `stacks.yml` and use the configuration utility (`./provisioning/osx/configure/lib/index.js --help`) to write deployable compose-files from multiple merged compose files (includes automatic port assignment). Combined with the local `dns` server and `nginx` load balancer, this allows you to access published services by FQDNs in the form `http://service.stack.local` (in this case http://visualizer.services.local and http://web.app.local). Full documentation for the configuration utility is coming soon :-)

## To set up the cluster
1.  Install VirtualBox and Docker for Mac (I had a few problems deploying a stack with 17.06 so maybe use 17.05 or below).

1.  Run the script to create a swarm, which provisions 4 local VMs and joins them into a cluster. Take a look at the script to see how straight forward it is. NOTE: this script starts by removing any VMs with the names `mgr1,wkr1,wkr2,wkr3`.

    ```bash
    ./provisioning/osx/swarm.sh
    ```

1.  Run the script to run a container with a load balancer (also outside the swarm). Note that if the IP addresses of your VMs change, you'll need to run this script again, so that the load balancer points to the correct nodes.

    ```sh
    ./provisioning/osx/load-balancer.sh
    ```
1.  Run the script to run a container with a local dns server (also outside the swarm). This is an instance of `dnsmasq` and it used to resolve the tld `.local` to `localhost`.

    ```sh
    ./provisioning/osx/dns.sh
    ```
1.  Run the script to create containers for a local private Docker registry and a local mirror of Docker hub.

    ```sh
    ./provisioning/osx/registry.sh
    ```

1. The following steps use aliases to make it easier to work with local and swarm docker servers (you might want to add them to your `.bash_profile`):

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

1.  Run the `configure` utility to generate deployable compose-files with correct ports. It also can update the load balancer with the new configuration if you specify `-u`.

    ```sh
    ./provisioning/osx/configure/lib/index.js -u
    ```

1.  Build, push and deploy the services stack

    ```sh
    ./deploy-services.sh
    ```

1.  Build, push and deploy the app stack

    ```sh
    ./deploy-app.sh
    ```

    The app should now be available at http://web.app.local and the visualizer at http://visualizer.services.local

You should now see all the services running:

```sh
on-swarm docker service ls

ID                  NAME                        MODE                REPLICAS            IMAGE                              PORTS
3qztnky5jkkw        swarm_registry_ambassador   replicated          1/1                 svendowideit/ambassador:latest     *:5000->5000/tcp
ganvtcr24zmp        app_web                     replicated          2/2                 localhost:5000/web:latest
jzco4rlqyg52        app_gateway                 replicated          2/2                 localhost:5000/proxy:latest
mgo4je3ug8eg        services_visualizer         replicated          1/1                 charypar/swarm-dashboard:latest    *:8000->3000/tcp
nonwzdp91sb3        app_rproxy                  replicated          2/2                 localhost:5000/app_rproxy:latest   *:8001->3000/tcp
wblj76ieyw6z        app_api                     replicated          2/2                 localhost:5000/api:latest
```

And the following local containers running:

```sh
on-local docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                    NAMES
fbff0358c773        andyshinn/dnsmasq   "dnsmasq -k -d -A ..."   9 hours ago         Up 9 hours          0.0.0.0:53->53/tcp, 0.0.0.0:53->53/udp   dns_dns_1
dc929dc479e0        nginx               "nginx -g 'daemon ..."   46 hours ago        Up 46 hours         0.0.0.0:80->80/tcp                       loadbalancer_load_balancer_1
6e2686acd14a        registry:2          "/entrypoint.sh /e..."   46 hours ago        Up 46 hours         0.0.0.0:5001->5000/tcp                   registry_registry-mirror_1
a578c7c8703c        registry:2          "/entrypoint.sh /e..."   46 hours ago        Up 46 hours         0.0.0.0:5000->5000/tcp                   registry_registry_1
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
