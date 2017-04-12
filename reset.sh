#!/usr/bin/env bash

# unsets Docker env vars so that local Docker points back to "Docker for Mac" (xhyve)

unset DOCKER_TLS_VERIFY;
unset DOCKER_HOST;
unset DOCKER_CERT_PATH;
unset DOCKER_MACHINE_NAME;
