---
layout: classic-docs
title: "Lifecycle, Release Cadence, and Support for CircleCI Linux VM Images"
short-title: "Linux VM Lifecycle & Support"
description: |
  Covers how often we release Linux VM images, for how long they are supported,
  and when we do major releases.
order: 20
version:
- Cloud
- Server v3.x
- Server v2.x
---

* TOC
{:toc}

## Linux Standard Images
{: #linux-standard-images }

The standard Linux "Ubuntu" images are only available for Ubuntu [LTS releases](https://ubuntu.com/blog/what-is-an-ubuntu-lts-release) and are released quarterly.
This images will be released every January, April, July, and October containing Ubuntu package updates from the last 3 months as well as updates to software CircleCI pre-installs such as the AWS CLI, Go, Node.js, and more.

When Canonical (the company behind Ubuntu) releases a new LTS version, CircleCI will create quarterly images for that Ubuntu version for 4 years, which is to the second to next LTS release.
Security updates for an additional 3 months after that, upon request.

## Linux CUDA Images

The CUDA Linux images are released quarterly and based on the most recent Ubuntu LTS release.
