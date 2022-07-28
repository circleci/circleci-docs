---
layout: classic-docs
title: "Migrating from Docker to Machine"
description: "Best practices and considerations when migrating your executor from Docker to machine"
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document contains some general guidelines and considerations to
make when moving from the Docker executor to machine, or vice versa.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

Occasionally, the Docker executor isn't quite the right fit for your
builds. This can include a lack of memory or requiring more dedicated
CPU power. Moving to a dedicated virtual machine can help alleviate some
of these issues, but changing out an executor is not as easy as
replacing a few lines of configuration. There are some other
considerations to make, such as the tools and libraries required to be
installed for your application and tests.

## Pre-installed software
{: #pre-installed-software }

The most up to date list of pre-installed software can be found on the [image builder](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) page. You can also visit the [Discuss](https://discuss.circleci.com/) page for more information.

Additional packages can be installed with `sudo apt-get install <package>`. If the package in question is not found, `sudo apt-get update` may be required before installing it.

## Running docker containers on machine
{: #running-docker-containers-on-machine }

Machine executors come installed with Docker, which can be used
to run your application within a container rather than installing
additional dependencies. Note, it is recommended this is done with a
customer Docker image rather than a CircleCI convenience image, which
are built under the assumption they will be used with the Docker
executor and may be tricky to work around. Since each machine executor
environment is a dedicated virtual machine, commands to run background
containers can be used is normal.

**Note:** if you have Docker Layer Caching (DLC) enabled for your
account, machine executors can utilize this to cache your image layers
for subsequent runs.

## Why use docker executors at all?
{: #why-use-docker-executors-at-all }

While machine executors do offer twice the memory and a more isolated
environment, there is some additional overhead regarding spin up time,
and, depending on the approach taken for running the application, more
time is taken to install the required dependencies or pull your Docker
image. The Docker executor will also cache as many layers as possible
from your image during spin-up, as opposed to the machine executor,
where DLC will need to be enabled.

All executors have their pros and cons, which have been laid out here to
help decide which is right for your pipelines.

## Further reading
{: #further-reading }

We have more details on each specific executor
[here]({{site.baseurl}}/executor-intro/), which includes links to
specific memory and vCPU allocation details, as well as how to implement
each one in your own configuration.
