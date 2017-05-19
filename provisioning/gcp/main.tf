provider "google" {
  project     = "${var.project_name}"
  region      = "europe-west1"
  credentials = "${file("./credentials.json")}"
}

resource "google_service_account" "swarm_state" {
  account_id   = "swarm-state"
  display_name = "Swarm state reader"
}

resource "google_compute_target_pool" "swarm_workers" {
  name = "swarm-workers"
}
