#!/usr/bin/env bash

set -eux

docker run \
  -e BUILDKITE_AGENT_CONFIG="/buildkite/buildkite-agent.cfg" \
  -v "$HOME/.buildkite/agent.cfg:/buildkite/buildkite-agent.cfg:ro" \
  -d \
  buildkite/agent:3
