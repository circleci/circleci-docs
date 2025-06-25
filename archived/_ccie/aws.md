---
layout: enterprise
section: enterprise
title: "Installing CircleCI on Amazon Web Services with Terraform"
category: [installation]
order: 2
description: "How to install CircleCI Enterprise on Amazon Web Services (AWS)."
sitemap: false
---

This document provides step-by-step instructions for installing CircleCI Enterprise on Amazon Web Services (AWS) with Terraform in the following sections:

* TOC
{:toc}

**Note:** This installation only supports AWS instance types with attached SSD storage (M3, C3, or R3). EBS-only volumes (C4 or M4) will not work with an installation managed by Terraform. 

## Prerequisites

Install the following automated infrastructure provisioning software:

* Terraform, see the [Download Terraform](https://www.terraform.io/downloads.html) web site for links to packages for your architecture. To install CircleCI without using Terraform, refer to the [Manual AWS Installation]({{site.baseurl}}/enterprise/aws-manual/).

Have the following information available before beginning the installation procedure:

* CircleCI License file (.rli), contact [CircleCI Enterprise support](https://support.circleci.com/hc/en-us) for a license.
* AWS Access Key, AWS Secret Key, and AWS Subnet ID.
* AWS Region, for example `us-west-2`.
* AWS Virtual Private Cloud (VPC) ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
* Set your VPC [`enableDnsSupport`] setting to `true` to ensure that queries to the Amazon provided DNS server at the 169.254.169.253 IP address, or the reserved IP address at the base of the VPC IPv4 network range plus two will succeed. See the [Using DNS with Your VPC](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating) Amazon Web Servies documentation for additional details.
	
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

## Steps for Installation

This procedure uses Terraform to automate infrastructure provisioning and management of the CircleCI Services and Builders.

1. Download the set up repository: `git clone https://github.com/circleci/enterprise-setup ccie && cd ccie`
1. Open `terraform.tfvars` in your favorite text editor and input the
prerequisites stated above in the required fields.
1. Launch the Terraform stack:
	- **Linux or Windows:** Run the `terraform apply` command from the repo root.
	- **OSX:** Run the `bin/terraform apply` command and follow the prompts.
	- *Note: you may need to run `terraform init` first to install the Terraform plugin for AWS.*
1. Go to the URL output from Terraform and click Get Started.
1. Trust the temporary SSL cert.
1. Use a new or exisiting self-signed certificate. By default, all machines in a CircleCI Enterprise installation verify SSL certificates for the GitHub Enterprise instance. If you're using a self-signed cert,
or using a custom CA root, select the "HTTPS (with self-signed certificate)" option in the System Console at port 8800.
You also need to export `CIRCLE_IGNORE_CERT_HOST=insecure-ghe.example.com` on builder machines replacing `insecure-ghe.example.com` with the host of your GitHub Enterprise instance. See [this doc]({{site.baseurl}}/enterprise/docker-builder-config/) for details on setting builder machine environment variables.
1. Upload your CircleCI license.
1. Secure the console with a password.
1. Register CircleCI as a new OAuth application in GitHub at <https://github.com/settings/applications/new> using the IP address of the AWS instance for the Homepage URL and using `http(s)://AWS instance IP address/auth/github` as the Authorization callback URL. Click the Register Application button.
1. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID.
1. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication.
1. Agree to the license agreement. 
1. Save and start the CircleCI application. The System Console Dashboard appears with an indication that the app has started as shown in the following image.

<img src="{{site.baseurl}}/assets/img/docs/started.png" alt="Look For 'Open'" width="150" style="margin: 10px; margin-left: 200px">

## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI Enterprise app. The Starting page appears for a few minutes as the CircleCI application is booting up, then automatically redirects to the homepage. 
1. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
1. Add a project using the [Setting Up Projects]({{site.baseurl}}/enterprise/quick-start/) document.

## Troubleshooting

Check the Fleet State by clicking the wrench icon on the sidebar navigation of CircleCI and select Fleet State.
- If no instances appear in the list, then the first builder is still starting. The first build may remain queued while the build containers start.
- If there is a builder instance in the list but its state is starting-up, then it is still downloading the build container image and starting its first build containers.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI Enterprise support](https://support.circleci.com/hc/en-us) for assistance.



