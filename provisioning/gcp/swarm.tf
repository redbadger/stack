provider "google" {
  project     = "${var.project_name}"
  region      = "europe-west1"
  credentials = "${file("credentials.json")}"
}

resource "google_compute_autoscaler" "swarm_workers" {
  # TODO do this for each zone
  name   = "swarm-workers"
  zone   = "europe-west1-c"
  target = "${google_compute_instance_group_manager.swarm_workers.self_link}"

  autoscaling_policy {
    min_replicas    = 3
    max_replicas    = 6
    cooldown_period = 30

    cpu_utilization {
      target = 0.5
    }
  }
}

resource "google_compute_instance_group_manager" "swarm_workers" {
  name = "swarm-workers"
  zone = "europe-west1-c" # TODO do this for each zone

  instance_template  = "${google_compute_instance_template.swarm_worker.self_link}"
  target_pools       = ["${google_compute_target_pool.swarm_workers.self_link}"]
  base_instance_name = "swarm-worker"

  depends_on = ["google_compute_instance_template.swarm_worker"]
}

resource "google_compute_instance_template" "swarm_worker" {
  name_prefix    = "swarm-worker-"
  machine_type   = "g1-small"
  can_ip_forward = false
  region         = "europe-west1"

  metadata {
    # user-data doesn't work on RancherOS on GCE
    user-data = "${data.template_file.metadata_worker.rendered}"
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

# load balancer target pool
resource "google_compute_target_pool" "swarm_workers" {
  name = "swarm-workers"
}

data "template_file" "metadata_worker" {
  template = "${file("cloud-init/coreos-worker.yml")}"

  vars {
    MANAGER_IP = "${var.manager_ip}"
    JOIN_TOKEN = "${var.worker_token}"
  }
}
