---
layout: classic-docs
title: "Executor Migration from Docker to Machine"
short-title: "Migrating Executor from Docker to `machine`"
description: "Best practices and considerations when migrating executor"
categories: [migration]
order:  1
---

This document contains some general guidelines and considerations to
make when moving from the Docker executor to machine, or vice versa.

* TOC 
{:toc}

Overview
--------

{:.no_toc}

Occiasonally, the Docker executor isn't quite the right fit for your
builds. This can include a lack of memory or requiring more dedicated
CPU power. Moving to a dedicated virtual machine can help alleviate some
of these issues, but changing out an executor is not as easy as
replacing a few lines of configuration. There are some other
considerations to make, such as the tools and libraries required to be
installed for your application and tests.

Pre-installed software
----------------------

By default, the machine executor images come installed with useful
utilities, but application specific requirements will need to be
installed. If a dependency is not installed within Ubuntu 16.04 by
default, or is not found on this list, it will need to be manually
installed (note the most up to date list can be found
[here](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh)):

-   mysql\_57
-   mongo
-   postgres
-   java
-   oraclejdk8
-   java
-   openjdk8
-   sysadmin
-   devtools
-   jq
-   redis
-   memcached
-   rabbitmq
-   firefox
-   chrome
-   phantomjs
-   awscli
-   gcloud
-   heroku
-   python 2.7.12\*
-   python 3.5.2
-   nodejs 6.1.0\*
-   nvm
-   golang 1.7.3
-   ruby 2.3.1\*
-   rvm
-   clojure
-   scala
-   docker
-   socat
-   nsenter

\* global default

Additional packages can be installed with
`sudo apt-get install <package>`. If the package in question is not
found, `sudo apt-get update` may be required before installing it.

Running Docker containers on machine
---------------------------------------

Machine executors come installed with Docker, which can be used
to run your application within a container rather than installing
additional dependencies. Note, it is recommended this is done with a
customer Docker image rather than a CircleCI convenience image, which
are built under the assumption they will be used with the Docker
executor and may be tricky to work around. Since each machine executor
enviornment is a dedicated virtual machine, commands to run background
containers can be used is normal.

**Note:** if you have Docker Layer Caching (DLC) enabled for your
account, machine executors can utilize this to cache your image layers
for subsequent runs.

### Why use Docker executors at all?

While machine executors do offer twice the memory and a more isolated
enviornment, there is some additional overhead regarding spin up time,
and, depending on the approach taken for running the application, more
time is taken to install the required dependencies or pull your Docker
image. The Docker executor will also cache as many layers as possible
from your image during spin-up, as opposed to the machine executor,
where DLC will need to be enabled.

All executors have their pros and cons, which have been laid out here to
help decide which is right for your pipelines.

Further Reading
---------------

We have more details on each specific executor
[here](https://circleci.com/docs/2.0/executor-types/), which includes
specific memory and vCPU allocation details, as well as how to implement
each one in your own configuration.
