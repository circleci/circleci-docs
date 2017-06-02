---
layout: enterprise
section: enterprise
title: "Automated AWS Install"
category: [installation]
order: 2
description: "How to install CircleCI Enterprise on Amazon Web Services (AWS)."
---

The following step-by-step instructions will guide you through the process of installing CircleCI Enterprise on AWS. If you have any questions as you go through these steps, please contact <enterprise-support@circleci.com>.

## Prerequisites

* AWS Access Key
* AWS Secret Key
* AWS Region (e.g. "us-west-2")
* AWS VPC ID
	* Ensure that your VPC has the setting [enableDNSSupport](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating)
	set to true
	* Instructions if you have a [Private Subnet]({{site.baseurl}}/enterprise/aws-private-subnet/)
* AWS Subnet ID
* CircleCI License file (.rli)

## Setup Terraform

(If you prefer to do this process manually or with different tools please see the [Manual Aws Instructions]({{site.baseurl}}/enterprise/aws-manual/).)

1. Download the setup repo: `git clone https://github.com/circleci/enterprise-setup ccie && cd ccie`
1. Open `terraform.tfvars` in your favorite text editor and input the
prerequities stated above in the required fields.
1. Launch the Terraform stack:
	- **Linux/Windows:** Please install [Terraform](https://www.terraform.io/downloads.html) yourself on Linux/Windows, then run `terraform apply` from the repo root.
	- **OSX:** You can just run `bin/terraform apply` and follow the prompts.

## Configure CircleCI Enterprise

1. Go To the URL output from Terraform
1. Click "Get Started"
1.  Trust the temporary SSL cert
1. Use a self-signed certificate ( or if you already have one feel free to use it here )
1. Upload your license
1. Secure the console with a password
1. Fill out the settings form
1. Save and start the app (all other default settings are fine for now). You will be redirected to the System Console Dashboard,
where you should soon see an indication that the app has started like below.

<img src="{{site.baseurl}}/assets/img/docs/started.png" alt="Look For 'Open'" width="150" style="margin: 10px; margin-left: 200px">

## Try it out!

1. Click the "Open" link in the dashboard to go to the CircleCI Enterprise app. You may see a "Starting" page for a few minutes to indicate that the CircleCI
          application is booting up, but you will soon be automatically redirected to the homepage for your CircleCI Enterprise installation.
1. Sign up and [follow a project]({{site.baseurl}}/enterprise/quick-start/)
1. The first build may remain queued while the build containers start.
  You can check the "Fleet State" by clicking on the wrench icon on the sidebar and selecting "Fleet State".
  If no instances appear in the list, then the first builder is still starting.
  If there is a builder instance in the list but its state is "starting-up",
  then it is still downloading the build container image and starting its first build containers.
  Once this is all done, the first build should begin immediately.
  If there are no updates after about 15 minutes (remember to click the "refresh" button occasionally), please contact [CircleCI Enterprise support](mailto:enterprise-support@circleci.com).


## Using custom instance types

The Terraform-based CircleCI installation currently only supports instance types with attached SSD storage. EBS-only volumes (**C4** / **M4**) will not work. The number of containers per machine below assume the defualt container size of 2CPU/4G. If you want to change those defaults, please see below.

* **M3**: The `m3.2xlarge` is a good choice if you only need a couple containers, as it is usually cheaper than comprable `c3` or `r3` instances. But the `m3.2xlarge` can only fit **3 containers**, and there are no larger `m3` instances. If you plan to use a larger fleet, we recommend `c3` instances.
* **C3**: The `c3` family is a less expensive choice for larger fleets. Since the `c3` instances have less memory than the `r3` instances, the number of containers we can fit on a machine is memory bound. The `c3.4xlarge` can fit **6 containers**, and the `c3.8xlarge` can fit **14 containers**.
* **R3 (recommended)**: The `r3` family is a great choice if you're using memory intensive builds. They are especially good if you plan to increase the default memory allocation for each container. Because of noisy neighbor problems and resource contention, the excess memory of the `r3` family can can also sometimes speed up your builds without changing the default container allocation. The number of containers we can fit on an `r3` is CPU bound. Thus, we will put **3 containers** on an `r3.2slarge`, **7 containers** on an `r3.4xlarge`, and **15 containers** on an `r3.8xlarge`.
