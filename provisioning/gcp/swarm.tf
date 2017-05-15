provider "google" {
  project     = "microplatform-demo"
  credentials = "${file("~/.config/gcloud/application_default_credentials.json")}"
}

data "google_compute_network" "swarm" {
  name = "microplatform-swarm"
}

resource "google_compute_instance" "test-node" {
  machine_type = "f1-micro"
  zone         = "europe-west1-c"

  metadata_startup_script = "${data.template_file.metadata_worker.rendered}"

  disk {
    image = "rancheros-1-0-1"
  }

  network_interface {
    network    = "demo"
    subnetwork = "private"

    access_config {
      // Ephemeral IP
    }
  }
}

data "template_file" "metadata_worker" {
  template = "${file("userdata/worker.yml")}"

  var {
    MANAGER_IP = "127.0.9.1"
    JOIN_TOKEN = "xxx"
  }
}
