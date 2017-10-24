resource "aws_key_pair" "node" {
  key_name   = "node-key"
  public_key = "${file("${var.ssh_public_key_file}")}"
}

resource "aws_security_group" "nodes" {
  name        = "node"
  description = "Swarm traffic"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port = 2377
    to_port   = 2377
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port = 7946
    to_port   = 7946
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port = 4789
    to_port   = 4789
    protocol  = "udp"
    self      = true
  }

  ingress {
    from_port = 7946
    to_port   = 7946
    protocol  = "udp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ssh" {
  name        = "ssh"
  description = "ssh traffic"
  vpc_id      = "${var.vpc_id}"

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = ["${var.ssh_bastion_sg}"]
  }
}

resource "aws_iam_instance_profile" "node_profile" {
  name = "node_profile"
  role = "${aws_iam_role.node_instance_role.name}"
}

resource "aws_iam_role" "node_instance_role" {
  name = "node_instance_role"
  path = "/"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}
