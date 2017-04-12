#!/usr/bin/env bash

# run from the root of this repository

str=''
for node in $(docker-machine ip $(docker-machine ls -q))
do
  str="$str  server $node;"
done

sed '/upstream swarm/ a\
'"$str"'\
' < nginx/default.conf > nginx/new.conf

docker run -d -p 80:80 -v $(pwd)/nginx/new.conf:/etc/nginx/conf.d/default.conf --name load-balancer nginx
