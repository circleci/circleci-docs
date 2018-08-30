---
layout: classic-docs
title: "Language Guide: Python"
short-title: "Python"
description: "Building and Testing with Python on CircleCI 2.0"
categories: [language-guides]
order: 7
---

This document describes the [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for a sample application written in Python. 

* TOC
{:toc}

## Demo Python Django Reference Project

We maintain a reference Python Django project to show how to build Django on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-python-django" target="_blank">Demo Python Django Project on GitHub</a>
[Demo Python Django Project building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with Python projects.

Refer to the [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) for a sample Flask application: <https://github.com/CircleCI-Public/circleci-demo-python-flask>.

## Pre-Built CircleCI Docker Images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Python version you need from Docker Hub: <https://hub.docker.com/r/circleci/python/>. The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available on Docker Hub in the `circleci` directory.

## Build the Demo Django Project 

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account.
2. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to the project you just forked.
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

## Config Walkthrough

Start with the version:

```yaml
version: 2 # use CircleCI 2.0
```

First, specify a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. The sample app only needs a `build` job, so all other configuration will be nested under that key.

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
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples    
```

{% endraw %}

For the complete list of CircleCI configuration keys,
refer to the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

## See Also
{:.no_toc}

- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.
- See the [Caching Dependencies]({{ site.baseurl }}/2.0/caching/) document for caching strategies.



