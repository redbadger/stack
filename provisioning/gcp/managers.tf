resource "google_compute_instance_group_manager" "swarm_managers" {
  name  = "swarm-managers-${element(keys(var.zones), count.index)}"
  zone  = "${lookup(var.zones, element(keys(var.zones), count.index))}"
  count = "${length(keys(var.zones))}"

  instance_template  = "${google_compute_instance_template.swarm_manager.self_link}"
  target_pools       = []
  base_instance_name = "swarm-manager"
  target_size        = 1

  depends_on = ["google_compute_instance_template.swarm_manager"]
}

resource "google_compute_instance_template" "swarm_manager" {
  name_prefix    = "${var.env}-swarm-manager-"
  machine_type   = "g1-small"
  can_ip_forward = false
  region         = "${var.region}"

  tags = ["swarm-node", "swarm-manager"]

  service_account {
    email  = "${google_service_account.swarm_state.email}"
    scopes = ["https://www.googleapis.com/auth/devstorage.read_write"]
  }

  metadata {
    user-data = "${data.template_file.metadata_manager.rendered}"
  }

  disk {
    source_image = "coreos-alpha-1409-0-0-v20170511"
  }

  network_interface {
    subnetwork = "${var.subnetwork}"

    access_config {
      // Ephemeral IP
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

data "template_file" "metadata_manager" {
  template = "${file("cloud-init/coreos-manager.yml")}"

  vars {
    BUCKET_NAME = "${google_storage_bucket.swarm_state.name}"
  }
}
