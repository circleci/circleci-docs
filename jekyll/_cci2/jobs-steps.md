---
layout: classic-docs
title: "Jobs, Steps, and Workflows"
short-title: "Jobs, Steps, and Workflows"
description: "Description of Jobs and Steps"
categories: [migration]
order: 2
---

The document provides an overview of Jobs and Steps, new [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) keys that are nested inside Steps, and new keys for Workflows.

* TOC
{:toc}

## Jobs Overview

Jobs are a collection of Steps. All of the steps in the job are executed in a single unit which consumes a CircleCI container from your plan while it's running.

Jobs and Steps enable greater control and provide a framework for workflows and status on each phase of a run to report more frequent feedback. The following diagram illustrates how data flows between jobs. Workspaces persist data between jobs in a single Workflow. Caching persists data between the same job in different Workflow builds. Artifacts persist data after a Workflow has finished.

![header]( {{ site.baseurl }}/assets/img/docs/Diagram-v3--Default.png)

In 2.0 Jobs can be run using the `machine` executor which enables reuse of recently used `machine` executor runs, or the `docker` executor which can compose Docker containers to run your tests and any services they require, such as databases, or the `macos` executor.

When using the `docker` executor the container images listed under the `docker:` keys specify the containers to start.  Any public Docker images can be used with the `docker` executor.

See the [Specifying Container Images]({{ site.baseurl }}/2.0/executor-types/) document for more information about `docker` versus `machine` use cases and comparisons.

## Steps Overview

Steps are a collection of executable commands which are run during a job, the `checkout:` key is required to checkout your code and a key for `run:` enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, keys for `save_cache:`, `restore_cache:`,  `deploy:`, `store_artifacts:`, `store_test_results:` and `add_ssh_keys` are nested under Steps.

## Sample Configuration with Parallel Jobs

Following is a sample 2.0 `.circleci/config.yml` file.

{% raw %}
```
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```
{% endraw %}
This example shows a parallel job workflow where the `build` and `test` jobs run in parallel to save time. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with parallel, sequential, and manual approval workflows.

## See Also

- [Configuration Reference Jobs Key]({{ site.baseurl }}/2.0/configuration-reference/#jobs)
- [Configuration Reference Steps Key]({{ site.baseurl }}/2.0/configuration-reference/#steps)
