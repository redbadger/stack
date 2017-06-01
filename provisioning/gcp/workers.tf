resource "google_compute_instance_group_manager" "swarm_workers" {
  name  = "swarm-workers-${element(keys(var.zones), count.index)}"
  zone  = "${lookup(var.zones, element(keys(var.zones), count.index))}"
  count = "${length(keys(var.zones))}"

  instance_template  = "${google_compute_instance_template.swarm_worker.self_link}"
  target_pools       = ["${google_compute_target_pool.swarm_workers.self_link}"]
  base_instance_name = "swarm-worker"

  depends_on = ["google_compute_instance_template.swarm_worker"]
}

resource "google_compute_instance_template" "swarm_worker" {
  name_prefix    = "swarm-worker-"
  machine_type   = "g1-small"
  can_ip_forward = false
  region         = "${var.region}"

  tags = ["swarm-node"]

  service_account {
    email  = "${google_service_account.swarm_state.email}"
    scopes = ["https://www.googleapis.com/auth/devstorage.read_only"]
  }

  metadata {
    user-data              = "${data.template_file.metadata_worker.rendered}"
    block-project-ssh-keys = "TRUE"
  }

  disk {
    source_image = "coreos-alpha-1409-0-0-v20170511"
  }

  network_interface {
    subnetwork = "${var.subnetwork}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

data "template_file" "metadata_worker" {
  template = "${file("cloud-init/coreos-worker.yml")}"

  vars {
    BUCKET_NAME = "${google_storage_bucket.swarm_state.name}"
  }
}

resource "google_compute_autoscaler" "swarm_workers" {
  name   = "swarm-workers-${element(keys(var.zones), count.index)}"
  zone   = "${lookup(var.zones, element(keys(var.zones), count.index))}"
  target = "${element(google_compute_instance_group_manager.swarm_workers.*.self_link, count.index)}"
  count  = "${length(keys(var.zones))}"

  autoscaling_policy {
    min_replicas    = 1
    max_replicas    = 2
    cooldown_period = 60 # 60 is default

    cpu_utilization {
      target = 0.9
    }
  }
}
