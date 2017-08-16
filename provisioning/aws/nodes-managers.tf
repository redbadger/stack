data "ct_config" "ignition_manager" {
  pretty_print = false
  content      = "${replace(file("./container-linux-config/manager.yml"), "efs-mount-target", "${aws_efs_file_system.tokens.id}.efs.${var.region}.amazonaws.com")}"
}

resource "aws_launch_configuration" "manager" {
  name_prefix                 = "manager-"
  image_id                    = "${var.ami}"
  instance_type               = "t2.micro"
  associate_public_ip_address = false

  security_groups = [
    "${aws_security_group.nodes.id}",
    "${aws_security_group.ssh.id}",
  ]

  key_name  = "${aws_key_pair.node.key_name}"
  user_data = "${data.ct_config.ignition_manager.rendered}"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "managers" {
  availability_zones  = ["${var.zones}"]
  vpc_zone_identifier = ["${var.private_subnets}"]
  name                = "microplatform-managers"

  min_size                  = 0
  max_size                  = 3
  desired_capacity          = "${var.manager_count}"
  wait_for_capacity_timeout = 0

  health_check_grace_period = 300
  health_check_type         = "ELB"
  launch_configuration      = "${aws_launch_configuration.manager.name}"
  termination_policies      = ["OldestInstance", "ClosestToNextInstanceHour"]
  default_cooldown          = 0

  lifecycle {
    create_before_destroy = true
  }
}
