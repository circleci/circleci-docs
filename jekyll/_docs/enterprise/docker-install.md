---
layout: enterprise
title: "Installing CircleCI"
category: [installation]
order: 3
description: "How to install CircleCI Enterprise on any generic machine"
---

The following step-by-step instructions will guide you through the process of
installing CircleCI Enterprise on any Docker Supported Machine.  If you have any
questions as you go through these steps, please contact
<enterprise-support@circleci.com>.

## Prerequisites

### 1. Deployment environment specifics

CircleCI deployment environment is required to have the following:

* Distro that Docker supports.
* Access to GitHub Enterprise instance.  If running in separate networks, ensure that GitHub Enterprise and CircleCI Enterprise server are whitelisted in the firewall, or VPN connections are setup.

### 2. GitHub App Client ID/Secret

CircleCI must be registered with GitHub as an app:

* Log into GitHub (Enterprise)
* Visit the applications page under your organization's settings and click ["Register New Application"](https://github.com/settings/applications/new).

* Enter the desired installation URL as the application URL
* Enter `http(s)://{CircleCI Enterprise domain Here}/auth/github` as the Authorization callback URL.
	* It is extremely important that the `http(s)` protocol match the protocol you choose in CircleCI.  

For test installations, you may punt on this step until you spin up the machines and use auto-assigned domain name for the Services Box here.  Once you setup everything, you can change it later.

## Installation

CircleCI Enterpise installation requires provisioning two types of machines:

* Services box - an instance that is always-on and used as the web server.  The GitHub App domain name needs to map to this instance. 
* A pool of builder machines.  You can have a least one for normal operations, but you can provision as many builders as your scale demands.

Both boxes need to be Trusty 14.04 and can run on any hypervisor.

### 1. Services instance

The services box is recommended to have at least 4 CPUs, 8GB RAM, and ~30GB of disk space.  Your installation may require more.

If you are configuring network security, please ensure you whitelist the following:


| Source                      | Ports                   | Use                    |
|-----------------------------|-------------------------|------------------------|
| End Users                   | 80, 443                 | HTTP/HTTPS Traffic     |
| Administrators              | 22                      | SSH                    |
| Administrators              | 8800                    | Admin Console          |
| Builder Boxes               | all traffic / all ports | Internal Communication |
| Github (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |

Once the machine is up, you can ssh in as root (or ubuntu) and run the following:

```bash
$ curl -o ./init-services.sh https://s3.amazonaws.com/circleci-enterprise/init-services.sh
$ sudo bash init-services.sh
```

Please follow the steps suggested by the script.  Once the scripts finish provisioning, you should go to the System Console at port 8800 to configure the instance with GitHub and S3 configuration.

### 2. Builder instances

Your initial builder machine is recommended to have:

* 6 CPUs and 10GB of RAM to start 2 containers.
* One root volume of at least 50GB.  Preferably, the second volume is a local SSD disk, but a block device would do.

Picking the CPU/RAM combination is mostly dependant on your specific build requirements.  Builders run in containers, each with dedicated 2 CPUs and 4GB RAM by default, and we leave 2 CPUs for our own internal processing.  For example, 6 CPUs and 10GB of RAM defaults to supporting 2 containers/builds concurrently.

Picking the right CPU/RAM combination can be an art and is specific to your build demands.

If you are configuring network security, please ensure you whitelist the following:

| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/ssh-build) |
| Administrators                   | 80, 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Builder Boxes (including itself) | all traffic / all ports | Internal Communication                                         |


#### CircleCI Builder Installtion

The main requirement for this install is that the kernel supports Docker.  Our installation scripts will automatically install Docker if it's not installed already. 

Notable differences compared to our [Advanced LXC Installation]({{site.baseurl}}/enterprise/on-prem/) are:

* We default to using Ubuntu Trusty container image which is documented at https://circleci.com/docs/build-image-trusty/
* The container image is fetched from DockerHub.  Launching new builders will be much slower depending on your connection to DockerHub.  Ubuntu Trusty images are much faster to download, as they are downloaded from the closest AWS S3 region
* Using Docker within builds isn't currently supported.
* No second volume is required.
* By default, specific CPUs are not tied to specific build containers.


When using Docker, we recommend that you ensure that use production-ready Docker configuration.  In particular, use the `overlay`, `btrfs`, or `zfs` filesystems.  In particular, `devicemapper` storage engine is known to have problems in production environment, which you can some about in [Docker devicemapper documentation](https://docs.docker.com/engine/userguide/storagedriver/device-mapper-driver/).  If you are using `devicemapper`, we recommend that you either change Docker configuration to use `overlay` or use `direct-lvm` configuration of `device-mapper`.

Here is a complete list of commands to provision a builder machine:

```
$ curl -o ./provision-builder.sh https://s3.amazonaws.com/circleci-enterprise/provision-builder-docker-2016-12-05.sh
$ curl -o ./init-builder.sh https://s3.amazonaws.com/circleci-enterprise/init-builder-docker-2016-12-05.sh
$ sudo bash ./provision-builder.sh
# How to specify the docker storage driver will vary by distro. You may instead
# need to edit /usr/lib/docker-storage-setup/docker-storage-setup or another config file.
$ sudo sed -i 's/docker daemon/docker daemon --storage-driver=overlay/' \
   /usr/lib/systemd/system/docker.service \
   && sudo systemctl daemon-reload && sudo service docker restart
$ sudo \
  SERVICES_PRIVATE_IP=<private ip address of services box> \
  CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
  bash ./init-builder.sh
```
