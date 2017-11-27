package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
)

func getDigest(registry string, name string, tag string) string {
	digestHeader := "Docker-Content-Digest"

	manifestURL := "http://" + registry + "/v2/" + name + "/manifests/" + tag

	client := &http.Client{}
	req, _ := http.NewRequest("HEAD", manifestURL, nil)
	req.Header.Set("Accept", "application/vnd.docker.distribution.manifest.v2+json")

	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode == 404 {
		log.Fatal("Image '" + name + "', with tag '" + tag + "' was not found at '" + registry + "'")
	}

	digest := resp.Header.Get(digestHeader)

	if digest == "" {
		log.Fatal("Could not read " + digestHeader + " header from response")
	}

	return digest
}

func main() {
	registry := os.Getenv("registry")
	tag := os.Getenv("tag")

	files, err := ioutil.ReadDir(".")
	if err != nil {
		log.Fatal(err)
	}

	re := regexp.MustCompile(`image: \${registry}/(.+)`)

	for _, file := range files {
		fileName := file.Name()

		if strings.HasSuffix(fileName, ".yml") || strings.HasSuffix(fileName, ".yaml") {
			content, err := ioutil.ReadFile(fileName)
			if err != nil {
				log.Fatal(err)
			}

			text := string(content)

			newText := re.ReplaceAllStringFunc(text, func(input string) string {
				a := re.FindStringSubmatch(input)
				name := a[1]
				digest := getDigest(registry, name, tag)
				return "image: " + registry + "/" + name + "@" + digest
			})

			fmt.Println(newText + "---\n")
		}

	}
}
