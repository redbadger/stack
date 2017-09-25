package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

func handler(w http.ResponseWriter, r *http.Request) {
}

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

// CreateProxy creates a new reverse proxy
func CreateProxy(target *url.URL) *httputil.ReverseProxy {
	targetQuery := target.RawQuery
	director := func(req *http.Request) {
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.URL.Path = singleJoiningSlash(target.Path, req.URL.Path)
		if targetQuery == "" || req.URL.RawQuery == "" {
			req.URL.RawQuery = targetQuery + req.URL.RawQuery
		} else {
			req.URL.RawQuery = targetQuery + "&" + req.URL.RawQuery
		}
		// set custom headers
		req.Header.Set("X-Hostname", os.Getenv("HOSTNAME"))
		req.Header.Set("X-Extra", "hello")
	}
	return &httputil.ReverseProxy{Director: director}
}

func main() {
	port := os.Getenv("PORT")
	apiHost := os.Getenv("API_HOST")

	proxy := CreateProxy(&url.URL{Scheme: "http", Host: apiHost})
	mux := http.NewServeMux()
	mux.HandleFunc("/_health", handler)
	mux.Handle("/", proxy)
	http.ListenAndServe(":"+port, mux)
}
