---
layout: classic-docs
title: "Language Guide: Python"
short-title: "Python"
description: "Continuous integration and deployment with Python on CircleCI"
categories: [language-guides]
order: 7
---

This document describes
how to use CircleCI
using a sample application written in Python.

* TOC
{:toc}

## Overview

This guide uses a [sample Django application](https://github.com/CircleCI-Public/circleci-demo-python-django)
to describe configuration best practices
for Python applications building on CircleCI.
Consider [forking this repository](https://help.github.com/articles/fork-a-repo/)
and rewriting the configuration file
while following this guide.

## Configuration Walkthrough

Every CircleCI project requires a configuration file called `.circleci/config.yml`.
Follow the steps below
to create a complete `config.yml` file.

### Specify a Version

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used
to issue warnings about breaking changes.

```yaml
version: 2
```

### Create a Build Job

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs).
Because this run does not use [workflows]({{ site.baseurl }}/2.0/configuration-reference/#workflows),
it must have a `build` job.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
```

The [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key is used to specify
where the job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run.

## Pre-Built CircleCI Docker Images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Python version you need from Docker Hub: <https://hub.docker.com/r/circleci/python/>. The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available on Docker Hub in the `circleci` directory.

### Specify a Python version (pick a Docker image)

### Add additional services (databases, etc.)

### Install package managers and dependencies

### Set up caching rules for dependencies

### Run test suites

### Deploy the application

Specify a working directory and container images for this build in `docker` section:

```yaml
...
jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    working_directory: ~/circleci-demo-python-django # directory where steps will run
    docker: # run the steps with Docker
      - image: circleci/python:3.6.1 # ...with this image as the primary container; this is where all `steps` will run
      - image: circleci/postgres:9.6.2 # database image for service container available at `localhost:<port>`
        environment: # environment variables for database
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

Finally, add several `steps` within the `build` job:

{% raw %}

```yaml
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
      - run: # run tests
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts: # special step to store test reports as artifacts
          path: test-reports/
          destination: tr1
```

{% endraw %}

For the complete list of CircleCI configuration keys,
refer to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

## See Also
{:.no_toc}

- See the [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) document for a sample Flask application.
- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
- See the [Caching Dependencies]({{ site.baseurl }}/2.0/caching/) document for caching strategies.
