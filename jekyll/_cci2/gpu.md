---
layout: classic-docs
title: "Running GPU Builders"
category: [administration]
order: 11
description: "How to enable GPU builders in CircleCI Server"
---

This document outlines how to run GPU (graphics processing unit) Builders using CircleCI Server.

* TOC 
{:toc}

## Prerequisites

Configure the `vm-service` in the Replicated management console to start a GPU-enabled instance. 

## Overview
Run the following commands on any Nvidia GPU-enabled instance. The following example uses CUDA 8.0, but you can use any CUDA runtime version supported by your GPU instance.  

1. `wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`     
2. `sudo apt-get update`
3. `uname -r`
4. `sudo apt-get install -y linux-image-extra-<output of uname -r> linux-headers-<output of uname -r> linux-image-<output of uname -r>`
5. `sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb`
6. `sudo apt-get update`
7. `sudo apt-get --yes --force-yes install cuda`
8. `nvidia-smi`
      
Step 8 is only required for testing purposes. After you install the CUDA driver in Step 7 you should be good to go! 

## Adding GPU Steps to an AMI

To avoid start up time associated with the above steps, they may be included in an AMI by following the instructions in the [Configuring VM Service]({{ site.baseurl }}/2.0/vm-service) documentation. 
