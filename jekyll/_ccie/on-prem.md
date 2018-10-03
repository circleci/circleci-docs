---
layout: enterprise
section: enterprise
title: "LXC-based Installation"
category: [advanced-config]
order: 5
hide: true
published: false
description: "How to install CircleCI Enterprise LXC on Ubuntu 14.04"
sitemap: false
---

The following step-by-step instructions will guide you through the process of
installing CircleCI Enterprise LXC-based installation.  Note that this is now
considered an advanced install option. If you have any
questions, please contact us at <https://support.circleci.com/hc/en-us>.


## Prerequisites

### 1. Deployment environment specifics

CircleCI deployment environment is required to have the following:

* Ubuntu Trusty 14.04 instances.  To import the instances into your environment, you can import the image from [Ubuntu Cloud releases](https://cloud-images.ubuntu.com/releases/14.04.4/release/) or plain [Ubuntu ISOs](http://releases.ubuntu.com/14.04/).  Your probably need the appropriate image named `ubuntu-14.04-server-cloudimg-amd64` for your private cloud environment.
* Access to GitHub Enterprise instance.  If running in separate networks, ensure that GitHub Enterprise and CircleCI Enterprise server are whitelisted in the firewall, or VPN connections are setup.
* For ideal setup, CircleCI builders require a second volume, preferably local SSD volumes.  This speeds up build runs with maximum effectiveness.

### 2. GitHub App Client ID/Secret

CircleCI must be registered with GitHub as an app:

* Log into GitHub (Enterprise)
* Visit the applications page under your organization's settings and click ["Register New Application"](https://github.com/settings/applications/new).

* Enter the desired installation URL as the application URL
* Enter `https://{CircleCI Enterprise domain Here}/auth/github` as the Authorization callback URL.

For test installations, you may punt on this step until you spin up the machines and use auto-assigned domain name for the Services Box here.  Once you setup everything, you can change it later.

## Installation

CircleCI Enterprise installation requires provisioning two types of machines:

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
| GitHub (Enterprise or .com) | 80, 443                 | Incoming Webhooks      |

Once the machine is up, you can ssh in as root (or ubuntu) and run the following:

```bash
$ curl -o ./init-services.sh https://s3.amazonaws.com/circleci-enterprise/init-services-2.0.sh
$ sudo bash init-services.sh
```

Please follow the steps suggested by the script.  Once the scripts finish provisioning, you should go to the System Console at port 8800 to configure the instance with GitHub and S3 configuration.

### 2. Builder instances

Your initial builder machine is recommended to have:

* 6 CPUs and 10GB of RAM to start 2 containers.
* Two volumes/disks: One root volume of 8GB and a second volume of at least 100GB.  Preferably, the second volume is a local SSD disk, but a block device would do. *NOTE*: For the time-being, the second volume should be *NOT* mounted.

Picking the CPU/RAM combination is mostly dependant on your specific build requirements.  Builders run in containers, each with dedicated 2 CPUs and 4GB RAM by default, and we leave 2 CPUs for our own internal processing.  For example, 6 CPUs and 10GB of RAM defaults to supporting 2 containers/builds concurrently.

Picking the right CPU/RAM combination can be an art and is specific to your build demands.

If you are configuring network security, please ensure you whitelist the following:

| Source                           | Ports                   | Use                                                            |
|----------------------------------|-------------------------|----------------------------------------------------------------|
| End Users                        | 64535-65535             | [SSH into builds feature](https://circleci.com/docs/1.0/ssh-build/) |
| Administrators                   | 80, 443                 | CircleCI API Access (graceful shutdown, etc)                   |
| Administrators                   | 22                      | SSH                                                            |
| Services Box                     | all traffic / all ports | Internal Communication                                         |
| Builder Boxes (including itself) | all traffic / all ports | Internal Communication                                         |

#### A. On Ubuntu 14.04

To kick off the process, ssh into the builder machine and run the following:

```bash
$ curl -o ./provision-builder.sh https://s3.amazonaws.com/circleci-enterprise/provision-builder-lxc-2016-12-05.sh
$ curl -o ./init-builder.sh https://s3.amazonaws.com/circleci-enterprise/init-builder-0.2.sh
$ sudo bash ./provision-builder.sh
$ sudo \
  SERVICES_PRIVATE_IP=<private ip address of services box> \
  CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
  CIRCLE_BUILD_VOLUMES="/dev/xvdc or the actual volume for the second disk" \
  bash ./init-builder.sh

$ # Check for how image download progress going
$ sudo tail /var/log/upstart/circle-image.log
$ mount |grep /mnt
$ # If you see errors and /mnt isn't mounted - do the following
$ # edit CIRCLE_BUILD_VOLUMES to point to second disk /dev path
$ sudo vi /etc/default/circle-builder
$ sudo service circle-image start
```

After ~20 minutes or so, you will have a fully running instance.  A fully operating machine should have the following:
* Few directories at `/mnt`, namely `/mnt/tmp`, `/mnt/slave-image`, `/mnt/box1`
* Process log files at `/var/log/circle-builder/circle.log` without any exceptions.

*NOTE*: The default container image is currently hosted on S3 US East.  Your download speed may vary depending on where your machines are.  Upcoming releases will use an CDN to manage the container image.

## Advanced configuration

### Cloud Object Storage

CircleCI Enterprise can optionally use cloud storage providers for storing large files and build related artifacts.  Using external object storage eases management and the operation of CircleCI (e.g. avoid filling disks in services box) and allows for faster builds.

We currently support AWS S3, Google Cloud Storage, and Microsoft Azure.  If you have Swift/Ceph in house, or any other Object Storage, let us know.

Integrating with external object storage typically requires creating CircleCI specific user account and creating a storage bucket container.

#### a. Amazon S3

If running outside AWS, you need to create an AWS User with S3 access.  You can create one with the following commands:

```bash
$ aws iam create-user --user-name circleci-user
$ curl -sSL -o circleci-iam-policy-s3-only.json https://enterprise-docs.circleci.com/assets/aws/circleci-iam-policy-s3-only.json
$ # Inspect policy to verify it only accesses S3 and modify accordingly
$ cat  circleci-iam-policy-s3-only.json
$ aws iam put-user-policy --user-name circleci-user --policy-name CircleCIEnterpriseS3Policy --policy-document file://circleci-iam-policy-s3-only.json
$ aws iam create-access-key --user-name circleci-user
$ # Keep note of the Access and Secret keys
```

If you are using the suggested bucket, CircleCI can auto create bucket for you.  If you must create it manually, you can
create a new one manually in the AWS console with the right bucket or with a command similar to the following:

```
$ aws --profile sphereci s3api create-bucket \
       --create-bucket-configuration '{"LocationConstraint": "ap-northeast-1"}' \ # in appropriate closest region
       --bucket circleci-artifacts-acme-company-1  # this can be any name - preferably prefixed with circleci- and contains a unique identifier
```

The System Console Settings page will have fields for the AWS access key and secret as well as the bucket name.

#### b. Google Storage

When running inside Google Cloud, we can use instance authentication (remember to permit instances to make Google Cloud API calls).  If running outside, you must export a Service Credentials file.  You can create a "Service account key" at https://console.cloud.google.com/apis/credentials, and choose JSON file format.

With credentials files, CircleCI will automatically create a Standard bucket in United States location.  You can create a bucket with a different configuration in the Google Console at: https://console.cloud.google.com/storage/browser .

The System Console Settings page has fields for the credentials json file and bucket name.

#### c. Microsoft Azure Blob Storage

If you intend to use Azure Blob Storage - ensure that you have an Azure Storage account and subscription.  [Azure documentation](https://azure.microsoft.com/en-us/documentation/articles/storage-create-storage-account/) details how to create a Storage and configure an account.

To configure CircleCI Enterprise, you need the access key connection strings as associated with your storage subscription.

CircleCI will create a Blob container automatically, but you may create a container as well and set it in the Settings page.

### Cloud Init and OpenStack

OpenStack and other private cloud providers provide plenty of tools to configure and manage cluster of machines - in particular,
`cloud-init` integration and `AutoScaling` features.

Once you have configured a builder successfully, we strongly recommend converting the bash command into the configuration template for builder creation.  This would ease starting new builders.  Also, you may configure Heat/AutoScale to monitor and restart builders automatically if they builders die.

We are working to provide documentations and Heat templates as well!  Yet, we do appreciate template samples and feedback for best practices that are applicable/specific to your environment.

### Networking: Private and Public ip addresses

By default, CircleCI uses the ip address associated with `eth0` interface for internal cluster communication (i.e. traffic among CCIE instances).

If running in an OpenStack/AWS/GoogleCloud, it will query the metadata service api to fetch `local-ip` and `public-ip` associated with the instance.  The public ip address will be used when reporting an instance ip address to users (e.g. for ssh instructions in SSH builds).

If your network is setup differently, you can set the following environment variables in `init-builder-0.2.sh` initialization:

* `CIRCLE_PRIVATE_IP`: the ip address of the builder to be used for internal communication - we expect internal traffic to be whitelisted on this interface.
* `CIRCLE_PUBLIC_IP`: the ip address that is accessible by CircleCI Enterprise (e.g. developers) so they can ssh into builds.

### No second volume for builders

We strongly recommend using second volumes, preferably backed by SSD disks, for running builds.  If your cloud installation doesn't support attaching second volumes - we can use loopback devices backed by sparse files:

```bash
$ sudo truncate -s 80G /tmp/sparse-file.img
$ sudo \
  SERVICES_PRIVATE_IP=<private ip address of services box> \
  CIRCLE_SECRET_PASSPHRASE=<passphrase entered on system console (services box port 8800) settings> \
  CIRCLE_BUILD_VOLUMES="/tmp/sparse-file.img" \
  bash ./init-builder.sh
```
