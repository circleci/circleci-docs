---
layout: classic-docs
title: "Examples"
short-title: "Examples"
description: "CircleCI 2.0 Examples Introduction"
categories: [migration]
order: 1
---


Get started by reviewing commented sample files, learning about the components of config, and using specific tutorials for your platform.
<hr>


Commented Examples       | Tutorials
----------------------------|----------------------
Commented [sample config.yml files]({{ site.baseurl }}/2.0/sample-config/) that use workflows with multiple executors and [database]({{ site.baseurl }}/2.0/postgres-config/) configuration examples.  |   Use the [tutorials]({{ site.baseurl }}/2.0/tutorials/) to get a walkthrough of config for your language or platform with a demonstration app you can clone.

<hr>

iOS Example         | Links to Public Config Examples
------------------------|------------------
Get an introduction to [setting up automated testing for your iOS app]({{ site.baseurl }}/2.0/testing-ios/). &nbsp;&nbsp;&nbsp;&nbsp; |  Take a look at [example open source projects]({{ site.baseurl }}/2.0/example-configs/) that use CircleCI features for their builds.

## Linux with Docker

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # The primary container is an instance of the first image listed. The job's commands run in this container.
    docker:
      - image: circleci/node:4.8.2-jessie
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - node_modules
```

{% endraw %}

## Linux with Machine

**Note**: Use of machine may require additional fees in a future pricing update.

To use the machine executor with the default machine image, set the machine key to true in `.circleci/config.yml`:

```yaml
version: 2
jobs:
  build:
    machine: true
```

## Android

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
```

{% endraw %}          

## iOS

```
jobs:
  build-and-test:
    macos:
      xcode: "9.3.0"
    steps:
      ...
      - run:
          name: Run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```
