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

The application uses Crystal 0.26 and Kemal 0.24. Both Crystal and Kemal are
developing quickly. Altering the Docker image to the `:latest` version may cause
breaking changes.

## Sample Configuration

{% raw %}
```
version: 2 # use CircleCI 2.0
jobs: # a collection of jobs
  build: 
    working_directory: ~/demo_app
    docker: # run build steps with docker
      - image: crystallang/crystal:0.26.0 # primary docker container; all `steps` will run here.
    steps: # a collection of executable steps
      - checkout # checks out source code to working directory
      - restore_cache: # Restore dependency cache
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

Great! You've set up CircleCI 2.0 for a basic Crystal application.

## Deploy

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
