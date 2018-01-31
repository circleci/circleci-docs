---
layout: classic-docs
title: "Language Guide: Android"
short-title: "Android"
description: "Building and Testing an Android App on CircleCI 2.0"
categories: [language-guides]
order: 9
---

*[Tutorials & 2.0 Demo Apps]({{ site.baseurl }}/2.0/tutorials/) > Language Guide: Android*

This guide will help you get started with an Android application on CircleCI.

## Overview

There are some assumptions made in this guide:

- We assume that your Android project is built with `gradle` (this is the default for projects created with [Android Studio](https://developer.android.com/studio).
- We assume that your project is located in the root of your `git` repository, with the application located in a subfolder named `app`.

Running the Android emulator is not currently supported on CircleCI 2.0. To run emulator tests from a job, consider using an external service like [Firebase Test Lab](https://firebase.google.com/docs/test-lab). To do this, you can use the [gcloud command line](https://firebase.google.com/docs/test-lab/command-line). Google Cloud tools are preinstalled in our Android Docker images, which you can find on [GitHub](https://github.com/CircleCI-Public/circleci-dockerfiles/tree/master/android/images) or [Docker Hub](https://hub.docker.com/r/circleci/android/tags). Before using `gcloud`, ensure that you have authenticated it. See the [Authenticating Google Cloud Platform]({{ site.baseurl }}/2.0/google-auth/) document for more details.

## Sample Configuration

{% raw %}
```YAML
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

```
{% endraw %}

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. This is the directory into which our code will be checked out, and this path will be used as the default working directory for the rest of the `job` unless otherwise specified.

```YAML
jobs:
  build:
    working_directory: ~/code
```

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```YAML
    docker:
      - image: circleci/android:api-25-alpha
```

We use the CircleCI-provided Android image with the `api-25-alpha` tag. See [Docker Images](#docker-images) below for more information about what images are available.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

Next we pull down the cache, if present. If this is your first run, or if you've changed either of your `build.gradle` files, this won't do anything. We run `./gradlew androidDependencies` next to pull down the project's dependencies. Normally you never call this task directly since it's done automatically when it's needed, but calling it directly allows us to insert a `save_cache` step that will store the dependencies in order to speed things up for next time.

Then `./gradlew lint test` runs the unit tests, and runs the built in linting tools to check your code for style issues.

We then upload the build reports as build artifacts, and we upload the test metadata (XML) for CircleCI to process.

Nice! You just set up CircleCI for an Android app.

## Docker Images

CircleCI provides a set of [Docker](https://www.docker.com/) [images for building Android apps](https://hub.docker.com/r/circleci/android/) on CircleCI 2.0.

The [Dockerfiles are open-source, and available on GitHub](https://github.com/circleci/circleci-images/tree/master/android). Our image is based on the [`openjdk:8-jdk`](https://hub.docker.com/_/openjdk/) official Docker image, which is based on [buildpack-deps](https://hub.docker.com/_/buildpack-deps/). The base OS is Debian Jessie, and builds run as the `circleci` user, which has full access to passwordless `sudo`.

Please note that our official image does *not* include the Android NDK. If you require that toolset, we recommend making your own image and setting these environment variables or using an [existing image](https://hub.docker.com/search/?isAutomated=0&isOfficial=0&page=1&pullCount=0&q=android-ndk&starCount=0).

### API Levels

We have a different Docker image for each [Android API level](https://source.android.com/source/build-numbers). To use API level 24 (Nougat 7.0) in your build, you should select `circleci/android:api-24-alpha`.

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
