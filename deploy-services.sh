#!/usr/bin/env bash

docker-compose -f docker-compose-services.yml build && \
  docker-compose -f docker-compose-services.yml push && \
  docker stack deploy --compose-file=docker-compose-services.yml services
