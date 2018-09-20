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
Consider [forking the repository](https://help.github.com/articles/fork-a-repo/)
and rewriting the configuration file
while you follow this guide.

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

Use the [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) key
to specify where a job's [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) run.

```yaml
version: 2
jobs:
  build:  # required for runs that don't use workflows
    working_directory: ~/circleci-demo-python-django
```

### Choose an Executor Type

A job's steps occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-types/).

In this example,
the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used
to specify a custom Docker image.
The first image listed becomes the job's [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).
All of a job's commands execute in this container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4  # primary container
```

**Note:**
`circleci/python:3.6.4` is a [convenience image]({{ site.baseurl }}/2.0/circleci-images/) provided by CircleCI.
These images are extensions of official Docker images
and include tools useful for CI/CD environments.

### Add Other Services and Set Environment Variables

You can specify additional containers for services like databases.
Use the [`environment`]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-container) key
to set environment variables for all commands in a container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

### Install Dependencies

After choosing containers for a job,
create [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) to run specific commands.

Use the special [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
to check out source code.
By default,
source code is checked out to the path specified by `working_directory`.

Use the [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) step
to execute bash commands.
In this example,
[Pipenv](https://pipenv.readthedocs.io/en/latest/) is used
to create a virtual environment
and install Python packages.

```yaml
version: 2
jobs:
  build:
    ...
    steps:
      - checkout  # checkout source code to working directory
      - run:
        command: |  # use pipenv to install dependencies
          sudo pip install pipenv
          pipenv install
```

### Create Caching Rules

To save time between runs,
consider [caching dependencies and source code]({{ site.baseurl }}/2.0/caching/).

Use the [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) step
to cache certain files or directories.
In this example,
the virtual environment and installed packages are cached.

Use the [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) step
to restore cached files or directories.

{% raw %}

```yaml
version: 2
jobs:
  build:
    ...
    steps:
      - checkout
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:  # ensure this step occurs *before* installing dependencies
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
      - run:
        command: |
          sudo pip install pipenv
          pipenv install
      - save_cache:
          key: deps9-{{ .Branch }}-{{ checksum "Pipfile.lock" }}
          paths:
            - ".venv"
            - "/usr/local/bin"
            - "/usr/local/lib/python3.6/site-packages"
```

{% endraw %}

**Note:**
Use the `chown` command
to grant CircleCI access to dependency locations.

### Run Tests

### Store Test Results

### Deploy Application

For the complete list of CircleCI configuration keys,
refer to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

## See Also
{:.no_toc}

- See the [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) document for a sample Flask application.
- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
- See the [Caching Dependencies]({{ site.baseurl }}/2.0/caching/) document for caching strategies.
