---
layout: classic-docs
title: "Optimizations"
short-title: "Optimizations"
description: "CircleCI 2.0 build optimizations"
categories: [getting-started]
order: 1
---
Get started with speeding up your job runs, workflows, and image builds with the following example snippets.

## Caching Dependencies     

{% raw %}

```
    steps: # a collection of executable commands
      - checkout # special step to check out source code to the working directory
      - restore_cache: # restores saved dependency cache if the Branch key template or requirements.txt files have not changed since the previous run
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # install and activate virtual environment with pip
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # special step to save dependency cache
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```            

{% endraw %}

## Parallelism

```
# ~/.circleci/config.yml
version: 2
jobs:
  docker:
    - image: circleci/<language>:<version TAG>
  test:
    parallelism: 4
```


## Docker Layer Caching 

DLC is a premium feature and you must open a support ticket to enable it on your account for an additional fee.

```
version: 2
jobs:
 build:
   docker:
     # DLC does nothing here, its caching depends on commonality of the image layers.
      - image: circleci/node:9.8.0-stretch-browsers
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```      

## See Also

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)
