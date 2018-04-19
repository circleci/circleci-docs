---
layout: classic-docs
title: "Configuring Databases"
short-title: "Configuring Databases"
description: "Example of Configuring PostgreSQL"
categories: [configuring-jobs]
order: 35
---

*[Test]({{ site.baseurl }}/2.0/test/) > Configuring Databases*

* TOC
{:toc}

This document describes how to use the official CircleCI pre-built Docker container images for a database service in CircleCI 2.0. 

## Overview

CircleCI provides pre-built images for languages and services like databases with a lot of conveniences added into the images on [CircleCI Docker Hub](https://hub.docker.com/r/circleci/).

The following example shows a 2.0 `.circleci/config.yml` file with one job called `build`. Docker is selected for the executor and the first image is the primary container where all execution occurs. This example has a second image and this will be used as the service image. The first image is the programming language Python. The Python image has `pip` installed and `-browsers` for browser testing. The secondary image gives access to things like databases. 

## PostgreSQL Database Testing Example

In the primary image the config defines an environment variable with the `environment` key, giving it a URL. The URL tells it that it is a PostgreSQL database, so it will default to the PostgreSQL default port. This pre-built circleci image includes a database and a user already. The username is `root` and database is `circletest`. So, you can begin with using that user and database without having to set it up yourself. 

This Postgres image in the example is slightly modified already with `-ram` at the end. It runs in-memory so it does not  hit the disk and that will significantly improve the testing performance on this PostgreSQL database by using this image.

{% raw %}
```
version: 2
jobs:
  build:
    
    # Primary container image where all commands run
    
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test
          
    # Service container image
    
      - image: circleci/postgres:9.6.5-alpine-ram
        
    steps:
      - checkout
      - run: sudo apt install postgresql-client-9.6
      - run: whoami
      - run: | 
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: | 
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test (name char(25));"
      - run: | 
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```
{% endraw %}

The `steps` run `checkout` first, then install the Postgres client tools. The `postgres:9.6.5-alpine-ram` image doesn't install any client-specific database adapters. For example, for Python, you might install `psychopg2` so that you can interface with the PostgreSQL database. See [Pre-Built CircleCI Images]({{ site.baseurl }}/2.0//circleci-images/) for the list of images and for a video of this build configuration.

In this example, the config installs the PostgreSQL client tools to get access to `psql`.  **Note:** that `sudo` is run because the images do not run under the root account like most containers do by default. CircleCI has a circle account that runs commands by default, so if you want to do admin priviledges or root priviledges, you need to add `sudo` in front of your commands. 

Three commands follow the `postgresql-client-9.6` installation that interact with the database service. These are SQL commands that create a table called test, insert a value into that table, and select from the table. After committing changes and pushing them to GitHub, the build is automatically triggered on CircleCI and spins up the primary container. 

**Note:** CircleCI injects a number of convenience environment variables into the primary container that you can use in conditionals throughout the rest of your build. For example, CIRCLE_NODE_INDEX and CIRCLE_NODE_TOTAL are related to parallel builds see the [Build Specific Environment Variables]({{ site.baseurl }}/2.0/env-vars/#build-specific-environment-variables) document for details.

When the database service spins up, it automatically creates the database `circlecitest` and the `root` role that you can use to log in and run your tests. It isn't running as `root`, it is using the `circle` account. Then the database tests run to create a table, insert value into the table, and when SELECT is run on the table, the value comes out.

