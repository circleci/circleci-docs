---
layout: classic-docs
title: "Language Guide: Crystal"
short-title: "Crystal"
description: "Building and Testing with Crystal on CircleCI 2.0"
categories: [language-guides]
order: 9
---

*[Tutorials & 2.0 Sample Apps]({{ site.baseurl }}/2.0/tutorials/) > Language Guide: Crystal*

This guide will help you get started with a minimal Crystal application on CircleCI. 

## Overview

If you’re in a rush, just copy the sample configuration below into a `.circleci/config.yml` in your project’s root directory and start building.

You can view an example Crystal project at the following link:

- <a href="https://github.com/CircleCI-Public/circleci-demo-crystal"
target="_blank">Demo Crystal Project on GitHub</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-crystal/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>.

The application uses Crystal 0.27 and Kemal 0.25. Both Crystal and Kemal are
developing quickly. Altering the Docker image to the `:latest` version may cause
breaking changes.

## Sample Configuration

{% raw %}
```yaml
version: 2 # use CircleCI 2.0
jobs: # a collection of jobs
  build: 
    working_directory: ~/demo_app
    docker: # run build steps with docker
      - image: crystallang/crystal:0.27.0 # primary docker container; all `steps` will run here.
    steps: # a collection of executable steps
      - checkout # checks out source code to working directory
      - restore_cache: # Restore dependency cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: Install dependencies.
          command: shards install
      - save_cache: # Step to save dependency cache
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
      - run:
          name: test
          command: crystal spec
# See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples    
```
{% endraw %}

## Config Walkthrough

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs).
Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows),
it must have a `build` job.

Use the [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key
to specify where a job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run.
By default, the value of `working_directory` is `~/project`, where `project` is a literal string.

The steps of a job occur in a virtual environment called an [executor]({{
site.baseurl }}/2.0/executor-types/). In this example, we use the [official Crystal Docker
image](https://hub.docker.com/r/crystallang/crystal/) as our primary container.
All commands for a job execute in this container.

```yaml
jobs:
  build: 
    working_directory: ~/demo_app
    docker:
      - image: crystallang/crystal:0.27.0
```

After choosing containers for a job, create [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) to run specific commands.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
to check out source code. By default, source code is checked out to the path specified by `working_directory`.

To save time between runs, consider [caching dependencies or source code]({{ site.baseurl }}/2.0/caching/).

Use the [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) step
to cache certain files or directories. In this example, the installed packages ("Shards") are cached.

Use the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) step
to restore cached files or directories. In this example, we use a checksum of
the `shard.lock` file to determine if the dependency cache has changed.

{% raw %}
```yaml
    steps: #
      - checkout
      - restore_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: Install dependencies.
          command: shards install
      - save_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
```
{% endraw %}

Finally, we run `crystal spec` to run the project's test suite.

```yaml
      - run:
          name: test
          command: crystal spec
```

Great! You've set up CircleCI 2.0 for a basic Crystal application.

## Deploy

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
