resolver
----

Small utility written in `Go`, that reads all the files in the current directory, and writes them to `stdout` having replaced any strings that look like:

`image: ${registry}/my-image`

with something that looks like

`image: docker.for.mac.localhost:5000/my-image@sha256:c1ac790cbae774e6835cf325074740a00c95a70efe80f2c968f7a8e5b9243215`

It depends on 2 environment variables being exported.
For example,

```
export registry=docker.for.mac.localhost:5000
export tag="$(git rev-parse --short=10 HEAD)"
```

or specified on the command line as below.

Compile:

```
go build
```

Example usage (from directory containing k8s yaml files):

```bash
registry=docker.for.mac.localhost:5000 tag="$(git rev-parse --short=10 HEAD)" \
  ./<path-to-resolver>/resolver | kubectl apply -f -
```

Note: The image digest SHA for the specified image is obtained from its registry by doing a `HEAD` request on the image manifest.
