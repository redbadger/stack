#!/bin/sh
SECRET=$( \
docker run --rm \
  -e METHOD=$1 \
  -e REGISTRY="$(cat -)" \
  pottava/amazon-ecr-credential-helper \
)
echo $SECRET | grep Secret
