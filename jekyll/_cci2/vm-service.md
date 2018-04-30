---
layout: classic-docs
title: "Configuring VM Service"
category: [administration]
order: 12
description: "Configuring VM service on Server for `machine` executor and remote Docker jobs"
---

This document outlines how to set up VM service for your CircleCI installation, as well as how customize your own VM service images.

* TOC 
{:toc}

## Overview

VM service enables users of CircleCI Server to run jobs using the [Remote Docker Environment](https://circleci.com/docs/2.0/building-docker-images) and the [`machine` executor](https://circleci.com/docs/2.0/executor-types/#using-machine).

## Configuration

![Configuring VM Service on CircleCI Server]({{site.baseurl}}/assets/img/docs/vm-service.png)

To configure VM service, it is best practice to select the AWS EC2 option in the Replicated Management Console, which will allow CircleCI to run remote Docker and `machine` executor jobs using dedicated EC2 instances.

If you do not provide a custom [Amazon Machine Image](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) (AMI) for VM service, `machine` executor and remote Docker jobs on Server will run using the same machine image that we provide by default on Cloud: an Ubuntu 14.04 image with Docker version `17.03.0-ce` and docker-compose version `1.9.0`, along with a selection of common languages, tools, and frameworks. See the [`picard-vm-image` branch of our image-builder repository](https://github.com/circleci/image-builder/tree/picard-vm-image/circleci-provision-scripts) for details.

## Customization

It may be beneficial to customize the VM service image for your installation of CircleCI; it will allow you to specify other versions of Docker and docker-compose, as well as install any additional dependencies that may be part of your CI/CD pipeline. Without doing so, you will likely need to run these additional install and update steps on every commit as part of your `config.yml` file.

To build custom VM service images, use the following repository branch: 
<https://github.com/circleci/image-builder/tree/picard-vm-image>.

Run the `packer build aws-vm.json` command after filling in the required groups in `aws-vm.json`. It requires an access key and secret key to upload. Handle the key and secret process according to the your requirements, but consider restricting the `ami_groups` to only within your organization. 

Refer to <https://packer.io/docs/builders/amazon-ebs.html#ami_groups> for more information 
and see <https://github.com/circleci/image-builder/blob/picard-vm-image/provision.sh> for details about settings.

You will need to associate the `circleci` user with the image you want to use as shown in the following example: <https://github.com/circleci/image-builder/blob/picard-vm-image/aws_user_data>.
