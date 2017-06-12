---
layout: classic-docs
title: "Migration FAQ"
short-title: "Migration FAQ"
description: "Frequently asked questions about CircleCI 2.0 Migration"
categories: [migration]
order: 1
---

* Contents
{:toc}

## Why Migrate from CircleCI 1.0 to 2.0?

- CircleCI 2.0 includes a significant rewrite of container utilization to run more jobs faster and to prevent available containers from sitting idle. 
- In 2.0, Jobs are broken into Steps. Compose these Steps within a Job at your discretion, giving you greater flexibility to run your build the way you want. 
- 2.0 Jobs support almost all public Docker images and custom images with your own dependencies specified.

## Can I try CircleCI 2.0 while still using 1.0?

Yep! If you're not ready to fully commit to 2.0, you can easily try it while still building on 1.0:

Create a new branch and add 2.0 configuration as described in the [2.0 Project Tutorial](https://circleci.com/docs/2.0/project-walkthrough/). When you push the branch with 2.0 configuration, your project will build on CircleCI 2.0. All other branches will continue building on CircleCI 1.0.

If you'd like to completely revert to 1.0 configuration, simply replace `.circleci/config.yml` with a 1.0 `circle.yml` file.

## What operating systems does CircleCI 2.0 support?

- **Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These don't have to be web applications!

- **iOS:** Building iOS apps is not yet supported on CircleCI 2.0. Please refer to our documentation for [iOS on 1.0]({{ site.baseurl }}/1.0/mobile/) until 2.0 support is available.

- **Android:** There is currently no official support for Android on CircleCI 2.0, but users have still been able to build Android apps on 2.0. [This post](https://discuss.circleci.com/t/thank-you-and-android-build-example/11298) is an excellent example of one our users successfully building an Android app on 2.0.**Note that this example does not use the emulator, so it's not affected by incompatibility with Docker.**

- **Windows:** We do not yet support building and testing Windows applications.

## How do I migrate from Jenkins to CircleCI 2.0?

Start with the [Hello World doc]({{ site.baseurl }}/2.0/hello-world/), then add `steps:` to duplicate your project exactly as it is in Jenkins, for example:

    steps:
      - run:
        command: "Add any bash commands you want here"
    test:
      - run:
        command: |
          "More arbitrary multi-line bash"
        command: |
          "Probably copy-pasted from 'Execute Shell' on Jenkins"

## Does CircleCI 2.0 run inference commands?

Currently, CircleCI 2.0 doesn't infer anything from your project, but we have plans to replace our inference system before moving out of Beta. Until then, you'll need to manually configure all jobs.

## Can I use CircleCI 2.0 without creating base images?

Yes, you can use* one of ours!

The `circleci/build-image:ubuntu-14.04-XL-922-9410082` image has the same content as the Ubuntu Trusty 14.04 image our web app uses. Just know that the image is fairly large (around 17.5 GB uncompressed), so it’s less ideal for local testing.

The image defaults to running actions as the `ubuntu` user and is designed to work with network services provided by Docker Compose.

Here’s a [list of languages and tools]({{site.baseurl}}/1.0/build-image-ubuntu-14.04-XL-922-9410082/) included in the image.

\*For now. The idea of a monolithic build image doesn’t fit well with the ethos of CircleCI 2.0, so we will eventually deprecate it.

## How do Docker image names work? Where do they come from?

CircleCI 2.0 currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. For [official images][docker-library], you can pull by simply specifying the name of the image and a tag:

```YAML
golang:1.7.1
redis:3.0.7
```

For public images on Docker Hub, you can pull the image by prefixing the account/team username:

```YAML
myUsername/couchdb:1.6.1
```

## Can I use the `latest` tag when specifying image versions?

We highly recommend that you don’t. For more context, read about why we think you should [Avoid Mutable Tags]({{ site.baseurl }}/2.0/executor-types).

## How can I set the timezone in Docker images?

You can set the timezone in Docker images with the `TZ` environment variable. In your `.circleci/config.yml`, it would look like:

A sample `.circleci/config.yml` with a defined `TZ` variable would look like this:

```
version: 2
jobs:
  build:
    docker:
      - image: your/primary-image:version
      - image: mysql:5.7
        environment:
           TZ: "/usr/share/zoneinfo/America/Los_Angeles"
    working_directory: ~/your-dir
    environment:
      TZ: "/usr/share/zoneinfo/America/Los_Angeles"
```

In this example, we're setting the timezone for both the primary image and an additional mySQL image.

A full list of available timezone options is [available on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Workflows

### Can I use API with Workflows?
Not yet, but we are working on that functionality.
 
### Can I run Auto-cancel feature with Workflows?
Not yet, but we are working on that functionality.
 
### Can I use this with CircleCI 1.0?
 
This feature only exists on CircleCI 2.0. In order to use Workflows, you must first be building on CircleCI 2.0.
 
### Can I use this with CircleCI Enterprise?
This feature is currently only available for users of the hosted CircleCI application.
 
### How many jobs can I run at one time?
The number of containers in your plan determines the number of jobs that may be run at one time. For example, if you have ten workflow jobs ready to run, but only five containers in your plan, only five jobs will run.
Using Workflow config you can run multiple jobs at once or sequentially. You can fan-out (run multiple jobs at once) or fan-in (wait for all the jobs to complete before executing the dependent job).
 
### Do you plan to add the ability to launch jobs on both Linux and Mac environments in the same workflow?
We are currently working on that functionality.
 
### Is it possible to split the `config.yml` into different files?
It is not yet supported.
 
### Can I build only the jobs that changed?
No.
 
### Can I build fork PR’s using Workflows?
We don’t support fork PR’s yet.



[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/
