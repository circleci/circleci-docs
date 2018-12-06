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
target="_blank">Demo Crystal Project on Github</a>

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

We always start with the version of CircleCI to use.

```yaml
version: 2
```

Next, we have the `jobs:` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

We use the [official Crystal Docker
image](https://hub.docker.com/r/crystallang/crystal/) as our primary container.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
jobs:
  build: 
    working_directory: ~/demo_app
    docker:
      - image: crystallang/crystal:0.27.0
```

Next, we'll run a series of commands under the `steps:` key. First we'll try to
restore the cache by checking if anything has changed in the `shard.lock` file.
Then we'll proceed to install dependencies and save the cache if necessary.

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
