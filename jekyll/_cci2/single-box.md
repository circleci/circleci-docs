---
layout: classic-docs
title: "CircleCI Trial Installation"
category: [administration]
order: 3
description: "How to install CircleCI on a single VM"
---

CircleCI is a scalable CI/CD platform that supports clusters of tens or hundreds of build machines. This document provides instructions for installing and running the CircleCI platform on a single virtual machine. This is intended as a simple mechanism for getting started with a small trial in any environment:

* TOC
{:toc}

## Prerequisites

The following requirements must be met for a successful trial installation:

- [Sign-up](https://circleci.com/enterprise-trial-install/) to receive a CircleCI trial license file.
- You will need an [AWS account](https://portal.aws.amazon.com/billing/signup?nc2=h_ct&src=header_signup&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start).
- Use **GitHub.com or GitHub Enterprise** for version control.
- Machines running CircleCI and GitHub must be able to reach each other on the network.
- CircleCI machines must have outbound internet access. If you use a proxy server, [contact us](https://support.circleci.com/hc/en-us/requests/new) for instructions.

## Steps for Installation on AWS EC2

The steps in this section walk you through installing CircleCI on a single EC2 VM using a pre-made Amazon Machine Image (AMI). An AMI is a special type of virtual appliance used to create a virtual machine within the Amazon Elastic Compute Cloud ("EC2").

**Note:** All builds that run on the installed machine will have access to the AWS Identity and Access Management (IAM) privileges associated with its instance profile. Do **not** give any inappropriate privileges to your instance. It is possible to block this access with `iptables` rules in a production setup, [contact support](https://support.circleci.com/hc/en-us) for specific instructions.

### Configure the Amazon Machine Image:

<script>
  var amiIds = {
  "ap-northeast-1": "ami-32e6d455",
  "ap-northeast-2": "ami-2cef3242",
  "ap-southeast-1": "ami-7f22a71c",
  "ap-southeast-2": "ami-21111b42",
  "eu-central-1": "ami-7a2ef015",
  "eu-west-1": "ami-ac1a14ca",
  "sa-east-1": "ami-70026d1c",
  "us-east-1": "ami-cb6f1add",
  "us-east-2": "ami-57c7e032",
  "us-west-1": "ami-059b818564104e5c6",
  "us-west-2": "ami-c24a2fa2"
  };

  var amiUpdateSelect = function() {
    var s = document.getElementById("ami-select");
    var region = s.options[s.selectedIndex].value;
    document.getElementById("ami-go").href = "https://console.aws.amazon.com/ec2/v2/home?region=" + region + "#LaunchInstanceWizard:ami=" + amiIds[region];
  };
  </script>

  <select id="ami-select" onchange="amiUpdateSelect()">
  <option value="ap-northeast-1">ap-northeast-1</option>
  <option value="ap-northeast-2">ap-northeast-2</option>
  <option value="ap-southeast-1">ap-southeast-1</option>
  <option value="ap-southeast-2">ap-southeast-2</option>
  <option value="eu-central-1">eu-central-1</option>
  <option value="eu-west-1">eu-west-1</option>
  <option value="sa-east-1">sa-east-1</option>
  <option value="us-east-1" selected="selected">us-east-1</option>
  <option value="us-east-2">us-east-2</option>
  <option value="us-west-1">us-west-1</option>
  <option value="us-west-2">us-west-2</option>
  </select>
  <a id="ami-go" href="" class="btn btn-success" data-analytics-action="{{ site.analytics.events.go_button_clicked }}" target="_blank">Go!</a>
<script>amiUpdateSelect();</script>


1. Find the Amazon Machine Image for your region from the list above, and click Go!
2. Ensure you choose an instance type with at least 32G of RAM, such as `m4.2xlarge`, from the list. Select Next: Configure Instance Details.
3. On the Configuring Instance Details page:
- Choose your network
- Enable Auto-assign Public IP
- Check the IAM role is set to None
![AWS Step 3]({{site.baseurl}}/assets/img/docs/single-box-step3.png)
- Then select Next: Add Storage.
4. By default, the instance will have 100GiB of storage, this is enough for the trial install. Select Next: Add Tags.
5. You don't need to add a tag for the purposes of this trial but feel free to do so using the Add Tag button. Select Next: Configure Security Group.
5. On the Configure Security Group page, open the following ports:
- SSH port 22
- HTTP port 80
- HTTPS port 443
- Custom TCP 8800
- (Optional) To enable developers to SSH into builds for debugging purposes, open ports 64535-65535 for Custom TCP.
![AWS Step 5]({{site.baseurl}}/assets/img/docs/single-box-step5.png)
- Then select Review and Launch to see a summary of your trial instance, then select Launch.
6. You should now be looking at the Launch Status Page. From here you can select View Instances to jump to your AWS dashboard and see the full details of your trial instance. Once the instance is up and running, go to the public or private IP address or hostname and click Get Started to complete the rest of the guided installation process for CircleCI. **Note:** your browser may warn you that the Get Started link is unsafe.
![Getting Started Page]({{site.baseurl}}/assets/img/docs/GettingStartedPage.png)

### Configure CircleCI
1. Choose an SSL certificate option and enter a hostname if relevant. This is where you can upload the licence file you were provided with when you signed up for your CircleCI account. Otherwise, by default, all machines in a CircleCI installation verify SSL certificates for the GitHub Enterprise instance.
- Note: If you are using a self-signed cert, or using a custom CA root, please see the [certificates]({{site.baseurl}}/2.0/certificates/) document for a script to add the information to the CircleCI truststore.
2. Once you have uploaded your CircleCI licence file you can decide how to secure your admin console. You have three options:
- Anonymous admin access to the console, anyone on port8800 can access. (not-recommended).
- Set a password that can be used to securely access the admin console (recommended).
- Use your existing directory-based authentication system (LDPA).
4. Your CircleCI instance will now be put through a set of preflight checks, once they have completed, click Continue.
3. On the Settings page, address the following:
- Enter your hostname, or IP address if you didn't set one, and click Test Hostname Resolution.
- Under Execution Engines, if you do not need 1.0 build functionality, leave the box for it unchecked. Most users should check the box for 2.0 functionality.
- Under 2.0 Builders Configuration, select "Single Box".
- Follow the Github integration instructions. **Note:** If you get an *"Unknown error authenticating via GitHub. Try again, or contact us."* message, try using `http:` instead of `https:` for the Homepage URL and callback URL.
- Ensure that "None" is selected in the "Storage" section. In production installations, other object stores may be used but will require corresponding IAM permissions.
- Ensure that the "VM Provider" is set to "None". If you would like to allow CircleCI to dynamically provision VMs (e.g. to support doing Docker builds) you may change this setting, but it will require additional IAM permissions. [Contact us](https://support.circleci.com/hc/en-us) if you have questions.
- Agree to the license agreement, save and head to your Dashboard. The application start up process begins by downloading the ~160 MB Docker image, so it may take some time to complete.
11. Click Open to launch the CircleCI app and click Sign Up to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build.


<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04.

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete.

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build.
-->
