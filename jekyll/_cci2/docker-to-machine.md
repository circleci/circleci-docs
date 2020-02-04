---
layout: classic-docs
title: "Migrating from Docker to Machine executor"
short-title: "Migrate from Docker to Machine"
description: "Migrate from Docker to Machine executors"
categories: [containerization, configuration]
order: 20
---

This document contains some general guidelines and considerations to make when
moving from the Docker executor to machine, or vice versa.

* TOC
{:toc}

## Overview
{:.no_toc}

Occiasonally, the Docker executor isn't quite the right fit for your builds - 
this can include a lack of memory or requiring more dedicated CPU  power. Moving
to a dedicated virtual machine can help alleviate some of these  issues, but 
changing out the executor isn't as easy as replacing a few lines of  
configuration. There are some other considerations to make, such as the tools 
and libraries required to be installed for the application and tests. 

## Pre-installed software

By default, the machine executor images come installed with useful utilities,
but application specific requirements will need to be installed - if the
dependency is not installed within Ubuntu 16.04 by default or is not found on
this list, it will need to be manually installed (note the most up to date
list can be found here: https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh):

* mysql_57 
* mongo 
* postgres
* java 
* oraclejdk8
* java
* openjdk8
* sysadmin
* devtools
* jq
* redis
* memcached
* rabbitmq
* firefox
* chrome
* phantomjs
* awscli
* gcloud
* heroku
* python 2.7.12*
* python 3.5.2
* nodejs 6.1.0*
* nvm
* golang 1.7.3
* ruby 2.3.1*
* rvm
* clojure
* scala
* docker
* socat
* nsenter

\* global default

Additional packages can be installed with `sudo apt-get install <package>`. IF
the package in question is not found, `sudo apt-get update` may be required 
before installing it.

## Can I run Docker containers on machine?

Yes! Machine executors come installed with Docker, which could be utilized to
run your applications within the container rather than installing additional
dependencies. Note it's recommended this is done with a customer Docker image
rather than one of the convenience images, as the convenience images are built
under the assumption they will be used with the Docker executor and may be 
tricky to work around. Since it's a dedicated virtual machine, commands to run
background containers can be used normally as well. 

Note that if you have Docker Layer Caching enabled for your account, machine
executors can utilize this to cache your image layers for subsequent runs as
well.

### Why use Docker executors at all?

While machine executors do offer twice the memory and a more isolated 
enviornment, there is some additional overhead regarding spin up time, and,
depending on the approach taken for running the application, more time is taken
to install the required dependencies or pull your Docker image. The Docker
executor will also cache as many layers as possible from your image during
spin-up, as opposed to the machine executor, where DLC will need to be enabled.

With that in mind, there are tradeoffs to using either executor. Which one fits
your use case is something only you can determine.