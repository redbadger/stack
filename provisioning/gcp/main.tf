provider "google" {
  project     = "${var.project_name}"
  region      = "${var.region}"
  credentials = "${file("./credentials.json")}"
}

resource "google_service_account" "swarm_state" {
  account_id   = "swarm-state"
  display_name = "Swarm state reader"
}

resource "google_compute_target_pool" "swarm_workers" {
  name = "swarm-workers"
}
