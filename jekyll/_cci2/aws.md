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

If you have CircleCI Enterprise installed you may access CircleCI 2.0 features on your current installation with no restrictions under your current agreement and support level. Contact your [CircleCI account representative](https://support.circleci.com/hc/en-us/requests/new) for assistance with upgrading.

**Notes:**
- CircleCI 2.0 is only available on AWS.
- Teams may create a new CircleCI 2.0 `.circleci/config.yml` file in their repositories to add new 2.0 projects incrementally while continuing to build 1.0 projects which use a `circle.yml` configuration file.

## Prerequisites

Install the following automated infrastructure provisioning software:

* Terraform, see the [Download Terraform](https://www.terraform.io/downloads.html) web site for links to packages for your architecture.

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI support](https://support.circleci.com/hc/en-us/requests/new) for a license.
* AWS Access Key, AWS Secret Key.
* Name of [AWS EC2 SSH key](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html).
* AWS Region, for example `us-west-2`.
* AWS Virtual Private Cloud (VPC) ID and AWS Subnet ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Services documentation for additional details.

## Private Subnet Requirements

The following additional settings are required to support using private subnets on AWS with CircleCI:

- The private subnet for builder boxes must be configured with a [NAT gateway](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-nat-gateway.html) or an [internet gateway](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Internet_Gateway.html) configured for the outbound traffic to the internet via attached route tables.
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
7. Register CircleCI as a new OAuth application in GitHub.com at [https://github.com/settings/applications/new/](https://github.com/settings/applications/new/) or in the GitHub Enterprise Settings using the IP address of the AWS instance from Step 6 for the Homepage URL and using `http(s)://AWS instance IP address/auth/github` as the Authorization callback URL. Click the Register Application button.
- **Note:** If you get an "Unknown error authenticating via GitHub. Try again, or contact us." message, try using `http:` instead of `https:` for the Homepage URL and callback URL.
8. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID.
9. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication.
10. Complete the `Storage` section. It is best practice to use an instance profile for authentication (no additional configuration required).
11. Configure the vm-service if you plan to use [Remote Docker]({{site.baseurl}}/2.0/building-docker-images/) or `machine` executor features (you can configure it later if necessary). Again, it is best to use an instance profile for authentication (no additional configuration required).
12. After applying settings you will be redirected to the Management Console Dashboard. It will take a few minutes to download all of the necessary Docker containers. If the Management Console reports that `Failure reported from operator: no such image` click Start again and it should continue.
13. After the application has started, log in to CircleCI and start running 2.0 builds!
14. You can use [our realitycheck repo](https://github.com/circleci/realitycheck) to check basic CircleCI functionality.

## Validating your Installation

1. Click the Open link in the dashboard to go to the CircleCI app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage.
2. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
3. Add a project using the [Hello World]({{site.baseurl}}/2.0/hello-world/) document.

## Troubleshooting

If you're unable to run your first builds successfully please start with our [Troubleshooting]({{site.baseurl}}/2.0/troubleshooting/) guide as well as an [Introduction to Nomad Cluster Operation]({{site.baseurl}}/2.0/nomad/) document for information about how to check status of Builders.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI support](https://support.circleci.com/hc/en-us) for assistance.
