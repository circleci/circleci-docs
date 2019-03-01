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
- CircleCI machine must have outbound internet access. If you use a proxy server, [contact us](https://support.circleci.com/hc/en-us/requests/new) for instructions.

## Steps for Installation on AWS EC2 

Use this procedure to install CircleCI on a single EC2 VM by using the pre-made Amazon Machine Image (AMI) which is a special type of virtual appliance that is used to create a virtual machine within the Amazon Elastic Compute Cloud ("EC2").

**Note:** All builds that run on the installed machine will have access
to the AWS Identity and Access Management (IAM) privileges associated with its instance profile. Do **not**
give any inappropriate privileges to your instance. It is possible to block
this access with `iptables` rules in a production setup, [contact support](https://support.circleci.com/hc/en-us) for specific instructions.

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


1. Find the Amazon Machine Image for your region from the list above. 
2. Ensure you choose an instance type with at least 32G of RAM, such as `m4.2xlarge`. Select Next to configure the instance.
3. On the Configuring Instance Details page: 
- Choose your network
- Enable Auto-assign Public IP
- Set the IAM role to None
![AWS Step 3]({{site.baseurl}}/assets/img/docs/single-box-step3.png)
4. By default, the instance will have 100GB of storage, this is enough for the trial install.
5. During the Configure Security Group step, open the following ports:
- SSH port 22
- HTTP port 80
- HTTPS port 443
- Custom TCP 8800
- (Optional) To enable developers to SSH into builds for debugging purposes, open ports 64535-65535 for Custom TCP.
![AWS Step 5]({{site.baseurl}}/assets/img/docs/single-box-step5.png)
6. After the VM is lauched, go to the public or private IP address or hostname for the VM and click Get Started to complete the rest of the guided installation process for CircleCI.

### Configure CircleCI
1. Choose an SSL certificate option. By default, all machines in a CircleCI installation verify SSL certificates for the GitHub Enterprise instance. 
- Note: If you are using a self-signed cert, or using a custom CA root, please see the [certificates]({{site.baseurl}}/2.0/certificates/) document for a script to add the information to the CircleCI truststore.
2. Upload the CircleCI license file and set the admin password.
3. If you do not need 1.0 build functionality, leave the box for it unchecked. Most users should check the box for 2.0 functionality.
4. Select "Single Box" in the "Builders Configuration" section(s).
5. Register CircleCI as a new OAuth application in GitHub.com at [https://github.com/settings/applications/new/](https://github.com/settings/applications/new/) or in the GitHub Enterprise Settings using the IP address of the AWS instance from Step 6 for the Homepage URL and using `http(s)://AWS instance IP address/auth/github` as the Authorization callback URL. Click the Register Application button.
- **Note:** If you get an "Unknown error authenticating via GitHub. Try again, or contact us." message, try using `http:` instead of `https:` for the Homepage URL and callback URL.
6. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID.
7. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication.
8. Ensure that "None" is selected in the "Storage" section. In production installations, other object stores may be used but will require corresponding IAM permissions.
9. Ensure that the "VM Provider" is set to "None". If you would like to allow CircleCI to dynamically provision VMs (e.g. to support doing Docker builds) you may change this setting, but it will require additional IAM permissions. [Contact us](https://support.circleci.com/hc/en-us) if you have questions.
10. Agree to the license agreement and save. The application start up process begins by downloading the ~160 MB Docker image, so it may take some time to complete. 
11. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 


<!---
## Installation in a Data Center

1. Launch a VM with at least 8GB of RAM, 100GB of disk space on the root volume, and a version of Linux that supports Docker, for example Ubuntu Trusty 14.04. 

2. Open ports 22 and 8800 to administrators, open ports 80 and 443 to all users, and optionally open ports 64535-65535 to developers to SSH into builds.

3. Install Replicated, the tool used to package and distribute CircleCI, by running the  `curl https://get.replicated.com/docker | sudo bash` command. **Note:** Docker must not use the device mapper storage driver. Check this by running `sudo docker info | grep "Storage Driver"`.)

4. Visit port 8800 on the machine in a web browser to complete the guided installation process.

5. Complete the process by choosing an SSL certificate option, uploading the license, setting the admin password and hostnames,  enabling GitHub OAuth registration, and defining protocol settings. The application start up process begins by downloading the ~160 MB docker image, so it may take some time to complete. 

6. Open the CircleCI app and click Get Started to authorize your GitHub account. The Add Projects page appears where you can select a project for your first build. 
-->







