# resource "aws_launch_configuration" "worker" {
#   name_prefix                 = "worker-"
#   image_id                    = "${var.ami}"
#   instance_type               = "t2.micro"
#   associate_public_ip_address = false
#   security_groups             = ["${aws_security_group.nodes.id}", "${aws_security_group.web_servers.id}"]
#
#   lifecycle {
#     create_before_destroy = true
#   }
# }
#
# resource "aws_autoscaling_group" "workers" {
#   availability_zones        = ["${var.zones}"]
#   vpc_zone_identifier       = ["${var.private_subnets}"]
#   name                      = "microplatform-workers"
#   max_size                  = 12
#   min_size                  = 3
#   health_check_grace_period = 300
#   health_check_type         = "ELB"
#   desired_capacity          = 3
#   launch_configuration      = "${aws_launch_configuration.worker.name}"
#   termination_policies      = ["OldestInstance", "ClosestToNextInstanceHour"]
#
#   lifecycle {
#     create_before_destroy = true
#   }
# }

