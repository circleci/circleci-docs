---
layout: classic-docs
title: "Installing CircleCI 2.0 on Amazon Web Services with Terraform"
category: [administration]
order: 10
description: "How to install CircleCI on Amazon Web Services (AWS)."
---

This document provides step-by-step instructions for installing CircleCI 2.0 on Amazon Web Services (AWS) with Terraform in the following sections:

* TOC
{:toc}

**Note:** This installation only supports AWS instance types with attached SSD storage (M3, C3, or R3). EBS-only volumes (C4 or M4) will not work with an installation managed by Terraform. 

## Prerequisites

Install the following automated infrastructure provisioning software:

* Terraform, see the [Download Terraform](https://www.terraform.io/downloads.html) web site for links to packages for your architecture. To install CircleCI without using Terraform, refer to the [Manual AWS Installation]({{site.baseurl}}/enterprise/aws-manual/).

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI support](mailto:enterprise-support@circleci.com) for a license.
* AWS Access Key, AWS Secret Key, and AWS Subnet ID.
* AWS Region, for example `us-west-2`.
* AWS Virtual Private Cloud (VPC) ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Services documentation for additional details.
	
## Private Subnet Requirements	

The following additional settings are required to support using private subnets on AWS with CircleCI:

- The private subnet for builder boxes must be a network address translation (NAT) instance or an internet gateway configured for the outbound traffic to the internet.
- The [VPC Endpoint for S3](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/) should be enabled. Enabling the VPC endpoint for S3 should significantly improve S3 operations for CircleCI and other nodes within your subnet.
- Adequately power the NAT instance for heavy network operations.  Depending on the specifics of your deployment, it is possible for NAT instances to become constrained by highly parallel builds using Docker and external network resources.  A NAT that is inadequate could cause slowness in network and cache operations.
- If you are integrating with https://github.com/, ensure that your network access control list (ACL) whitelists github.com webhooks.  When integrating with GitHub, either set up CircleCI in a public subnet, or set up a public load balancer to forward github.com traffic.

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## Sizing AWS Instances

The following table describes the number of containers or concurrent builds supported by the M3, C3, and R3 machines using the the default CircleCI container size of 2CPU/4GB RAM and 2CPU overhead. 

Type | Supported Containers | Model | Notes
----|-----------------------|-------|------
M3 | maximum of 3 | `m3.2xlarge` | Largest M3 instance
C3 | maximum of 6 | `c3.4xlarge` | Limited memory allocation
C3 | maximum of 14 | `c3.8xlarge` | Limited memory allocation
R3 | maximum of 3 | `r3.2slarge` | High memory, limited CPU
R3 | maximum of 7 | `r3.4xlarge` | High memory, limited CPU
R3 | maximum of 15 | `r3.8xlarge` | High memory, limited CPU
{: class="table table-striped"}

The R3 instances are a good choice for memory-intensive builds or if you plan to increase the default memory allocation for each container. If you have noisy neighbor problems or contention for resources, it is possible that the additional memory of the R3 family may speed up your builds without changing the default container allocation.

## Constraints

* CircleCI 2.0 is only available on AWS.
* Requires teams to build a new CircleCI 2.0 `.circleci/config.yml` file in their repositories. 
* HTTP only for internal communications between workers and the output processor (HTTPS is coming soon). Must be run on a trusted network.
* Only IAM User Authentication is currently supported (instance profiles are coming soon).

If you have CircleCI Enterprise installed you are able to get access to CircleCI 2.0 features on your current installation with no restrictions under your current agreement and support level.

## Planning
Have available the following information and policies before starting the Preview Release installation:

* If you use network proxies, contact your Account team before attempting to install CircleCI 2.0.
* Access to provision at least two AWS instances, one for the Services and one for your first set of Builders. Best practice is to use an `m4.2xlarge` instance with 8 CPUs and 32GB RAM for the Services.
* AWS instances must have outbound access to pull docker containers and to verify your license.
* See the table below for required port configuration.
* Put in place the following AWS IAM policy required by the CircleCI terraform file and communicate any concerns with this policy to your Account team for assistance or clarifications:
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

Use the following procedure to install with Terraform, skip to the next section for manual installation steps.

1. Clone the [Enterprise Setup](https://github.com/circleci/enterprise-setup) repository.
2. Checkout the `ccie2` branch with `git fetch && git checkout ccie2`.
3. Run `make init` to copy `terraform.tfvars.template` to `terraform.tfvars`.
4. Fill out the required variables in `terraform.tfvars`, you can view the [README](https://github.com/circleci/enterprise-setup/blob/ccie2/README.md) for the full list of variables. Be sure to set `enable_nomad=1` in order to use docker builders. 
5. Apply Terraform scripts using `terraform apply`.
6. Go to the provided URL at the end of Terraform output and follow the instructions.
7. Enter your license.
8. Complete the `Storage` section. **Only AWS S3 with IAM User Authentication is currently supported**. Use the following permissions for the IAM User:
     ```JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:TerminateInstances",
                     "ec2:Describe*",
                     "ec2:CreateTags",
                     "iam:GetUser",
                     "cloudwatch:*",
                     "sts:GetFederationToken"
                 ],
                 "Resource": [
                     "*"
                 ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:*"
                 ],
                 "Resource": [
                     "arn:aws:s3:::YOUR-BUCKET-HERE",
                     "arn:aws:s3:::YOUR-BUCKET-HERE/*"
                 ]
             }
         ]
     }
     ```
9. Configure the vm-service as follows. The AWS User needs to have the following permissions. It might be the same user as for S3, if so, it needs to have both sets of permissions. The region/subnet/security group will be filled automatically.
     ``` JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:CreateTags"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*"
             },
             {
                 "Action": [
                     "ec2:Describe*"
                 ],
                 "Effect": "Allow",
                 "Resource": "*"
             },
             {
                 "Action": [
                     "ec2:TerminateInstances"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*:instance/*",
                 "Condition": {
                     "StringEquals": {
                         "ec2:ResourceTag/ManagedBy": "circleci-vm-service"
                     }
                 }
             }
         ]
     }
     ```
10. From the Management Console, click Start to start the application. It will take a few minutes to download all of the necesary docker containers. If the Management Console reports that `Failure reported from operator: no such image` click Start again and it should continue. 
11. After the application has started, log in to CircleCI and start running 2.0 builds!

## Manual Installation

Have available the following resources before beginning manual installation of CircleCI 2.0.

* The Services instance must meet the following requirements:
    * Type: At least `m4.xlarge` or `m4.2xlarge`
    * Storage: 100 GB, General Purpose SSD
    * Security groups:

  | Protocol | Port Range | Source  |
  | -------- | ---------- | ------- |
  | TCP      | 22         | 0.0.0.0 |
  | TCP      | 80         | 0.0.0.0 |
  | TCP      | 443        | 0.0.0.0 |
  | TCP      | 8800       | 0.0.0.0 |
  | TCP      | 8585       | vpc     |
  | TCP      | 4647       | vpc     |
  {: class="table table-striped"}
* 1.0 Builders - No changes, the same process as for the CCIE 1.0 <https://circleci.com/docs/enterprise/aws-manual/>
* 2.0 Builders - Instance type should be at least `m4.xlarge` or `m4.4xlarge` installated with the following Terraform script: <https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf>.
 
### Manual Installation Steps

1. SSH into the Services instance.
2. Run `curl https://get.replicated.com/docker | sudo bash`.
3. Go to the provided URL at the end of the previous step.
4. Use a 2.0 license.
5. Configure storage. **Only AWS S3 with IAM User Authentication is currently supported**. Use the following permissions for the IAM User:
     ```JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:TerminateInstances",
                     "ec2:Describe*",
                     "ec2:CreateTags",
                     "iam:GetUser",
                     "cloudwatch:*",
                     "sts:GetFederationToken"
                 ],
                 "Resource": [
                     "*"
                 ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:*"
                 ],
                 "Resource": [
                     "arn:aws:s3:::YOUR-BUCKET-HERE",
                     "arn:aws:s3:::YOUR-BUCKET-HERE/*"
                 ]
             }
         ]
     }
     ```
6. Configure the vm-service. The AWS user needs to have these permissions. It might be the same user as for S3, if so, it needs to have both sets of permissions.
     ``` JSON
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Action": [
                     "ec2:RunInstances",
                     "ec2:CreateTags"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*"
             },
             {
                 "Action": [
                     "ec2:Describe*"
                 ],
                 "Effect": "Allow",
                 "Resource": "*"
             },
             {
                 "Action": [
                     "ec2:TerminateInstances"
                 ],
                 "Effect": "Allow",
                 "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*:instance/*",
                 "Condition": {
                     "StringEquals": {
                         "ec2:ResourceTag/ManagedBy": "circleci-vm-service"
                     }
                 }
             }
         ]
     }
     ```
7. Configure the EC2 security group to have the following rules:

     | Protocol | Port Range | Source  |
     | -------- | ---------- | ------- |
     | TCP      | 22         | 0.0.0.0 |
     | TCP      | 2376       | 0.0.0.0 |
     | TCP      | 32768-61000| 0.0.0.0 |
     {: class="table table-striped"}

5. To install the 2.0 Builders cluster, using an `m4.xlarge` or `m4.4xlarge`, start one of the following public CircleCI AMIs for each Builder (the number you start depends on the number of concurrent runs you want) in the appropriate AWS region. {#builder} **Note:**  CircleCI allocates 4GB per build container by default, consider using spot instances as Builder components.

     Region             | AMI
     -----------------  |-------------
     ap-northeast-1     | ami-eeffcd89
     ap-northeast-2     | ami-8eec31e0
     ap-southeast-1     | ami-5823a63b
     ap-southeast-2     | ami-7c12181f
     eu-central-1       | ami-0f32ec60
     eu-west-1          | ami-821a14e4
     sa-east-1          | ami-3a026d56
     us-east-1          | ami-7d71046b
     us-east-2          | ami-eec5e28b
     us-west-1          | ami-45c8ee25
     us-west-2          | ami-18492c78
     {: class="table table-striped"}


6. Place the Builder instaces in a security group with the following attributes:

- Whitelist all traffic from/to builder boxes and service box
- Whitelist ports 22, 80, 443, 64535-65535 for users.  The high ports are used for the SSH feature, so that users can `ssh` into the build containers.

7. To start the installation, use the following [Terraform script](https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf). It should take 5-15 minutes for the machine to be fully ready to take builds.

## Upgrading MongoDB

CircleCI 2.0 runs MongoDB 3.2.11 which uses WiredTiger as the storage engine. If you are upgrading an existing database from your existing 1.0 installation or any Preview version from `Preview3` or older, you must use the following steps to upgrade your Mongo database:

1. Stop CircleCI from the Replicated console. 
2. SSH into the Services instance.
3. Download and execute the Mongo upgrade script.
     ```
     wget https://s3.amazonaws.com/release-team/scripts/upgrade-mongo
     chmod +x upgrade-mongo
     ./upgrade-mongo
     ```

## Upgrading PostgreSQL

CircleCI 2.0 runs PostgreSQL 9.5. If you are upgrading an existing database from your 1.0 installation or any Preview from `Preview 7` or older, you must use the following steps to upgrade your PostgreSQL database: 

1. Stop CircleCI from the Replicated Console. 
2. SSH into the Services Instance. 
3. Download and execute the PostgreSQL upgrade script. 
    ```
    wget https://s3.amazonaws.com/release-team/scripts/upgrade-postgres
    chmod +x upgrade-postgres
    ./upgrade-postgres
    ```

You can now start CircleCI from the replicated console and you will be running Mongo 3.2.11 and Postgres 9.5. 

## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage. 
1. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
1. Add a project using the [Setting Up Projects]({{site.baseurl}}/enterprise/quick-start/) document.

## Troubleshooting

Check the Fleet State by clicking the wrench icon on the sidebar navigation of CircleCI and select Fleet State.
- If no instances appear in the list, then the first builder is still starting. The first build may remain queued while the build containers start.
- If there is a builder instance in the list but its state is starting-up, then it is still downloading the build container image and starting its first build containers.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI support](mailto:enterprise-support@circleci.com) for assistance.



