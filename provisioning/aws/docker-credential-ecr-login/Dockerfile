# Amazon ECR credential-helper
# @see https://github.com/awslabs/amazon-ecr-credential-helper

FROM golang:1.9.1-alpine3.6

RUN  apk --no-cache add git \
  && go get -u github.com/awslabs/amazon-ecr-credential-helper/ecr-login/cli/docker-credential-ecr-login

ENTRYPOINT ["bin/docker-credential-ecr-login"]
