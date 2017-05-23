resource "google_storage_bucket" "swarm_state" {
  name          = "swarm-state"
  location      = "${var.region}"
  storage_class = "REGIONAL"
  force_destroy = true
}

resource "google_storage_bucket_acl" "swarm_state_acl" {
  bucket = "${google_storage_bucket.swarm_state.name}"

  role_entity = [
    "WRITER:user-${google_service_account.swarm_state.email}",
  ]
}
