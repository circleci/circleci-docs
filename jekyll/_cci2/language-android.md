---
layout: classic-docs
title: "Language Guide: Android"
short-title: "Android"
description: "Building and Testing an Android App on CircleCI 2.0"
categories: [language-guides]
order: 9
---

This document describes
how to set up an Android project on CircleCI
in the following sections.

* TOC
{:toc}

## Overview
{:.no_toc}

This guide provides an introduction to Android development on CircleCI.
If you are looking for a `.circleci/config.yml` template for Android,
see the [Sample Configuration](#sample-configuration) section of this document.

**Note:**
Running the Android emulator is not supported
by the type of virtualization CircleCI uses on Linux.
To run emulator tests from a job,
consider using an external service like [Firebase Test Lab](https://firebase.google.com/docs/test-lab).
For more details,
see the [Testing With Firebase Test Lab](#testing-with-firebase-test-lab) section below.

## Prerequisites
{:.no_toc}

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
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: app/build/reports
          destination: reports
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
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

### API Levels
{:.no_toc}

We have a different Docker image for each [Android API level](https://source.android.com/source/build-numbers). To use API level 24 (Nougat 7.0) in a job, you should select `circleci/android:api-24-alpha`.

### Alpha Tag
{:.no_toc}

Our Android Docker images are currently tagged with the suffix `-alpha`. This is to indicate the images are currently under development and might change in backwards incompatible ways from week to week.

### Customizing the Images
{:.no_toc}

We welcome contributions [on our GitHub repo for the Android image](https://github.com/circleci/circleci-images/tree/master/android). Our goal is provide a base image that has *most* of the tools you need; we do not plan to provide *every* tool that you might need.

To customize the image, create a Dockerfile that builds `FROM` the `circleci/android` image. See [Using Custom-Built Docker Images]({{ site.baseurl }}/2.0/custom-images/) for instructions.

### React Native Projects
{:.no_toc}

React Native projects can be built on CircleCI 2.0 using Linux, Android
and macOS capabilities. Please check out [this example React Native
application](https://github.com/CircleCI-Public/circleci-demo-react-native)
on GitHub for a full example of a React Native project.

## Testing With Firebase Test Lab

To use Firebase Test Lab with CircleCI,
first complete the following steps.

1. **Create a Firebase project.**
Follow the instructions in the [Firebase documentation](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project).

2. **Install and authorize the Google Cloud SDK.**
Follow the instructions in the [Authorizing the Google Cloud SDK]({{ site.baseurl }}/2.0/google-auth/) document.

    **Note:**
    Instead of `google/cloud-sdk`,
    consider using an [Android convenience image]({{ site.baseurl }}/2.0/circleci-images/#android),
    which includes `gcloud` and Android-specific tools.

3. **Enable required APIs.**
Using the service account you created,
log into Google
and go to the [Google Developers Console API Library page](https://console.developers.google.com/apis/library).
Enable the **Google Cloud Testing API** and the **Cloud Tool Results API**
by typing their names into the search box at the top of the console
and clicking **Enable API**.

In your `.circleci/config.yml` file,
add the following `run` steps.

1. **Build the debug APK and test APK.**
Use Gradle to build two APKs.
To improve build performance,
consider [disabling pre-dexing](#disabling-pre-dexing-to-improve-build-performance).

2. **Store the service account.**
Store the service account you created in a local JSON file.

3. **Authorize `gcloud`**.
Authorize the `gcloud` tool
and set the default project.

4. **Use `gcloud` to test with Firebase Test Lab.**
Adjust the paths to the APK files
to correspond to your project.

5. **Install `crcmod` and use `gsutil` to copy test results data.**
`crcmod` is required
to use `gsutil`.
Use `gsutil`
to download the newest files in the bucket to the CircleCI artifacts folder.
Be sure to replace `BUCKET_NAME` and `OBJECT_NAME` with project-specific names.

```yaml
version: 2
jobs:
  test:
    docker:
      - image: circleci/android:api-28-alpha  # gcloud is baked into this image
    steps:
      - run:
          name: Build debug APK and release APK
          command: |
            ./gradlew :app:assembleDebug
            ./gradlew :app:assembleDebugAndroidTest
      - run:
          name: Store Google Service Account
          command: echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
      - run:
          name: Authorize gcloud and set config defaults
          command: |
            sudo gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
            sudo gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
      - run:
          name: Test with Firebase Test Lab
          command: >
            sudo gcloud firebase test android run
              --app <local_server_path>/<app_apk>.apk
              --test <local_server_path>/<app_test_apk>.apk
              --results-bucket cloud-test-${GOOGLE_PROJECT_ID}
      - run:
          name: Install gsutil dependency and copy test results data
          command: |
            sudo pip install -U crcmod
            sudo gsutil -m cp -r -U `sudo gsutil ls gs://[BUCKET_NAME]/[OBJECT_NAME] | tail -1` ${CIRCLE_ARTIFACTS}/ | true
```

For more details on using `gcloud` to run Firebase,
see the [official documentation](https://firebase.google.com/docs/test-lab/android/command-line).


## Deployment

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

## Troubleshooting

### Handling Out Of Memory Errors

You might run into out of memory (oom) errors with your build. To get acquainted
with the basics of customizing the JVM's memory usage, consider reading the
[Debugging Java OOM errors]({{ site.baseurl }}/2.0/java-oom/) document. 

If you are using [Robolectric](http://robolectric.org/) for testing you may need to make tweaks to gradle's
use of memory. When the gradle vm is forked for tests it does not receive
previously customized JVM memory parameters. You will need to supply Gradle with
JVM memory paramaters for tests like so in your `build.gradle` file.

```
android {
    testOptions {
        unitTests {
            returnDefaultValues = true
            includeAndroidResources = true

            all {
                maxHeapSize = "1024m"
            }
        }
    }
```

If you are still running into OOM issues you can also limit the max workers for
gradle: `./gradlew test --max-workers 4`

### Disabling Pre-Dexing to Improve Build Performance
{:.no_toc}

Pre-dexing dependencies has no benefit on CircleCI.
To disable pre-dexing,
refer to [this blog post](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/).

By default,
the Gradle Android plugin pre-dexes dependencies.
Pre-dexing speeds up development
by converting Java bytecode into Android bytecode,
allowing incremental dexing
as you change code.
CircleCI runs clean builds,
so pre-dexing actually increases compilation time
and may also increase memory usage.

