---
layout: classic-docs
title: "Language Guide: Scala"
short-title: "Language Guide: Scala"
description: "CircleCI 2.0 Language Guide: Scala"
categories: [getting-started]
order: 1
---

This document will walk you through a Scala application [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

This document assumes that your [project’s AWS Permission settings](https://circleci.com/docs/2.0/deployment-integrations/#aws) are configured with valid AWS keys that are permitted to read and write to an S3 bucket. The examples in this post upload build packages to the specified S3 bucket.

## Sample Scala Project Source Code

The source code for this sample application is in the [Public samplescala GitHub repo](https://github.com/ariv3ra/samplescala).

## Prerequisites

CircleCI 2.0 requires you to create a new directory in the repo's root and a YAML file within this new directory. The new assets must follow these naming schema's directory: `.circleci/` file: `config.yml`.

```
mkdir .circleci/
touch .circleci/config.yml
```

These commands create a directory named `.circleci` & the next command creates a new file named `config.yml` within the `.circleci` directory.  Again you **must** use the names .circleci for the dir and config.yml.  Learn more about the [version 2.0 prerequisites here]({{ site.baseurl }}/2.0/migrating-from-1-2/).

### Scala config.yml File

To get started, open the newly created `config.yml` in your favorite text editor and paste the following CircleCI 2.0 schema into the file. Below is the complete 2.0 configuration:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
    environment:
      SBT_VERSION: 1.0.4
    steps:
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
      - run:
          name: Get sbt binary
          command: |
                    apt update && apt install -y curl
                    curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
                    dpkg -i sbt-$SBT_VERSION.deb
                    rm sbt-$SBT_VERSION.deb
                    apt-get update
                    apt-get install -y sbt python-pip git
                    pip install awscli
                    apt-get clean && apt-get autoclean
      - checkout
      - restore_cache:
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: sbt-cache
      - run:
          name: Compile samplescala dist package
          command: cat /dev/null | sbt clean update dist
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: target/universal/samplescala.zip
          destination: samplescala
      - save_cache:
          key: sbt-cache
          paths:
            - "~/.ivy2/cache"
            - "~/.sbt"
            - "~/.m2"
      - deploy:
          command: |
              mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
              aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

## Schema Walkthrough

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

The next key in the schema is the jobs & build keys.  These keys are required and represent the default entry point for a run. The build section hosts the remainder of the schema which executes our commands. This will be explained below.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
    environment:
      SBT_VERSION: 1.0.4
```

The docker/image key represents the Docker image you want to use for the build. In this case, we want to use the official `openjdk:8` image from [Docker Hub](https://hub.docker.com/_/openjdk/) because it has the native Java compiler we need for our Scala project.

The environment/SBT_VERSION is an environment variable that specifies the version of sbt to download in later commands which is required to compile the Scala app.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
    environment:
      SBT_VERSION: 1.0.4
    steps:
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
      - run:
          name: Get sbt binary
          command: |
            apt update && apt install -y curl
            curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
            dpkg -i sbt-$SBT_VERSION.deb
            rm sbt-$SBT_VERSION.deb
            apt-get update
            apt-get install -y sbt python-pip git
            pip install awscli
            apt-get clean && apt-get autoclean
```

The steps/run keys specify the types of actions to perform. The run keys represent the actions to be executed.

```yaml
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
```

This echo command defines the $ARTIFACT_BUILD environment variable and sets it to a build filename. 

The next run command executes multiple commands within the openjdk container. Since we're executing multiple commands we'll be defining a multi-line run command which is designated by the pipe `|` character, as shown below. When using the multi-line option, one line represents one command.

```yaml
      - run:
          command: |
            apt update && apt install -y curl
            curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
            dpkg -i sbt-$SBT_VERSION.deb
            rm sbt-$SBT_VERSION.deb
            apt-get update
            apt-get install -y sbt python-pip git
            pip install awscli
            apt-get clean && apt-get autoclean
```

The 2.0 version of our samplescala schema requires us to download required dependencies and install them into the container.  Below is an explanation of the example multi-line command:
- Updates the container OS and installs curl.
- Downloads the [Simple Build Tool (sbt)](https://www.scala-sbt.org/) compiler version specified in the $SBT_VERSION variable.
- Installs the sbt compiler package.
- Deletes the sbt.deb file after install.
- Updates the OS package listing.
- Installs python-pip and git client.
- Installs the `awscli` package which is the AWS Command Line Interface needed to perform the S3 uploads.
- Removes all the unnecessary install packages to minimize container size.

The following keys represent actions performed after the multi-line command is executed:

```yaml
    steps:
      - checkout
      - restore_cache:
          key: sbt-cache
      - run:
          name: Compile samplescala dist package
          command: cat /dev/null | sbt clean update dist
      - store_artifacts:
          path: target/universal/samplescala.zip
          destination: samplescala
      - save_cache:
          key: sbt-cache
          paths:
            - "~/.ivy2/cache"
            - "~/.sbt"
            - "~/.m2"
```

Below is an explanation of the preceding example:
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout): basically git clones the project repo from GitHub into the container 
- [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) key: specifies the name of the cache files to restore. The key name is specified in the save_cache key that is found later in the schema. If the key specified is not found then nothing is restored and continues to process.
- [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) command `cat /dev/null | sbt clean update dist`: executes the sbt compile command that generates the package .zip file.
- [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) path: specifies the path to the source file to copy to the ARTIFACT zone in the image.
- [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) path: saves the specified directories for use in future builds when specified in the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) keys.

The final portion of the 2.0 schema are the deploy command keys which move and rename the compiled samplescala.zip to the $CIRCLE_ARTIFACTS/ directory.  The file is then uploaded to the AWS S3 bucket specified.

```yaml
steps:
  - deploy:
      command: |
        mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
        aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

The deploy command is another multi-line execution.

## See Also 
{:.no_toc}

- Refer to the [Migrating Your Scala/sbt Schema from CircleCI 1.0 to CircleCI 2.0](https://circleci.com/blog/migrating-your-scala-sbt-schema-from-circleci-1-0-to-circleci-2-0/) for the original blog post.
- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for more example deploy target configurations.
- How to [parallelize tests in SBT on CircleCI](https://tanin.nanakorn.com/technical/2018/09/10/parallelise-tests-in-sbt-on-circle-ci.html)
