resource "aws_security_group" "web_servers" {
  name        = "web_server"
  description = "web traffic"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_launch_configuration" "worker" {
  name_prefix                 = "worker-"
  image_id                    = "${var.ami}"
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  security_groups             = ["${aws_security_group.nodes.id}", "${aws_security_group.web_servers.id}"]
  depends_on                  = ["null_resource.ignition"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "workers" {
  availability_zones  = ["${var.zones}"]
  vpc_zone_identifier = ["${var.private_subnets}"]
  name                = "microplatform-workers"

  min_size                  = 0
  max_size                  = 12
  desired_capacity          = 0
  wait_for_capacity_timeout = 0

  health_check_grace_period = 300
  health_check_type         = "ELB"
  launch_configuration      = "${aws_launch_configuration.worker.name}"
  termination_policies      = ["OldestInstance", "ClosestToNextInstanceHour"]
  default_cooldown          = 0

  lifecycle {
    create_before_destroy = true
  }
}
