resource "google_compute_firewall" "swarm_nodes" {
  name        = "docker-swarm-node"
  network     = "${var.network}"
  target_tags = ["swarm-node"]

  source_tags = ["swarm-node"]

  allow {
    protocol = "tcp"
    ports    = ["7946"]
  }

  allow {
    protocol = "udp"
    ports    = ["4789", "7946"]
  }
}

resource "google_compute_firewall" "swarm_managers" {
  name        = "docker-swarm-manager"
  network     = "${var.network}"
  target_tags = ["swarm-manager"]

  source_tags = ["swarm-node"]

  allow {
    protocol = "tcp"
    ports    = ["2377"]
  }
}
