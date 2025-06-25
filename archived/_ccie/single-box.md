---
layout: enterprise
section: enterprise
title: "Try CircleCI Enterprise"
category: [documentation]
order: 0
description: "How to install CircleCI Enterprise on a single VM"
sitemap: false
---

CircleCI Enterprise is a scalable CI/CD platform that supports clusters
of tens or hundreds of build machines. This document provides instructions for installing and running the platform on a single virtual machine to provide a simple mechanism for getting started with a small trial in any environment:

* TOC
{:toc}

## Prerequisites

The following requirements must be met for successful trial installation:

- [Sign-up](https://circleci.com/enterprise-trial-install/) to receive a trial license file.
- Use **GitHub.com or GitHub Enterprise** for version control.
- Machines running CircleCI Enterprise and GitHub must be able to reach each other on the network.
- CircleCI Enterprise machine must have outbound internet access. If you use a proxy server, [contact us](https://support.circleci.com/hc/en-us) or see the [Setting up HTTP Proxies]({{site.baseurl}}/enterprise/proxy/) document for instructions.

## Steps for Installation on AWS EC2 

Use this procedure to install CircleCI Enterprise on a single EC2 VM by using the pre-made Amazon Machine Image (AMI) which is a special type of virtual appliance that is used to create a virtual machine within the Amazon Elastic Compute Cloud ("EC2").

**Note:** All builds that run on the installed machine will have access
to the AWS Identity and Access Management (IAM) privileges associated with its instance profile. Do **not**
give any inappropriate privileges to your instance. It is possible to block
this access with `iptables` rules in a production setup, [contact support](https://support.circleci.com/hc/en-us)
for specific instructions.

<ol>
<li>Find the Amazon Machine Image with at least 8G of RAM in your region from the following list:<br>

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

<li>During the Configure Security Group step, open port 22 for SSH, 80 for HTTP, 443 for HTTPS, and 8800 for Custom TCP.
</li>

<li>(Optional) To enable developers to SSH into builds for debugging purposes, open ports 64535-65535 for Custom TCP.
</li>

<li>After the VM is lauched, go to the public or private IP address or hostname for the VM and click Get Started to complete the rest of the guided installation process.
</li> 

<li>Choose an SSL certificate option. By default, all machines in a CircleCI Enterprise installation verify SSL certificates for the GitHub Enterprise instance. If you're using a self-signed cert,
or using a custom CA root, select the HTTPS (with self-signed certificate) option in the System Console at port 8800.
You also need to export <code>CIRCLE_IGNORE_CERT_HOST=insecure-ghe.example.com</code> on builder machines replacing <code>insecure-ghe.example.com</code> with the host of your GitHub Enterprise instance. See <a href="{{site.baseurl}}/enterprise/docker-builder-config/">this doc</a> for details on setting builder machine environment variables.
</li>

<li>
Upload the license file and set the admin password.
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
Agree to the license agreement and save. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 
</li>

<li>Open the CircleCI Enterprise app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
</li>
</ol>

### AWS Installation Video Tutorial

<p style="font-size: 20px; text-align: center">Following is a short video walkthrough of the entire install process on AWS:</p>

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/m4plGZmZkj4" frameborder="0" allowfullscreen style="display: block; margin: 20px auto;"></iframe>
</div>


## Installation in a Data Center or Cloud Provider Other Than AWS  

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI Enterprise, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI Enterprise app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 








