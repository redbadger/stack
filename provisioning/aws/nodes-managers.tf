resource "aws_security_group" "managers" {
  name        = "manager"
  description = "manager traffic"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port = 2377
    to_port   = 2377
    protocol  = "tcp"
    self      = true
  }
}

resource "aws_launch_configuration" "manager" {
  name_prefix                 = "manager-"
  image_id                    = "${var.ami}"
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  security_groups             = ["${aws_security_group.nodes.id}", "${aws_security_group.managers.id}", "${aws_security_group.ssh.id}"]
  key_name                    = "${aws_key_pair.manager.key_name}"
  user_data                   = "${file("./container-linux-config/manager.json")}"
  depends_on                  = ["null_resource.ignition_managers"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_key_pair" "manager" {
  key_name   = "manager-key"
  public_key = "${file("${var.ssh_public_key_file}")}"
}

resource "aws_autoscaling_group" "managers" {
  availability_zones  = ["${var.zones}"]
  vpc_zone_identifier = ["${var.private_subnets}"]
  name                = "microplatform-managers"

  min_size                  = 0
  max_size                  = 3
  desired_capacity          = 1
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
