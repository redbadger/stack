### Docker in Swarm Mode...

```bash
../configure/lib/index.js build app

../configure/lib/index.js push app

../configure/lib/index.js deploy app
```

### Kubernetes...

```bash
../configure/lib/index.js build app

../configure/lib/index.js push app

export namespace=app-123
export registry=docker.for.mac.localhost:5000
tag="$(git rev-parse --short=10 HEAD)" && export tag
(
  cd _k8s &&
    ../../resolver/resolver |
    envsubst |
    kubectl -n "$namespace" apply -f -
)
```
