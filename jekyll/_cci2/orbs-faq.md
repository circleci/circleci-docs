---
layout: classic-docs
title: "Orbs FAQ"
short-title: "Orbs FAQ"
description: "FAQs for Orbs"
categories: [configuring-jobs]
order: 20
---

This document describes various questions and technical issues that you may find helpful when working with Orbs.

* TOC
{:toc}

## Introduction
{:.no_toc}

When using Orbs or authoring your own Orbs, you may come across some issues that may not be directly addressed in the documentation. This section attempts to address specific issues and questions that have been relayed to CircleCI during the initial design and development phases with internal and external customers. Because Orbs development and design will be a continuous process, this section will be frequently updated as needed to ensure you the latest technical information is available.

### Downloading, Integrating, and Testing Orbs

* Question: How do I download, integrate and test Orbs?

* Answer: You can invoke Orbs using the `orbs` stanza in version 2.1 or higher of a CircleCI configuration. For example, if you want to publish an Orb called  `hello-build` in the namespace `circleci` and have a published version `0.0.1`, invoke an orb like the example shown below:

```orbs:
hello: circleci/hello-build@0.0.1
```

You may then use the elements of that orb in your configuration by referencing these elements under the key `hello`. For example, if an orb has a job called `hello-build`, you can invoke that job in a workflow like the example shown below.

```workflows:
  info:
    jobs:
      - hello/hello-build
```

CircleCI will publish a web-based registry viewer in the future so Orbs documentation can be auto-generated. In the meantime, you can always pull the source of Orbs directly. For example, you can run `circleci orb source circleci/hello-build@0.01`

### Build Error When Testing Locally

* Question: Why do I get the following error when testing locally:

```circleci build -c .circleci/jobs.yml --job test
```

```Error:
You attempted to run a local build with version 2.1 of configuration.
```

* Answer: To resolve this error, run `circleci config process` on your configuration and then save that configuration to disk. You then should run `circleci build` (this has now been moved to `circleci local execute`) against the processed configuration.

### Environment Variables Not Being Passed at Runtime

Occasionally, when you try to convert a configuration to a 2.0 compatible format, environment variables may not be passed at runtime. For example, if you create a simple configuration in your GitHub repository (for example `https://github.com/yourusername/circle-auto/blob/master/.circleci/echo.yml`) and then call the config using:

```export AUTO_FILE=/Users/yourusername/Desktop/apkpure_app_887.apk
export AUTO_DIR=.
circleci build -c .circleci/echo.yml --job test
```

The config shows:

```#!bin/bash -eo pipefail
echo file $(AUTO_FILE) dir $(AUTO_DIR)
file directlySuccess!
```
Upon execution, you may see the following response:

.circleci/echo.yml

```version: 2
jobs:
  build:
    docker:
    - image: circleci/openjdk:8-jdk
    steps:
    - checkout
  test:
    docker:
    - image: circleci/openjdk:8-jdk
    environment:
    - TERM: dumb
    steps:
    - checkout
    - run:
        command: "echo file ${AUTO_FILE} dir ${AUTO_DIR}"
workflows:
  version: 2
  workflow:
    jobs:
    - build
    - test```

yourusername/circle-autoAdded by GitHub
```

### Standard Process To Access Previously Stored Artifacts

* Question: When developing plugins (especially ones that test mobile binary), is there a standard way to access previously stored artifacts and store them consistently?

* Answer: If you are simply passing elements across jobs, CircleCI recommends using our workspaces rather than artifacts because workspaces can be saved in one job and restored another. Artifacts are designed for elements that need to be retrieved after execution is over. There is an API for artifacts; however, CircleCI does not have the type of first-class retrieval of "the artifact created in the upstream job" developed yet.

### Logging Outputs

* Question: Is there a standard way to to log output? For example, Jenkins plugins provide console links to show the log output and provides hooks to log those messages. It is possible to log to stdout, but is there a better way to log those log messages.

* Answer: In CircleCI, whatever steps are run are logged, so any output from those steps will appear in the console. You can shoe to `echo` things directly. CircleCI does not have a separate logging facility outside the console output.

### Failing Builds

Question: How can I intentionally fail a build that invokes an orb from within an orb?

Answer: You can always return a non-zero status code from the shell to fail the job. You can also use `run:circleci-agent step halt` as a step to exit the job without failing.
