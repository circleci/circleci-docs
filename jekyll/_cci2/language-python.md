---
layout: classic-docs
title: "Language Guide: Python"
short-title: "Python"
description: "Building and Testing with Python on CircleCI 2.0"
categories: [language-guides]
order: 6
---

## Overview

This guide will help you get started with a Python project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

{% raw %}
```YAML
version: 2
jobs:
  build:
    docker:
      - image: python:3.5
        environment:
          FLASK_CONFIG: testing
          DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
      - image: postgres:9.5.5
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
    working_directory: /home/ubuntu/cci-demo-flask
    steps:
      - checkout
      - run:
          name: Install Yarn
          command: |
            apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68576280 86E50310
            echo "deb http://deb.nodesource.com/node_7.x jessie main" | tee /etc/apt/sources.list.d/nodesource.list
            echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
            apt-get update -qq
            apt-get install -y -qq nodejs yarn
      - restore_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
      - run: yarn && pip install -r requirements.txt
      - save_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
          paths:
            - "/home/ubuntu/.yarn-cache"
      - run: python manage.py test --coverage
      - store_artifacts:
          path: test-reports/coverage
          destination: reports
      - store_test_results:
          path: "test-reports/"
```
{% endraw %}

## Get the Code

The configuration above is from a demo Python/flask app, which you can access at [https://github.com/circleci/cci-demo-flask](https://github.com/circleci/cci-demo-flask).

Fork the project and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

---

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

We also need to specify container images for this build in `docker`.

We'll need to tell the Flask app to run in `testing` mode by setting it in `environment`, as well as where to find the database (DB). This is a special local URL linked to an additional Docker container.

```YAML
...
jobs:
  build:
    docker:
      - image: python:3.5
        environment:
          FLASK_CONFIG: testing
          DATABASE_URL: postgresql://ubuntu@localhost/circle_test?sslmode=disable
```

We'll also create a container for PostgreSQL, along with 3 environment variables for initializing the database.

```YAML
...
      - image: postgres:9.5.5
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: circle_test
          POSTGRES_PASSWORD: ""
```

In each job, we specify a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
...
    working_directory: /home/ubuntu/cci-demo-flask
```

Now we need to add several `steps` within the `build` job.

You could install NPM, but we’re going to use Yarn for reasons that are outside the scope of this document.

```YAML
...
    steps:
      - checkout
      - run:
          name: Install Yarn
          command: |
            apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68576280 86E50310
            echo "deb http://deb.nodesource.com/node_7.x jessie main" | tee /etc/apt/sources.list.d/nodesource.list
            echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
            apt-get update -qq
            apt-get install -y -qq nodejs yarn
```

Let's restore the Yarn package cache if it's available.

{% raw %}
```YAML
...
      - restore_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
```
{% endraw %}

Install both Yarn and Python dependencies.

```YAML
...
      - run: yarn && pip install -r requirements.txt
```

Specify where to save that Yarn cache.

{% raw %}
```YAML
...
      - save_cache:
          key: projectname-{{ .Branch }}-{{ checksum "yarn.lock" }}
          paths:
            - "/home/ubuntu/.yarn-cache"
```
{% endraw %}

Run our tests.

```YAML
...
      - run: python manage.py test --coverage
```

Store test results as an artifact.

```YAML
...
      - store_artifacts:
          path: test-reports/coverage
          destination: reports
```

Finally, let's specify where those test results are actually located.

```YAML
...
      - store_test_results:
          path: "test-reports/"
```

Nice! You just set up CircleCI for a Flask app. Nice! Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-flask).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
