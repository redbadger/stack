## Setup

1. Install [Minikube](https://github.com/kubernetes/minikube)

   ```bash
   brew cask install minikube
   ```

2. Start `minikube` (with an option to allow access to the registry - see below)

   ```bash
   minikube start --insecure-registry "docker.for.mac.localhost:5000"
   ```

### Registry

1. Enable the registry add-on
   (https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/registry)

   ```bash
   minikube addons enable registry
   ```

1. Install the `kube-registry-proxy` DaemonSet:

   ```bash
   kubectl apply -f
   https://github.com/Faithlife/minikube-registry-proxy/raw/master/kube-registry-proxy.yml
   ```

1. Add `docker.for.mac.localhost:5000` to insecure registries in docker for mac
   preferences (`Daemon` tab).

1. Add `127.0.0.1 docker.for.mac.localhost` to `/etc/hosts` on node (`minikube
   ssh`):

   ```bash
   minikube ssh "sudo sh -c 'echo 127.0.0.1 docker.for.mac.localhost > /etc/hosts'"
   ```

1. Port forward to registry:

   ```bash
   kubectl port-forward -n kube-system "$(kubectl get pods -n  kube-system -o name | grep /registry | cut -d/ -f2)" 5000 >/dev/null 2>&1 &
   ```

   You can now push images with a `docker.for.mac.localhost:5000/` tag prefix
   and pull them into Minikube.

### DNS

1. Start a local DNS server that will allow us to use `namespace.cluster.local`
   to access our apps.

   ```bash
   sudo mkdir -p /etc/resolver
   sudo sh -c 'echo "nameserver 127.0.0.1" > /etc/resolver/local'
   sudo sh -c 'echo "nameserver 127.0.0.1" > /etc/resolver/localhost'
   ../osx/dns.sh "$(minikube ip)"
   ```

### Load Balancing

1. Enable the ingress add-on:

   ```bash
   minikube addons enable ingress
   ```

   You can now deploy the [example](../../../example) application.
