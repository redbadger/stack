variable "project_name" {
  default = "microplatform-demo"
}

variable "region" {
  default = "europe-west1"
}

variable "zones" {
  default = {
    b = "europe-west1-b"
    c = "europe-west1-c"
    d = "europe-west1-d"
  }
}

variable "network" {
  default = "demo"
}

variable "subnetwork" {
  default = "private"
}
