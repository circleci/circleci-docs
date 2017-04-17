---
layout: classic-docs
title: "Frequently Asked Questions (FAQ)"
short-title: "FAQ"
description: "Frequently asked questions about CircleCI 2.0"
categories: [getting-started]
order: 50
---

## Can I try CircleCI 2.0 while still using 1.0?

Yep! If you're not ready to fully commit to 2.0, you can easily try it while still building on 1.0:

Create a new branch and add 2.0 configuration as described [here](https://circleci.com/docs/2.0/project-walkthrough/). When you push the branch with 2.0 configuration, your project will build on CircleCI 2.0. All other branches will continue building on CircleCI 1.0.

If you'd like to completely revert to 1.0 configuration, simply replace `.circleci/config.yml` with a 1.0 `circle.yml` file.

## What operating systems does CircleCI support?

**Linux:** CircleCI is flexible enough that you should be able to build most applications that run on Linux. These don't have to be web applications!

**iOS:** Building iOS apps is not yet supported on CircleCI 2.0. Please refer to our documentation for [iOS on 1.0]({{ site.baseurl }}/1.0/mobile/) until 2.0 support is available.

**Android:** There is currently no official support for Android on CircleCI 2.0, but users have still been able to build Android apps on 2.0. [This post](https://discuss.circleci.com/t/thank-you-and-android-build-example/11298) is an excellent example of one our users successfully building an Android app on 2.0.

**Note that this example does not use the emulator, so it's not affected by incompatibility with Docker.**

**Windows:** We do not yet support building and testing Windows applications.

## Does CircleCI 2.0 run inference commands?

Currently, CircleCI 2.0 doesn't infer anything from your project, but we have plans to replace our inference system before moving out of Beta. Until then, you'll need to manually configure all jobs.

## My project is running on CircleCI 2.0, but the build is frozen!

Builds often freeze due to syntax errors in `config.yml`.

Cancel the build, check your `config.yml` for proper indentation, and ensure that all jobs and steps have the required keys.

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

We highly recommend that you don’t. For more context, read about why we think you should [Avoid Mutable Tags]({{ site.baseurl }}/2.0/executor-types/#avoid-mutable-tags).

## I updated my Docker image, but my build is using a cached image. How can I invalidate the old image?

We don’t currently provide a way to invalidate cached Docker images. One way around this is to use image tags.

If you’re running a build on `my-image:123` and you update the image, you can use a new tag to force a cache refresh. In this example, you could change the tag to `my-image:456` and choose that image in `config.yml`.

[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/

## Git isn't installed on my primary image. Why did the checkout run?

If you see this message in the 'Checkout Code' stage of your build:

```
Warning: Git is not installed in the image. Falling back to CircleCI's native git client but this is still an experiment feature. We highly recommend using an image that has official Git installed.
```

It means that we've made use of [go-git](https://github.com/src-d/go-git) to do the checkout for you. Although this should be a reliable fall-back, there is currently one limitation: checking out with [source caching]({{site.baseurl}}/2.0/caching/#source-caching) is not supported yet. When go-git is used and a source cache is detected, you'll see the following error in the step:

```
Error: source cache is detected but currently not supported by CircleCI's native Git client.
```

If you see the error and you'd like to keep using source caching, please use an image that has git and ssh installed.

If you notice any other unusual behavior, please reach out to support or let us know on [Discuss](https://discuss.circleci.com/c/circleci-2-0/support).

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
