resource "aws_efs_file_system" "tokens" {
  tags {
    Name = "Tokens"
  }
}

resource "aws_efs_mount_target" "tokens" {
  count           = "${length(var.private_subnets)}"
  file_system_id  = "${aws_efs_file_system.tokens.id}"
  subnet_id       = "${element(var.private_subnets, count.index)}"
  security_groups = ["${aws_security_group.efs_mount_target.id}"]
}

resource "aws_security_group" "efs_mount_target" {
  name        = "efs_mount_target"
  description = "For EFS Mount targets"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = ["${aws_security_group.nodes.id}"]
  }
}
