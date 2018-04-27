---
layout: classic-docs
title: "Building Your own VM-Service Images"
category: [administration]
order: 12
description: "Building your own VM-Service images with your dependencies already installed"
---

This document outlines how to run and use your own VM-Service images so that you can save time rather than downloading the same dependencies repeatedly. 

* TOC 
{:toc}

## Prerequisites

Associate the `circleci` user with the image you want to use as shown in the following example: <https://github.com/circleci/image-builder/blob/picard-vm-image/aws_user_data>. 

## Overview

To build images, use the following repository branch: 
<https://github.com/circleci/image-builder/tree/picard-vm-image>.

Run the `packer build aws-vm.json` command after filling in the required groups in `aws-vm.json`. It requires an access key/secret key to upload. Handle the key/secret process according to the your requirements, but consider restricting the `ami_groups` to only within your organization. 

Refer to <https://www.packer.io/docs/builders/amazon-ebs.html#ami_groups> for more information 
and see <https://github.com/circleci/image-builder/blob/picard-vm-image/provision.sh> for details about settings.

 
