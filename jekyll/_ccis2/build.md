---
layout: classic-docs
title: "Build Environments"
description: "CircleCI 2.0 Build Environment Configuration"
---


Refer to the following documents for instructions specific to your environment.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/executor-types/">Choosing an Executor Type</a> | Comparison of the `docker`, `windows`, `machine` and `macos` executor types, trade-offs and examples of usage.
<a href="{{ site.baseurl }}/2.0/caching/">Caching Dependencies</a> | How to make jobs faster on CircleCI by reusing the data from expensive fetch operations from previous jobs.
[Using the CircleCI Command Line Interface]({{ site.baseurl }}/2.0/local-jobs/) | How to run jobs locally.
[Using Yarn on CircleCI]({{ site.baseurl }}/2.0/yarn/) | How to install Yarn and cache Yarn packages.
[Build and Publish Snap Packages using Snapcraft on CircleCI]({{ site.baseurl }}/2.0/build-publish-snap-packages/) | Complete guide for setting up Snapcraft, building packages, and publishing them.
{: class="table table-striped"}

## Docker

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/circleci-images/">Prebuilt Images</a> | Complete list of prebuilt CircleCI Docker images.
<a href="{{ site.baseurl }}/2.0/custom-images/">Using Custom Images</a> | How to create and use custom Docker images with CircleCI.
<a href="{{ site.baseurl }}/2.0/private-images/">Using Private Images</a> | How to use an image from a private repository or from Amazon ECR.
<a href="{{ site.baseurl }}/2.0/building-docker-images/">Running Docker Commands</a> | How to build Docker images for deploying elsewhere or for further testing and how to start services in remote docker containers.
<a href="{{ site.baseurl }}/2.0/docker-compose/">Using Docker Compose</a> | How to use docker-compose by installing it in your primary container during the job execution.
<a href="{{ site.baseurl }}/2.0/docker-layer-caching/">Docker Layer Caching (DLC)</a> | How to request the DLC feature and add it to your configuration file.
{: class="table table-striped"}

## iOS and Mac

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/hello-world-macos/">Hello World on MacOS</a> | Getting started with the macOS executor and CircleCI
<a href="{{ site.baseurl }}/2.0/testing-ios/">Testing iOS Applications on macOS</a> | How to set up and customize testing for an iOS application with CircleCI.
<a href="{{ site.baseurl }}/2.0/ios-codesigning/">Setting Up Code Signing for iOS Projects</a> | Describes the guidelines for setting up code signing for your iOS or Mac project on CircleCI 2.0.
{: class="table table-striped"}


## Windows

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/hello-world-windows/">Hello World on Windows</a> | Getting started with the Windows executor and CircleCI
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
