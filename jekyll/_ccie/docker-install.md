---
layout: enterprise
section: enterprise
title: "Installing CircleCI on Non-AWS Machines"
category: [installation]
order: 4
hide: true
published: false
description: "How to install CircleCI Enterprise on any generic machine"
sitemap: false
---

Use the following step-by-step instructions to complete the process of
installing CircleCI on any server running a Linux distribution that supports Docker.  

* TOC
{:toc}

## Installation Overview

CircleCI installation requires provisioning two types of machines:

* Services instance - An instance with at least 4 CPUs, 8GB RAM, and 30GB of disk space that is always-on and is used as the web server.  The GitHub App domain name needs to map to this instance.
* Builders - A minimum of one Builder with six CPUs and 10GB RAM and one root volume of at least 50GB, with the ability to provision as many Builders as required for your workload. One Builder with six CPUs and 10GB RAM supports a maximum of two containers.

The following limitations apply for this installation option:

* The container image is always fetched from Docker Hub.  The speed of launching new builders depends on the speed of your  connection to Docker Hub.
* Using Docker within builds is only supported as documented in the [Sharing the Docker Socket]({{site.baseurl}}/enterprise/docker-builder-config/#sharing-the-docker-socket) section of the Docker-based Build Configuration document.
* It is best practice to use a production-ready Docker configuration with the `overlay`, `btrfs`, or `zfs` filesystem. 
* If you are using `devicemapper`, it is best practice to change your Docker configuration to use `overlay` or use a `direct-lvm` configuration of `devicemapper`. See the [Docker devicemapper documentation](https://docs.docker.com/engine/userguide/storagedriver/device-mapper-driver/) for more information about problems in production environments.

## Prerequisites

Ensure the following prerequisites are met before beginning the installation.

* CircleCI License file (.rli) is available.
* Hardware has support for a distribution of Linux with Docker, this procedure uses Ubuntu Trusty which is documented at https://circleci.com/docs/1.0/build-image-trusty/.
* Services and Builders instances have network access to the GitHub or GitHub Enterprise instance.  If running in separate networks, ensure that the GitHub or GitHub Enterprise and the CircleCI server are whitelisted in the firewall, or VPN connections are set up.
* CircleCI is registered with GitHub as an app, as described the following steps:

1. Log into GitHub or GitHub Enterprise.
2. Go to the applications page under your organization's settings and click [Register New Application](https://github.com/settings/applications/new).
3. Enter the desired installation URL as the application URL.
4. Enter `http(s)://{CircleCI Enterprise domain Here}/auth/github` as the Authorization callback URL. **Note:** The `http(s)` protocol must match the protocol you choose in CircleCI.

For test installations, it is possible to complete Step 4 after installation using the auto-assigned domain name for the Services instance. 

**SECURITY NOTE:** If you use these instructions on EC2 VMs, 
all builds will have access to the IAM privileges associated with their instance profiles. Do not
give inappropriate privileges to your instances. It is possible to block
this access with `iptables` rules in a production setup. If you have any
questions as you go through these steps, please contact Support by opening a ticket: <https://support.circleci.com/hc/en-us>.

## Installation Steps

1. Whitelist ports on the Services instance as follows:


     | Source                      | Ports                   | Use                    |
     |-----------------------------|-------------------------|------------------------|
     | End Users                   | 80, 443                 | HTTP/HTTPS Traffic     |
     | Administrators              | 22                      | SSH                    |
     | Administrators              | 8800                    | Admin Console          |
     | Builder Boxes               | all traffic / all ports | Internal Communication |
     | GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |
     {: class="table table-striped"}

2. Log in to the Services instance using ssh as the `root` or `ubuntu` user and run the following command:

     ```
     curl -sSL https://get.replicated.com/docker > install.sh
     sudo chmod +x install.sh
     sudo ./install.sh
     ```

3. After the script finishes provisioning the Services, navigate to <public-ip-address : 8800 > to finish the installation of the Services instance by completing the forms in the application.

4. Whitelist ports on the Builders instance as follows:

     | Source                           | Ports                   | Use    |                                                               
     |----------------------------------|-------------------------|---------------------------------------------------|
     | End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/1.0     /ssh-build/) |
     | Administrators                   | 80, 443                 | CircleCI API Access (graceful shutdown, etc)  |
     | Administrators                   | 22                      | SSH                |                                            
     | Services Box                     | all traffic / all ports | Internal Communication      |                                   
     | Builder Boxes (including itself) | all traffic / all ports | Internal Communication         |                                
     {: class="table table-striped"}

5. Log in to the Builders instance using ssh as the `root` or `ubuntu` user and run the following command:

     ```
     $ curl -sSL https://get.docker.com | sh
     # How to specify the docker storage driver will vary by distro. You may instead
     # need to edit /usr/lib/docker-storage-setup/docker-storage-setup or another config file.
     $ sudo sed -i 's/docker daemon/docker daemon --storage-driver=overlay/' \
        /usr/lib/systemd/system/docker.service \
        && sudo systemctl daemon-reload && sudo service docker restart
     # Pre-pulling the build image is optional, but makes it easier to follow progress
     # You can always see the latest at https://circleci.com/docs/1.0/build-image-trusty/#build-image
     $ sudo docker pull circleci/build-image:ubuntu-14.04-XXL-1167-271bbe4
     $ sudo docker run -d -p 443:443 -v /var/run/docker.sock:/var/run/docker.sock \
         -e CIRCLE_CONTAINER_IMAGE_URI="docker://circleci/build-image:ubuntu-14.04-XXL-1167-271bbe4" \
         -e CIRCLE_SECRET_PASSPHRASE=<your passphrase> \
         -e SERVICES_PRIVATE_IP=<private ip address of services box>  \
         -e CIRCLE_PRIVATE_IP=<private ip address of this machine> \ # Only necessary outside of ec2
         circleci/builder-base:1.1
     ```

## Next Steps for Getting Started

1. Click the Open link in the dashboard to go to the CircleCI Enterprise app. The Starting page appears for a few minutes  as the CircleCI application is booting up, then automatically redirects to the homepage.
1. Sign up or sign in by clicking the Get Started button and then add a project using the [Setting Up Projects]({{site.baseurl}}/enterprise/quick-start/).

## Troubleshooting

Check the Fleet State by clicking the wrench icon on the sidebar navigation of CircleCI and select Fleet State.
- If no instances appear in the list, then the first builder is still starting. The first build may remain queued while the build containers start.
- If there is a builder instance in the list but its state is "starting-up", then it is still downloading the build container image and starting its first build containers.

After the build containers start and complete downloading of images, the first build should begin immediately.

If there are no updates after about 15 minutes and you have clicked the Refresh button, contact [CircleCI Enterprise support](https://support.circleci.com/hc/en-us) for assistance.
