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

If you have CircleCI Enterprise installed you may access CircleCI 2.0 features on your current installation with no restrictions under your current agreement and support level. Contact your [CircleCI account representative](mailto:cs@circleci.com) for assistance with upgrading.

**Notes:**
- CircleCI 2.0 is only available on AWS.
- Teams may create a new CircleCI 2.0 `.circleci/config.yml` file in their repositories to add new 2.0 projects incrementally while continuing to build 1.0 projects which use a `circle.yml` configuration file.

## Prerequisites

Install the following automated infrastructure provisioning software:

* Terraform, see the [Download Terraform](https://www.terraform.io/downloads.html) web site for links to packages for your architecture.

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

## Planning
Have available the following information and policies before starting the Preview Release installation:

* If you use network proxies, contact your Account team before attempting to install CircleCI 2.0.
* Access to provision at least two AWS instances, one for the Services and one for your first set of Builders. Best practice is to use an `m4.2xlarge` instance with 8 CPUs and 32GB RAM for the Services.
* AWS instances must have outbound access to pull docker containers and to verify your license.
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

Use the following procedure to install with Terraform, skip to the next section for manual installation steps.

1. Clone the [Setup](https://github.com/circleci/enterprise-setup) repository (if you already have it cloned, make sure it is up-to-date and you are on the `master` branch: `git checkout master && get pull`).
3. Run `make init` to init `terraform.tfvars` file (your previous `terraform.tfvars` if any, will be backed up in the same directory).
3. Fill `terraform.tfvars` with appropriate values.
4. Run `terraform apply` to provision.
4. Go to the provided URL at the end of Terraform output and follow the instructions.
5. Enter your license.
6. Complete the `Storage` section. It is best practice to use an instance profile for authentication (no additional configuration required). However, IAM authentication for the AWS administrator is supported. In this case use the following permissions for the IAM User:
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
7. Configure the vm-service if you plan to use [Remote Docker]({{site.baseurl}}/2.0/building-docker-images/) or `machine` executor features (you can configure it later if necessary). It is best practice to use an instance profile for authentication (no additional configuration required). However, IAM authentication for the AWS administrator is supported. In this case use the following permissions for the IAM User. It might be the same user as in Storage section, if so, it needs to have both sets of permissions.
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
                     "ec2:TerminateInstances",
                     "ec2:StartInstances",
                     "ec2:StopInstances"
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
8. After applying settings you are be redirected to the Management Console Dashboard. It will take a few minutes to download all of the necesary docker containers. If the Management Console reports that `Failure reported from operator: no such image` click Start again and it should continue.
9. After the application has started, log in to CircleCI and start running 2.0 builds!

## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage.
1. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
1. Add a project using the [Hello World]({{site.baseurl}}/2.0/hello-world/) document.

## Troubleshooting

Refer to the [Introduction to Nomad Cluster Operation]({{site.baseurl}}/2.0/nomad/) document for information about how to check status of Builders.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI support](mailto:enterprise-support@circleci.com) for assistance.



