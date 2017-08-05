resource "aws_launch_configuration" "manager" {
  name_prefix                 = "manager-"
  image_id                    = "ami-38ef0041"
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  security_groups             = ["${aws_security_group.nodes.id}", "${aws_security_group.managers.id}", "${aws_security_group.ssh.id}"]
  key_name                    = "${aws_key_pair.manager.key_name}"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "managers" {
  availability_zones        = ["${var.zones}"]
  vpc_zone_identifier       = ["${var.private_subnets}"]
  name                      = "microplatform-managers"
  max_size                  = 3
  min_size                  = 3
  health_check_grace_period = 300
  health_check_type         = "ELB"
  desired_capacity          = 3
  launch_configuration      = "${aws_launch_configuration.manager.name}"
  termination_policies      = ["OldestInstance", "ClosestToNextInstanceHour"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_key_pair" "manager" {
  key_name   = "manager-key"
  public_key = "${file("${var.ssh_public_key_file}")}"
}
