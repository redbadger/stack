variable "region" {
  default = "eu-west-1"
}

variable "vpc_id" {
  default = "vpc-235fdf44"
}

variable "zones" {
  default = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

variable "private_subnets" {
  default = ["subnet-f49e2493", "subnet-981390d1", "subnet-01c7015a"]
}

variable "ssh_bastion_sg" {
  default = ["sg-89129ef1"]
}

variable "ssh_public_key_file" {
  default = "~/.ssh/id_rsa.pub"
}
