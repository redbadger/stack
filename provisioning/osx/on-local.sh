#!/bin/sh

eval "$(docker-machine env -u)"

cmd=$1; shift
$cmd "$@"
