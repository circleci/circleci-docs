---
layout: classic-docs
title: "Language Guide: Android"
short-title: "Android"
description: "Building and Testing an Android App on CircleCI 2.0"
categories: [language-guides]
order: 9
---

*[Tutorials & 2.0 Demo Apps]({{ site.baseurl }}/2.0/tutorials/) > Language Guide: Android*

This guide will get you started with an Android application on CircleCI.

* TOC
{:toc}

## Overview

Placeholder sentence about how great and easy it is to build an Android application on CircleCI.

**Note:**
Due to how CircleCI implements virtualization on Linux,
running the Android emulator is not supported.
To run emulator tests from a job,
consider using an external service like [Firebase Test Lab](https://firebase.google.com/docs/test-lab).
For more details,
see the [Testing With Firebase](#testing-with-firebase) section below.

## Prerequisites

This guide assumes the following:

- You are using [Gradle](https://gradle.org/)
to build your Android project.
Gradle is the default build tool
for projects created with [Android Studio](https://developer.android.com/studio).
- Your project is located in the root of your VCS repository.
- The project's application is located in a subfolder named `app`.

## Sample Configuration

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: circleci/android:api-25-alpha
    environment:
      JVM_OPTS: -Xmx3200m
    steps:
      - checkout
      - restore_cache:
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
#      - run:
#         name: Chmod permissions #if permission for Gradlew Dependencies fail, use this.
#         command: sudo chmod +x ./gradlew
      - run:
          name: Download Dependencies
          command: ./gradlew androidDependencies
      - save_cache:
          paths:
            - ~/.gradle
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
      - run:
          name: Run Tests
          command: ./gradlew lint test
      - store_artifacts:
          path: app/build/reports
          destination: reports
      - store_test_results:
          path: app/build/test-results
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
```

{% endraw %}

## Config Walkthrough

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. This is the directory into which our code will be checked out, and this path will be used as the default working directory for the rest of the `job` unless otherwise specified.

```yaml
jobs:
  build:
    working_directory: ~/code
```

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```yaml
    docker:
      - image: circleci/android:api-25-alpha
```

We use the CircleCI-provided Android image with the `api-25-alpha` tag. See [Docker Images](#docker-images) below for more information about what images are available.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed either of your `build.gradle` files, this won't do anything. We run `./gradlew androidDependencies` next to pull down the project's dependencies. Normally you never call this task directly since it's done automatically when it's needed, but calling it directly allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

Then `./gradlew lint test` runs the unit tests, and runs the built in linting tools to check your code for style issues.

We then upload the build reports as job artifacts, and we upload the test metadata (XML) for CircleCI to process.

## Docker Images

For convenience, CircleCI provides a set of Docker images for building Android apps. These pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/android/). The source code and Dockerfiles for these images are available in [this GitHub repository](https://github.com/circleci/circleci-images/tree/master/android).

The CircleCI Android image is based on the [`openjdk:8-jdk`](https://hub.docker.com/_/openjdk/) official Docker image, which is based on [buildpack-deps](https://hub.docker.com/_/buildpack-deps/). The base OS is Debian Jessie, and builds run as the `circleci` user, which has full access to passwordless `sudo`.

**Note:** The CircleCI Android image does *not* include the Android NDK. If you require that toolset, consider using another [existing image](https://hub.docker.com/search/?isAutomated=0&isOfficial=0&page=1&pullCount=0&q=android-ndk&starCount=0) or making your own image.

### API Levels

We have a different Docker image for each [Android API level](https://source.android.com/source/build-numbers). To use API level 24 (Nougat 7.0) in a job, you should select `circleci/android:api-24-alpha`.

### Alpha Tag

Our Android Docker images are currently tagged with the suffix `-alpha`. This is to indicate the images are currently under development and might change in backwards incompatible ways from week to week.

### Customizing the Images

We welcome contributions [on our GitHub repo for the Android image](https://github.com/circleci/circleci-images/tree/master/android). Our goal is provide a base image that has *most* of the tools you need; we do not plan to provide *every* tool that you might need.

To customize the image, create a Dockerfile that builds `FROM` the `circleci/android` image. See [Using Custom-Built Docker Images]({{ site.baseurl }}/2.0/custom-images/) for instructions.

## React Native projects

React Native projects can be built on CircleCI 2.0 using Linux, Android
and macOS capabilities. Please check out [this example React Native
application](https://github.com/CircleCI-Public/circleci-demo-react-native)
on GitHub for a full example of a React Native project.

## Testing With Firebase Test Lab

To test your Android application with Firebase Test Lab,
use the [gcloud command line](https://firebase.google.com/docs/test-lab/command-line).
Google Cloud tools are preinstalled in our Android Docker images,
which you can find on [GitHub](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/android/images) or [Docker Hub](https://hub.docker.com/r/circleci/android/tags).

## Disabling Pre-Dexing to Improve Build Performance

Disabling pre-dexing for Android builds on CircleCI can speed up your builds. Refer to the [Disable Android pre dexing on CI builds](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/) blog post for details.

CircleCI always runs clean builds, so pre-dexing has no benefit. By default, the Gradle Android plugin pre-dexes dependencies. Pre-dexing converts Java bytecode into Android bytecode to speed up development by doing only incremental dexing as you change code. Pre-dexing can make compilation slower and may also use large quantities of memory. 

## Deploy

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
