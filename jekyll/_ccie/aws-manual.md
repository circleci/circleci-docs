---
layout: enterprise
section: enterprise
title: "Installing CircleCI on Amazon Web Services Manually"
category: [installation]
order: 3
description: "How to install CircleCI Enterprise manually on Amazon Web Services (AWS)."
sitemap: false
---

This document provides step-by-step instructions for installing CircleCI Enterprise on Amazon Web Services (AWS) without using separate orchestration software in the following sections:

* TOC
{:toc}

## Prerequisites

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI Enterprise support](https://support.circleci.com/hc/en-us) for a license.
* AWS Access Key, AWS Secret Key, and AWS Subnet ID
* AWS Region, for example `us-west-2`
* AWS Virtual Private Cloud (VPC) ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Servies documentation for additional details.
	
## Private Subnet Requirements	

The following additional settings are required to support using private subnets on AWS with CircleCI:

- The private subnet for builder boxes must be a network address translation (NAT) instance or an internet gateway configured for the outbound traffic to the internet.
- The [VPC Endpoint for S3](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/) should be enabled. Enabling the VPC endpoint for S3 should significantly improve S3 operations for CircleCI and other nodes within your subnet.
- Adequately power the NAT instance for heavy network operations.  Depending on the specifics of your deployment, it is possible for NAT instances to become constrained by highly parallel builds using Docker and external network resources.  A NAT that is inadequate could cause slowness in network and cache operations.
  - If you are integrating with https://github.com/, ensure that your network access control list (ACL) whitelists github.com webhooks.  When integrating with GitHub, either set up CircleCI in a public subnet, or set up a public load balancer to forward github.com traffic.

## Steps for Installation

This procedure uses the `awscli` to enable CircleCI-installed AWS instances access to S3 for storage and access to the EC2 API for the CircleCI Builder component status updates. After setting up this access, the procedure uses the `init-builder-0.2.sh` script to launch the CircleCI Services component and Builders cluster. 

1. Create a `.json` file that describes access for the AWS Identity and Access Management (IAM) user or role that will be installed with CircleCI using the following IAM policy as an example, also available at https://enterprise-docs.circleci.com/assets/aws/circleci-iam-policy.json:

     ```
     {
        "Version": "2012-10-17",
        "Statement" : [
           {
              "Action" : ["s3:*"],
              "Effect" : "Allow",
              "Resource" : [
                 "arn:aws:s3:::circleci-*",
                 "arn:aws:s3:::circleci-*/*"
              ]
           },
           {
               "Action": [
                   "ec2:Describe*",
                   "ec2:CreateTags",
                   "cloudwatch:*",
                   "iam:GetUser"
               ],
               "Resource": ["*"],
               "Effect": "Allow"
           }
        ]
     }
     ```

2. Use the following commands in the `awscli` to create a user with the example policy or replacing it with the link to the `.json` file you created in Step 1. Alternatively, it is possible to use an IAM role and instance profile with the same permissions.

     ```
     $ aws iam create-user --user-name circleci-user
     $ curl -sSL -o circleci-iam-policy.json https://enterprise-docs.circleci.com/assets/aws/circleci-iam-policy.json
     $ cat circleci-iam-policy.json # please inspect the policy and validate the permissions it's using
     $ aws iam create-policy --policy-name circleci-iam-policy \
         --policy-document file://circleci-iam-policy.json \
         --description "Policy to be used by CircleCI Enterprise machines"
     [..You will get a large output with containing an Arn line... e.g..]
             "Arn": "arn:aws:iam::323423423452:policy/circleci-iam-policy",

     $ aws iam attach-user-policy --user-name circleci-user --policy-arn <<policy-arn-from-last-output>>
     $ aws iam create-access-key --user-name circleci-user
     [.. Save the generated access key and secret for use in installation process..]
     ```

3. To install the Services component, using a `c4.2xlarge` or `c4.4xlarge` instance with an EBS root volume of 100 GB, start one of the following public CircleCI Amazon Machine Images (community AMIs) for the appropriate AWS region:

     Region             | AMI
     -----------------  |-------------
     ap-northeast-1     | ami-32e6d455
     ap-northeast-2     | ami-2cef3242
     ap-southeast-1     | ami-7f22a71c
     ap-southeast-2     | ami-21111b42
     eu-central-1       | ami-7a2ef015
     eu-west-1          | ami-ac1a14ca
     sa-east-1          | ami-70026d1c
     us-east-1          | ami-cb6f1add
     us-east-2          | ami-57c7e032
     us-west-1          | ami-4fc8ee2f
     us-west-2          | ami-c24a2fa2
     {: class="table table-striped"}


4. Place the services box in a security group with the following attributes:

- Whitelist ports 22, 80, 443, 8800 (used for system administration) to potential users
- Whitelist all traffic for the Builder cluster

5. To install the Builders cluster, using an `r3.8xlarge` or `r3.4xlarge`, start one of the following public CircleCI AMIs for each Builder (the number you start depends on the number of concurrent runs you want) in the appropriate AWS region. {#builder} **Note:**  CircleCI allocates 4GB per build container by default, consider using spot instances as Builder components.

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

7. To start the installation, SSH into the box as the `ubuntu` user with the `ssh key` you set for the instance, and run the following `curl` command:

     ```
     curl https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh | \
       SERVICES_PRIVATE_IP=<private ip address of services box> \
       CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
       bash
     ```

**Note:** The `sudo -H -u ubuntu` is not strictly necessary when logged in as the `ubuntu`
user, but it allows this snippet to be used as-is in a user data script, which
is run as `root`. It should take 5-15 minutes for the machine to be fully ready to take builds.

## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI Enterprise app. The Starting page for a few minutes to as the CircleCI application is booting up, then automatically redirects to the homepage.
1. Sign up or sign in by clicking the Get Started button and then add a project using the [Setting Up Projects]({{site.baseurl}}/enterprise/quick-start/).

## Troubleshooting

Check the Fleet State by clicking the wrench icon on the sidebar navigation of CircleCI and select Fleet State.
- If no instances appear in the list, then the first builder is still starting. The first build may remain queued while the build containers start.
- If there is a builder instance in the list but its state is "starting-up", then it is still downloading the build container image and starting its first build containers.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI Enterprise support](https://support.circleci.com/hc/en-us) for assistance.

