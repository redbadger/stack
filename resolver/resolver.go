package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	registry := os.Getenv("registry")
	tag := os.Getenv("tag") // TODO: default to current git commit sha

	// Construct URL
	manifestURL := "http://" + registry + "/v2/web/manifests/" + tag // FIXME: replace 'web' with the actual name

	// Make HEAD request
	resp, err := http.Head(manifestURL)
	if err != nil {
		log.Fatal("could not perform HEAD request ", err)
	}
	defer resp.Body.Close()

	digest := resp.Header.Get("Docker-Content-Digest")

	if digest == "" {
		log.Fatal("could not read 'Docker-Content-Digest' header from response")
	}

	fmt.Println(digest)
}
