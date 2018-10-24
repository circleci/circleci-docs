---
layout: classic-docs
title: "Configuring a Python Application on CircleCI"
short-title: "Python"
description: "Continuous integration with Python on CircleCI"
categories: [language-guides]
order: 7
---

This document describes
how to configure CircleCI
using a sample application written in Python.

* TOC
{:toc}

## Overview

This guide uses a sample Django application
to describe configuration best practices
for Python applications building on CircleCI.
The application is [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-python-django)
and is [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}.

Consider [forking the repository](https://help.github.com/articles/fork-a-repo/)
and rewriting [the configuration file](https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml)
as you follow this guide.

## Configuration Walkthrough

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/).
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
By default,
the value of `working_directory` is `~/project`,
where `project` is a literal string.

```yaml
version: 2
jobs:
  build:  # required for runs that don't use workflows
    working_directory: ~/circleci-demo-python-django
```

### Choose an Executor Type

The steps of a job occur in a virtual environment called an [executor]({{ site.baseurl }}/2.0/executor-types/).

In this example,
the [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) executor is used
to specify a custom Docker image.
The first image listed becomes the job's [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).
All commands for a job execute in this container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4  # primary container for the build job
```

**Note:**
`circleci/python:3.6.4` is a [convenience image]({{ site.baseurl }}/2.0/circleci-images/) provided by CircleCI.
These images are extensions of official Docker images
and include tools useful for CI/CD environments.

### Add Other Services and Set Environment Variables

Specify additional containers for services like databases.
Use the [`environment`]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-container) key
to set environment variables for all commands in a container.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.4 # every job must define an image for the docker executor and subsequent jobs may define a different image.
        environment:
          PIPENV_VENV_IN_PROJECT: true
          DATABASE_URL: postgresql://root@localhost/circle_test?sslmode=disable
      - image: circleci/postgres:9.6.2 # an example of how to specify a service container
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

### Install Dependencies

After choosing containers for a job,
create [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) to run specific commands.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
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
    # ...
    steps:
      - checkout  # checkout source code to working directory
      - run:
          command: |  # use pipenv to install dependencies
            sudo pip install pipenv
            pipenv install
```

### Cache Dependencies

To save time between runs,
consider [caching dependencies or source code]({{ site.baseurl }}/2.0/caching/).

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
    # ...
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

Use the `run` step
to run your test suite.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - run:
        command: |
          pipenv run "python manage.py test"
```

### Upload And Store Test Results

Use the [`store_test_results`]({{ site.baseurl }}/2.0/configuration-reference/#store_test_results) step
to upload test results to CircleCI.
These results will display in the **Test Summary** section of the CircleCI application.

Use the [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) step
to save test results as artifacts.

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
          destination: tr1
```

### Deploy Application

This Django application is not deployed anywhere.
See the [Flask Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) or the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for deploy examples.

## Full Configuration File

{% raw %}

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
    steps:
      - checkout
      - run: sudo chown -R circleci:circleci /usr/local/bin
      - run: sudo chown -R circleci:circleci /usr/local/lib/python3.6/site-packages
      - restore_cache:
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
      - run:
          command: |
            pipenv run "python manage.py test"
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: test-results
          destination: tr1
```

{% endraw %}

## See Also

- See the [Tutorials page]({{ site.baseurl }}/2.0/tutorials/) for other language guides.
