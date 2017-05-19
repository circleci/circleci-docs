---
layout: classic-docs
title: "Language Guide: Python"
short-title: "Python"
description: "Overview and sample config for a Python project"
categories: [language-guides]
order: 6
---

## New to CircleCI 2.0?

If you're new to CircleCI 2.0, we recommend reading our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) for a detailed explanation of our configuration using Python and Flask as an example.

## Quickstart: demo Python Django reference project

We maintain a reference Python Django project to show how to build Django on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-python-django"> target="_blank">Demo Python Django Project on GitHub</a>
- <a href="https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django"> target="_blank">Demo Python Django Project building on CircleCI</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-python-django/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with Python projects.

## Alternative: Python Flask demo reference project

The [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) uses a Flask application: <https://github.com/CircleCI-Public/cci-demo-python-flask>

## Pre-built CircleCI Docker images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Python version you need from Docker Hub: <https://hub.docker.com/r/circleci/python/>. The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available.

## Build the demo Django project yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.
---

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

We need to specify a working directory container images for this build in `docker` section:

```YAML
...
jobs:
  build:
    working_directory: ~/circleci-demo-python-django
    docker:
      - image: circleci/python:3.6.1
      - image: circleci/postgres:9.6.2
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

Now we need to add several `steps` within the `build` job:


```YAML
    steps:
      - checkout
      - restore_cache:
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run:
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache:
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
      - run:
          command: |
            . venv/bin/activate
            python manage.py test
      - store_artifacts:
          path: test-reports/
          destination: tr1
```

You can learn more about each of these steps in our [configuration reference]({{ site.baseurl }}/2.0/configuration-reference/)

Success! You just set up CircleCI 2.0 for a Python Django app. Check out our [project’s build page](https://circleci.com/gh/CircleCI-Public/circleci-demo-python-django) to see how this looks when building on CircleCI.

If you have any questions about the specifics of testing your Python application, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
