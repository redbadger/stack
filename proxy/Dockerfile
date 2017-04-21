FROM golang:1.8

RUN mkdir -p /go/src/app
WORKDIR /go/src/app

COPY . /go/src/app
RUN go-wrapper download
RUN go-wrapper install

EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl --fail http://localhost:8080/health || exit 1

CMD ["go-wrapper", "run", "main.go"]
