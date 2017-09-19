data "template_file" "ignition_manager" {
  template = "${file("${path.module}/container-linux-config/manager.yml")}"

  vars {
    efs-mount-target  = "${aws_efs_file_system.tokens.id}.efs.${var.region}.amazonaws.com"
    swarm-init-script = "${jsonencode(file("${path.module}/container-linux-config/manager.sh"))}"
  }
}

data "ct_config" "ignition_manager" {
  pretty_print = false
  content      = "${data.template_file.ignition_manager.rendered}"
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
  default_cooldown          = 300

  depends_on = [
    "aws_efs_mount_target.tokens",
    "aws_route53_zone.local",
  ]

  initial_lifecycle_hook {
    name                 = "register_dns"
    lifecycle_transition = "autoscaling:EC2_INSTANCE_LAUNCHING"

    default_result    = "ABANDON"
    heartbeat_timeout = 2000

    notification_metadata = <<EOF
{
  "action": "CREATE",
  "hostedZoneId": "${aws_route53_zone.local.zone_id}"
}
EOF

    notification_target_arn = "${aws_sns_topic.register_dns.arn}"
    role_arn                = "${aws_iam_role.iam_for_sns_notification.arn}"
  }

  initial_lifecycle_hook {
    name                 = "deregister_dns"
    lifecycle_transition = "autoscaling:EC2_INSTANCE_TERMINATING"

    default_result    = "CONTINUE"
    heartbeat_timeout = 2000

    notification_metadata = <<EOF
{
  "action": "DELETE",
  "hostedZoneId": "${aws_route53_zone.local.zone_id}"
}
EOF

    notification_target_arn = "${aws_sns_topic.register_dns.arn}"
    role_arn                = "${aws_iam_role.iam_for_sns_notification.arn}"
  }

  lifecycle {
    create_before_destroy = true
  }
}
