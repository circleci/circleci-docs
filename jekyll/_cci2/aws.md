---
layout: classic-docs
title: "Installing CircleCI v2.16 on Amazon Web Services with Terraform"
category: [administration]
order: 10
description: "How to install CircleCI on Amazon Web Services (AWS)."
---

This document provides requirements and step-by-step instructions for installing CircleCI v2.16 on Amazon Web Services (AWS) with Terraform in the following sections. 

* TOC
{:toc}

Refer to the [v2.16 Changelog](https://circleci.com/server/changelog) for what's new and fixed in this release.

**Notes:**
- CircleCI v2.16 may be installed without a support agreement on AWS using the examples and instructions in this document.
- It is possible to install and configure CircleCI on Azure or any other platform used in your organization with a Platinum CircleCI support agreement.  Contact [CircleCI support](https://support.circleci.com/hc/en-us/requests/new) or your account representative to get started.

## System Requirements

This section defines the system requirements for installing CircleCI v2.16.

### Services Machine
{:no_toc}

The Services machine hosts the core of the Server product, including the user-facing website, API engine, datastores, and Nomad job scheduler. It is best practice to use an isolated machine.

The following table defines the Services machine CPU, RAM, and disk space requirements:

Number of daily active CircleCI users| CPU | RAM| Disk space | NIC speed
---------------------------------|---------|----|------------|----------
<50 | 8 cores | 32GB | 100GB | 1Gbps
50-250 | 12 cores | 64GB | 200GB | 1Gbps
251-1000 | 16 cores | 128GB | 500GB | 10Gbps
1001-5000 | 20 cores | 256GB | 1TB | 10Gbps
5000+ | 24 cores | 512GB | 2TB | 10Gbps
{: class="table table-striped"}

### Externalization
{:no_toc}

With a Platinum support agreement, it is possible to configure the following services to run external to the Services machine for improved performance:

- PostgreSQL
- MongoDB
- Vault
- Rabbitmq
- Redis
- Nomad 
- Slanger

Contact support to evaluate your installation against the current requirements for running external services.

### Nomad Clients
{:no_toc}

Nomad client machines run the CircleCI jobs that were scheduled by the Services machine. Following are the Minimum CPU, RAM, and disk space requirements per client for the default [resource class]({{site.baseurl}}/2.0/configuration-reference/#resource_class):

- CPU: 4 cores
- RAM: 16GB
- Disk space: 100GB
- NIC speed: 1Gbps

The following table defines the number of Nomad clients to make available as a best practice. Scale up and down according to demand on your system:

Number of daily active CircleCI users | Number of Nomad client machines
---------------------------|-----------------------
<50 | 1-5
50-250 | 5-10
250-1000 | 10-15
5000+ | 15+
{: class="table table-striped"}

## Installation Prerequisites

Install the following automated infrastructure provisioning software:

* Terraform, see the [Download Terraform](https://www.terraform.io/downloads.html) web site for links to packages for your architecture.

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI support](https://support.circleci.com/hc/en-us/requests/new) for a license.
* AWS Access Key, AWS Secret Key.
* Name of [AWS EC2 SSH key](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html).
* AWS Region, for example `us-west-2`.
* AWS Virtual Private Cloud (VPC) ID and AWS Subnet ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Services documentation for additional details.

### Private Subnet Requirements
{:no_toc}

The following additional settings are required to support using private subnets on AWS with CircleCI:

- The private subnet for builder boxes must be configured with a [NAT gateway](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-nat-gateway.html) or an [internet gateway](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Internet_Gateway.html) configured for the outbound traffic to the internet via attached route tables. **Note:** The subnet should be large enough to *never* exhaust the addresses.
- The [VPC Endpoint for S3](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/) should be enabled. Enabling the VPC endpoint for S3 should significantly improve S3 operations for CircleCI and other nodes within your subnet.
- Adequately power the NAT instance for heavy network operations.  Depending on the specifics of your deployment, it is possible for NAT instances to become constrained by highly parallel builds using Docker and external network resources.  A NAT that is inadequate could cause slowness in network and cache operations.
- If you are integrating with [github.com](https://github.com), ensure that your network access control list (ACL) whitelists ports 80 and 443 for GitHub webhooks. When integrating with GitHub, either set up CircleCI in a public subnet, or set up a public load balancer to forward github.com traffic.
- See the Services section of the [Administrator's Overview]({{site.baseurl}}/2.0/overview#services) for more information on the specific ports that need to be accessible to instances in your CircleCI installation.

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## Planning
Have available the following information and policies before starting the Preview Release installation:

* If you use network proxies, contact your Account team before attempting to install CircleCI 2.0.
* Plan to provision at least two AWS instances, one for the Services and one for your first set of Nomad Clients. Best practice is to use an `m4.2xlarge` instance with 8 vCPUs and 32GB RAM for the Services as well as Nomad Clients instances.
* AWS instances must have outbound access to pull Docker containers and to verify your license.
* In order to provision required AWS entities with Terraform you need an IAM User with following permissions:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::circleci-*",
                "arn:aws:s3:::circleci-*/*",
                "arn:aws:s3:::*"
            ]
        },
        {
            "Action": [
                "autoscaling:*",
                "sqs:*",
                "iam:*",
                "ec2:StartInstances",
                "ec2:RunInstances",
                "ec2:TerminateInstances",
                "ec2:Describe*",
                "ec2:CreateTags",
                "ec2:AuthorizeSecurityGroupEgress",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CreateSecurityGroup",
                "ec2:DeleteSecurityGroup",
                "ec2:DescribeInstanceAttribute",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeInstances",
                "ec2:DescribeNetworkAcls",
                "ec2:DescribeSecurityGroups",
                "ec2:RevokeSecurityGroupEgress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:ModifyInstanceAttribute",
                "ec2:ModifyNetworkInterfaceAttribute",
                "cloudwatch:*",
                "autoscaling:DescribeAutoScalingGroups",
                "iam:GetUser"
            ],
            "Resource": [
                "*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

## Installation with Terraform

1. Clone the [Setup](https://github.com/circleci/enterprise-setup) repository (if you already have it cloned, make sure it is up-to-date and you are on the `master` branch: `git checkout master && git pull`).
2. Run `make init` to init `terraform.tfvars` file (your previous `terraform.tfvars` if any, will be backed up in the same directory).
3. Fill `terraform.tfvars` with appropriate AWS values for section 1. 
4. Specify a `circle_secret_passphrase` in section 2, replacing `...` with alpha numeric characters. Passphrase cannot be empty.
5. Specify the instance type for your Nomad Clients. By default, the value specified in the `terraform.tfvars` file for Nomad Clients is `m4.2xlarge` (8 vCPUs, 32GB RAM). To increase the number of concurrent CircleCI jobs that each Nomad Client can run, modify section 2 of the `terraform.tfvars` file to specify a larger `nomad_client_instance_type`. Refer to the AWS [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types) guide for details. **Note:** The `builder_instance_type` is only used for 1.0 and is disabled by default in section 3. 
4. Run `terraform apply` to provision.
5. Go to the provided URL at the end of Terraform output and follow the instructions.
6. Enter your license.
7. Register CircleCI as a new OAuth application in GitHub.com by following the instructions in the management console GitHub integration section.
- **Note:** If you get an "Unknown error authenticating via GitHub. Try again, or contact us." message, try using `http:` instead of `https:` for the Homepage URL and callback URL.
8. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID.
9. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication.
10. Complete the `Storage` section. It is best practice to use an instance profile for authentication (no additional configuration required).
11. Configure the vm-service if you plan to use [Remote Docker]({{site.baseurl}}/2.0/building-docker-images/) or `machine` executor features (you can configure it later if necessary). Again, it is best to use an instance profile for authentication (no additional configuration required).
12. After applying settings you will be redirected to the Management Console Dashboard. It will take a few minutes to download all of the necessary Docker containers. If the Management Console reports that `Failure reported from operator: no such image` click Start again and it should continue.
13. After the application has started, log in to CircleCI and start running 2.0 builds!
14. You can use [our realitycheck repo](https://github.com/circleci/realitycheck) to check basic CircleCI functionality.

## Validating Your Installation

1. Click the Open link in the dashboard to go to the CircleCI app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage.
2. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
3. Add a project using the [Hello World]({{site.baseurl}}/2.0/hello-world/) document.

## Troubleshooting

If you're unable to run your first builds successfully please start with our [Troubleshooting]({{site.baseurl}}/2.0/troubleshooting/) guide as well as an [Introduction to Nomad Cluster Operation]({{site.baseurl}}/2.0/nomad/) document for information about how to check status of Builders.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI support](https://support.circleci.com/hc/en-us) for assistance.

### Server Ports

Following is the list of ports for machines in a CircleCI 2.16 installation:

|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Services Machine** | 80 | TCP | Inbound | End users | HTTP web app traffic |  |
|   | 443 | TCP | Inbound | End users | HTTPS web app traffic |  |
|   | 7171 | TCP | Inbound | End users | Artifacts access |  |
|   | 8081 | TCP | Inbound | End users | Artifacts access |  |
|   | 22 | TCP | Inbound | Administrators | SSH |  |
|   | 8800 | TCP | Inbound | Administrators | Admin console |  |
|   | 8125 | UDP | Inbound | Nomad Clients | Metrics |  |
|   | 8125 | UDP | Inbound | Nomad Servers | Metrics | Only if using externalised Nomad Servers |
|   | 8125 | UDP | Inbound | All Database Servers | Metrics | Only if using externalised databases |
{: class="table table-striped"}

|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Services Machine** | 4647 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 8585 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 7171 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 3001 | TCP | Bi-directional | Nomad Clients | Internal communication |  |
|   | 80 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access |  |
|   | 443 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access |  |
|   | 80 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS |
|   | 443 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS |
|   | 5432 | TCP | Outbound | PostgreSQL Servers | PostgreSQL database connection | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
{: class="table table-striped"}

|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Services Machine** | 27017 | TCP | Outbound | MongoDB Servers | MongoDB database connection | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
|   | 5672 | TCP | Outbound | RabbitMQ Servers | RabbitMQ connection | Only if using externalised RabbitMQ |
|   | 6379 | TCP | Outbound | Redis Servers | Redis connection | Only if using externalised Redis |
|   | 4647 | TCP | Outbound | Nomad Servers | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 443 | TCP | Outbound | CloudWatch Endpoints | Metrics | Only if using AWS CloudWatch |
{: class="table table-striped"}


|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Nomad Clients** | 64535-65535 | TCP | Inbound | End users | SSH into builds feature |  |
|   | 80 | TCP | Inbound | Administrators | CircleCI Admin API access |  |
|   | 443 | TCP | Inbound | Administrators | CircleCI Admin API access |  |
|   | 22 | TCP | Inbound | Administrators | SSH |  |
|   | 22 | TCP | Outbound | GitHub Enterprise / GitHub.com (whichever applies) | Download Code From Github. |  |
|   | 4647 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 8585 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 7171 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 3001 | TCP | Bi-directional | Services Machine | Internal communication |  |
|   | 443 | TCP | Outbound | Cloud Storage Provider | Artifacts storage | Only if using external artifacts storage |
|   | 53 | UDP | Outbound | Internal DNS Server | DNS resolution | This is to make sure that your jobs can resolve all DNS names that are needed for their correct operation |
{: class="table table-striped"}


|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **GitHub Enterprise / GitHub.com (whichever applies)** | 22 | TCP | Inbound | Services Machine | Git access |  |
|   | 22 | TCP | Inbound | Nomad Clients | Git access |  |
|   | 80 | TCP | Inbound | Nomad Clients | API access |  |
|   | 443 | TCP | Inbound | Nomad Clients | API access |  |
|   | 80 | TCP | Bi-directional | Services Machine | Webhooks / API access |  |
|   | 443 | TCP | Bi-directional | Services Machine | Webhooks / API access |  |
{: class="table table-striped"}


|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **PostgreSQL Servers** | 5432 | TCP | Bi-directional | PostgreSQL Servers | PostgreSQL replication | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
{: class="table table-striped"}


|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **MongoDB Servers** | 27017 | TCP | Bi-directional | MongoDB Servers | MongoDB replication | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
{: class="table table-striped"}


|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **RabbitMQ Servers** | 5672 | TCP | Inbound | Services Machine | RabbitMQ connection | Only if using externalised RabbitMQ |
|   | 5672 | TCP | Bi-directional | RabbitMQ Servers | RabbitMQ mirroring | Only if using externalised RabbitMQ |
{: class="table table-striped"}



|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Redis Servers** | 6379 | TCP | Inbound | Services Machine | Redis connection | Only if using externalised Redis |
|   | 6379 | TCP | Bi-directional | Redis Servers | Redis replication | Only if using externalised Redis and using Redis replication (optional) |
{: class="table table-striped"}



|  **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** |
|  ------ | ------ | ------ | ------ | ------ | ------ | ------ |
|  **Nomad Servers** | 4646 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 4647 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers |
|   | 4648 | TCP | Bi-directional | Nomad Servers | Nomad Servers internal communication | Only if using externalised Nomad Servers |
{: class="table table-striped"}
