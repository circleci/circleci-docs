---
layout: classic-docs
title: "Installing CircleCI 2.0 on Amazon Web Services Manually"
category: [administration]
order: 11
hide: true
published: false
description: "How to install CircleCI on Amazon Web Services (AWS) manually."
---

This document provides step-by-step instructions for installing CircleCI 2.0 on Amazon Web Services (AWS) manually in the following sections:

* TOC
{:toc}

If you have CircleCI Enterprise installed you may access CircleCI 2.0 features on your current installation with no restrictions under your current agreement and support level. Contact your CircleCI account representative for assistance with upgrading.

* CircleCI 2.0 is only available on AWS.
* Teams may create a new CircleCI 2.0 `.circleci/config.yml` file in their repositories to add new 2.0 projects incrementally while continuing to build 1.0 projects which use a `circle.yml` configuration file.

## Prerequisites

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI support](https://support.circleci.com/hc/en-us) for a license.
* AWS Access Key, AWS Secret Key, and AWS Subnet ID.
* AWS Region, for example `us-west-2`.
* AWS Virtual Private Cloud (VPC) ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Services documentation for additional details.

## Private Subnet Requirements

The following additional settings are required to support using private subnets on AWS with CircleCI:

- The private subnet for builder boxes must be a network address translation (NAT) instance or an internet gateway configured for the outbound traffic to the internet.
- The [VPC Endpoint for S3](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/) should be enabled. Enabling the VPC endpoint for S3 should significantly improve S3 operations for CircleCI and other nodes within your subnet.
- Adequately power the NAT instance for heavy network operations.  Depending on the specifics of your deployment, it is possible for NAT instances to become constrained by highly parallel builds using Docker and external network resources.  A NAT that is inadequate could cause slowness in network and cache operations.
- If you are integrating with https://github.com/, ensure that your network access control list (ACL) allows github.com webhooks.  When integrating with GitHub, either set up CircleCI in a public subnet, or set up a public load balancer to forward github.com traffic.

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
* See the table below for required port configuration.

### Manual Installation Steps

1. SSH into the Services instance.
2. Run `curl https://get.replicated.com/docker | sudo bash`.
3. Go to the provided URL at the end of the previous step.
4. Use a 2.0 license.
5. Configure storage. It is best practice to use an instance profile for authentication. However, IAM authentication for the AWS administrator is supported. Use the following permissions for the IAM User:
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

8. To install the 2.0 Builders cluster, using an `m4.xlarge` or `m4.4xlarge`, start one of the following public CircleCI AMIs for each Builder (the number you start depends on the number of concurrent runs you want) in the appropriate AWS region. {#builder} **Note:**  CircleCI allocates 4GB per build container by default, consider using spot instances as Builder components.

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


9. Place the Builder instaces in a security group with the following attributes:

- Allow all traffic from/to builder boxes and service box
- Allow ports 22, 80, 443, 64535-65535 for users.  The high ports are used for the SSH feature, so that users can `ssh` into the build containers.

10. To start the installation, use the following [Terraform script](https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf). It should take 5-15 minutes for the machine to be fully ready to take builds.


## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage.
1. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
1. Add a project using the [Hello World]({{site.baseurl}}/2.0/hello-world/) document.

## Troubleshooting

Check the Fleet State by clicking the wrench icon on the sidebar navigation of CircleCI and select Fleet State.
- If no instances appear in the list, then the first builder is still starting. The first build may remain queued while the build containers start.
- If there is a builder instance in the list but its state is starting-up, then it is still downloading the build container image and starting its first build containers.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI support](https://support.circleci.com/hc/en-us) for assistance.
