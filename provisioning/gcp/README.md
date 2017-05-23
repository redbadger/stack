# Automated provisioning for Google Cloud Platform

Create a self-healing, auto-scaling Docker cluster in GCP using Terraform.

## Architecture

The cluster consists of six Compute Instance Groups: three for managers, three workers,
spread across three availability zones.

The managers groups have one machine each. The worker groups are auto-scaling and
you can configure the minimums and maximums.

In both groups the instance template used is configured to automatically join
into a Docker Swarm using a small bit of bookkeeping stored in a Storage bucket.

The scripts also configure network security to allow the Swarm to communicate and
Allow incoming SSH connections to the managers.

### Left for the user

These scripts don't automatically set up a load balancer, although they do
create a Target pool from the workers.

## Prerequisites

You will need:

* Terraform on your machine
* A Google Cloud Platform project with a VPC network containing at least one
  subnetwork (we recommend having two networks - one public, one private)
* A service account for which you've generated a JSON credentials file
  (In the Google Cloud Console, under API Manager, Credentials, click
  Create Credentials and pick "Service account key" from the choices). The scripts
  Assume this is stored in `credentials.json` in the current directory.

## Usage

1. Update `variables.tf` to match your project
1. Run `terraform plan` to see what will be created
1. Run `terraform apply`. Once terraform is done, it'll take a few minutes for all
   the compute instances to start and join the swarm.
1. You should now be able to ssh onto one of the managers, run `docker node ls`
   and you should see the cluster nodes.

## To do

* Limit SSH access to only non-interactive only to only allow tunnelling to the
  manager nodes to issue docker commands
* Create an SSH bastion that is the only machine accessible from the public
  internet and the only machine allowed to connect to the swarm managers
* Add conditional load balancer creation
