variable "region" {
  default = "eu-west-1"
}

variable "vpc_id" {
  default = "vpc-2ddf9a4a"
}

variable "zones" {
  default = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

variable "private_subnets" {
  default = ["subnet-81e191e6", "subnet-93ccb7da", "subnet-10902c4b"]
}

variable "manager_count" {
  default = 1
}

variable "worker_count" {
  default = 2
}

variable "manager_instance_type" {
  default = "t2.nano"
}

variable "worker_instance_type" {
  default = "t2.nano"
}

variable "ami" {
  # coreos alpha channel, Container Linux 1562.1.0, Docker 17.09.0
  default = "ami-f8dc0e81"
}

variable "ssh_bastion_sg" {
  default = ["sg-ecfefe94"]
}

variable "ssh_public_key_file" {
  default = "~/.ssh/id_rsa.pub"
}
