package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
)

func getDigest(registry string, name string, tag string) string {
	digestHeader := "Docker-Content-Digest"

	// Construct URL
	manifestURL := "http://" + registry + "/v2/" + name + "/manifests/" + tag

	// Make HEAD request
	resp, err := http.Head(manifestURL)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	digest := resp.Header.Get(digestHeader)

	if digest == "" {
		log.Fatal("could not read " + digestHeader + " header from response")
	}

	return digest
}

func main() {
	registry := os.Getenv("registry")
	tag := os.Getenv("tag") // TODO: default to current git commit sha

	// Read files
	files, err := ioutil.ReadDir(".")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		fileName := file.Name()

		content, err := ioutil.ReadFile(fileName)
		if err != nil {
			log.Fatal(err)
		}

		text := string(content)

		re := regexp.MustCompile(`image: \${registry}/(.+)`)

		newText := re.ReplaceAllStringFunc(text, func(input string) string {
			a := re.FindStringSubmatch(input)
			name := a[1]
			digest := getDigest(registry, name, tag)
			return "image: " + registry + "/" + name + "@" + digest
		})

		fmt.Println(newText + "---\n")
	}
}
