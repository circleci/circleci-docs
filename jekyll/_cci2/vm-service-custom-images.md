---
layout: classic-docs
title: "Building your own VM-Service images"
category: [administration]
order: 12
description: "Buildering your own VM-Service images with your depencies already installed
---

This document outlines how to run and use your own VM-Service images so that you can save time rather than download the same dependencies over and over again. 

* TOC 
{:toc}

## Overview

To build images you can ues this repo/branch: 
`https://github.com/circleci/image-builder/tree/picard-vm-image`

You can run the following command `packer build aws-vm.json` after we fill in the required groups in `aws-vm.json`. It requires an access key/secret key to upload, but feel free to handle that process however you'd like. Also you'll probably want to restrict the ami_groups to only within your organization. 

`https://www.packer.io/docs/builders/amazon-ebs.html#ami_groups` covers that more in depth
and you can add whatever settings you would like to `https://github.com/circleci/image-builder/blob/picard-vm-image/provision.sh`

A few quick notes: you can use whatever image you'd like. The only thing we require is that it has the circleci user associated with it
ala: `https://github.com/circleci/image-builder/blob/picard-vm-image/`aws_user_data . That should cover how to build an image, if you have any questions please feel free to reach out. 