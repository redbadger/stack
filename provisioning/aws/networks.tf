resource "aws_route53_zone" "local" {
  name          = "local"
  vpc_id        = "${var.vpc_id}"
  force_destroy = true
}

resource "aws_security_group" "nodes" {
  name        = "node"
  description = "Swarm traffic"
  vpc_id      = "${var.vpc_id}"

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
}

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
