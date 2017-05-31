resource "google_storage_bucket" "swarm_state" {
  name          = "swarm-state"
  location      = "EUROPE-WEST1"
  storage_class = "REGIONAL"
  force_destroy = true
}

resource "google_storage_bucket_acl" "swarm_state_acl" {
  bucket = "${google_storage_bucket.swarm_state.name}"

  role_entity = [
    "WRITER:user-${google_service_account.swarm_state.email}",
  ]
}
