---
layout: classic-docs
title: "CircleCI Trial Installation"
category: [administration]
order: 3
description: "How to install CircleCI on a single VM"
---

CircleCI is a scalable CI/CD platform that supports clusters
of tens or hundreds of build machines. This document provides instructions for installing and running the platform on a single virtual machine to provide a simple mechanism for getting started with a small trial in any environment:

* TOC
{:toc}

## Prerequisites

The following requirements must be met for successful trial installation:

- [Sign-up](https://circleci.com/enterprise-trial-install/) to receive a trial license file.
- Use **GitHub.com or GitHub Enterprise** for version control.
- Machines running CircleCI and GitHub must be able to reach each other on the network.
- CircleCI machine must have outbound internet access. If you use a proxy server, [contact us](mailto:trial-support@circleci.com) for instructions.

## Steps for Installation on AWS EC2 

Use this procedure to install CircleCI on a single EC2 VM by using the pre-made Amazon Machine Image (AMI) which is a special type of virtual appliance that is used to create a virtual machine within the Amazon Elastic Compute Cloud ("EC2").

**Note:** All builds that run on the installed machine will have access
to the AWS Identity and Access Management (IAM) privileges associated with its instance profile. Do **not**
give any inappropriate privileges to your instance. It is possible to block
this access with `iptables` rules in a production setup, [contact support](mailto:trial-support@circleci.com)
for specific instructions.

<ol>
<li>Find the Amazon Machine Image for your region from the following list:<br>

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
  "us-west-1": "ami-4fc8ee2f",
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
</li>
<li>
Ensure you choose an instance type with at least 16G of RAM.
</li>
<li>During the Configure Security Group step, open port 22 for SSH, 80 for HTTP, 443 for HTTPS, and 8800 for Custom TCP.
</li>

<li>(Optional) To enable developers to SSH into builds for debugging purposes, open ports 64535-65535 for Custom TCP.
</li>

<li>After the VM is lauched, go to the public or private IP address or hostname for the VM and click Get Started to complete the rest of the guided installation process.
</li> 

<li>Choose an SSL certificate option. By default, all machines in a CircleCI installation verify SSL certificates for the GitHub Enterprise instance. If you're using a self-signed cert,
or using a custom CA root, select the HTTPS (with self-signed certificate) option in the System Console at port 8800.
You also need to export <code>CIRCLE_IGNORE_CERT_HOST=insecure-ghe.example.com</code> on builder machines replacing <code>insecure-ghe.example.com</code> with the host of your GitHub Enterprise instance. See [this doc]({{site.baseurl}}/enterprise/docker-builder-config/) for details on setting builder machine environment variables.
</li>

<li>
Upload the license file and set the admin password.
</li>
<li>
If you don't need 1.0 build functionality, you can leave the box for it unchecked. Most users should check the box for 2.0 functionality.
</li>
<li>
Select "Single Box" in the "Builders Configuration" section(s).
</li>
<li>
Register CircleCI as a new OAuth application in GitHub.com at <a href="https://github.com/settings/applications/new">https://github.com/settings/applications/new</a> or in the GitHub Enterprise Settings using the IP address of the AWS instance from Step 4 for the Homepage URL and using <code>http(s)://AWS instance IP address/auth/github</code> as the Authorization callback URL. Click the Register Application button.
</li>
<li>
Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID.
</li>
<li>
Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication.
</li>
<li>
Ensure that "None" is selected in the "Storage" section. In production installations, other object stores may be used but will require corresponding IAM permissions.
</li>
<li>
Ensure that the "VM Provider" is set to "None". If you would like to allow CircleCI to dynamically provision VMs (e.g. to support doing Docker builds) you may change this setting, but it will require additional IAM permissions. Contact us if you have questions.
</li>
<li>
Agree to the license agreement and save. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 
</li>

<li>Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
</li>
</ol>

<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->







