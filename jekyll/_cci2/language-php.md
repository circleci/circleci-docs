---
layout: classic-docs
title: "Language Guide: PHP"
short-title: "PHP"
description: "Building and Testing with PHP on CircleCI 2.0"
categories: [language-guides]
order: 6
---

This document provides a walkthrough of the [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for a PHP sample application.

* TOC
{:toc}

## Quickstart: Demo PHP Laravel reference project

We maintain a reference PHP Laravel project to show how to build PHP on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel" target="_blank">Demo PHP Laravel Project on GitHub</a>
- [Demo PHP Laravel Project building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-php-laravel/blob/circleci-2.0/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with PHP projects.

## Pre-Built CircleCI Docker Images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the PHP version you need from [Docker Hub](https://hub.docker.com/r/circleci/php/). The demo project uses an official CircleCI image.

Database images for use as a secondary 'service' container are also available.

## Build the Demo PHP project Yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

---

## Sample Configuration

Following is the commented `.circleci/config.yml` file in the demo project.

{% raw %}
```yaml
version: 2 # use CircleCI 2.0

jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker 
      - image: circleci/php:7.1-node-browsers # ...with this image as the primary container; this is where all `steps` will run
    working_directory: ~/laravel # directory where steps will run
    steps: # a set of executable commands
      - checkout # special step to check out source code to working directory
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
      - restore_cache: # special step to restore the dependency cache if `composer.lock` does not change
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/2.0/caching/)
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: # special step to save the dependency cache with the `composer.lock` cache key template
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache: # special step to restore the dependency cache if `package.json` does not change
          keys:
            - node-v1-{{ checksum "package.json" }}
            # fallback to using the latest cache if no exact match is found (See https://circleci.com/docs/2.0/caching/)
            - node-v1-
      - run: yarn install
      - save_cache: # special step to save the dependency cache with the `package.json` cache key template
          key: node-v1-{{ checksum "package.json" }}
          paths:
            - node_modules
      - run: touch storage/testing.sqlite 
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples    
```
{% endraw %}

## Config Walkthrough

We always start with the version of CircleCI to use.

```yaml
version: 2
```

Next, we have a `jobs:` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

We use the [CircleCI-provided PHP docker image](https://circleci.com/docs/2.0/circleci-images/#php) which includes
browser tooling.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-node-browsers 
    working_directory: ~/laravel 
```

Next, we'll run a series of commands under the `steps:` key. Below we install
some PHP tooling allowing up to manage our dependencies.

{% raw %}
```yaml
    steps:
      - checkout
      - run: sudo apt install -y libsqlite3-dev zlib1g-dev
      - run: sudo docker-php-ext-install zip
      - run: sudo composer self-update
```
{% endraw %}

Before installing our dependencies, we can check if there is a cache to restore
the dependencies from. The cache key will be based on a checksum of the
`composer.lock` file, but will fall back to using a more generic cache key. 

The next set of steps for the config are all related to dependency management
and caching. The sample project caches both PHP dependencies and JavaScript dependencies.

{% raw %}
```yaml
      - restore_cache: 
          keys:
            - composer-v1-{{ checksum "composer.lock" }}
            - composer-v1-
      - run: composer install -n --prefer-dist
      - save_cache: 
          key: composer-v1-{{ checksum "composer.lock" }}
          paths:
            - vendor
      - restore_cache:
          keys:
            - node-v1-{{ checksum "package.json" }}
            - node-v1-
      - run: yarn install
      - save_cache: 
          key: node-v1-{{ checksum "package.json" }}
          paths:
            - node_modules
```
{% endraw %}

Finally, we will set up a test database with Sqlite, run migrations and run tests.

```yaml
      - run: touch storage/testing.sqlite 
      - run: php artisan migrate --env=testing --database=sqlite_testing --force
      - run: ./vendor/bin/codecept build
      - run: ./vendor/bin/codecept run
```

---

Success! You just set up CircleCI 2.0 for a PHP app. Check out our project’s [Job page](https://circleci.com/gh/CircleCI-Public/circleci-demo-php-laravel){:rel="nofollow"} to see how this looks when building on CircleCI.

## See Also
{:.no_toc}

- See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.

- Refer to the [Examples]({{ site.baseurl }}/2.0/examples/) page for more configuration examples of public PHP projects.

- If you're new to CircleCI 2.0, we recommend reading our [Project Walkthrough]({{ site.baseurl }}/2.0/project-walkthrough/) for a detailed explanation of our configuration using Python and Flask as an example.
