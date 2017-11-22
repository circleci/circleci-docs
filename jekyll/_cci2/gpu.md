---
layout: classic-docs
title: "GPU Support"
category: [administration]
order: 11
description: "How to enable GPU builders in CircleCI Server"
---

This document outlines how to run GPU builds builders using CircleCI Server.

* TOC 
{:toc}

## Overview
The following steps can be baked into an AMI by following our instructions at [Creating your own VM-Service AMI](). That way you'll incur zero start up time. You'll run the following comamnds in order on any nvidia GPU enabled instance. You'll also need to make sure that your vm-service in the management console is set to spin up a GPU enabled instance. In this example I use cuda 8.0, but you can use any cuda runtime you'd like as long as your GPU instance supports the runtime.  

      1.) wget https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb     
      2.) sudo apt-get update
      3.) sudo apt-get install -y linux-image-extra-`uname -r` linux-headers-`uname -r` linux-image-`uname -r`
      4.) sudo dpkg -i cuda-repo-ubuntu1404-8-0-local_8.0.44-1_amd64-deb
      5.) sudo apt-get update
      6.) sudo apt-get --yes --force-yes install cuda
      7.) nvidia-smi 
      
 Step 7 is only required for testing purposes, once you've installed the cuda driver you should be good to go! 
