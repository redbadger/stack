#!/bin/sh

eval "$(docker-machine env mgr1)"

cmd=$1; shift
$cmd "$@"
