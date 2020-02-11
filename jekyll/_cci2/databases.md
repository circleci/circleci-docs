---
layout: classic-docs
title: "Configuring Databases"
short-title: "Configuring Databases"
description: "Example of Configuring PostgreSQL"
categories: [configuring-jobs]
order: 35
---

This document describes how to use the official CircleCI pre-built Docker container images for a database service in CircleCI 2.0. 

* TOC
{:toc}

## Overview
{:.no_toc}

CircleCI provides pre-built images for languages and services like databases with a lot of conveniences added into the images on [CircleCI Docker Hub](https://hub.docker.com/search?q=circleci&type=image).

The following example shows a 2.0 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file with one job called `build`. Docker is selected for the executor and the first image is the primary container where all execution occurs. This example has a second image and this will be used as the service image. The first image is the programming language Python. The Python image has `pip` installed and `-browsers` for browser testing. The secondary image gives access to things like databases. 

## PostgreSQL Database Testing Example

In the primary image the config defines an environment variable with the `environment` key, giving it a URL. The URL tells it that it is a PostgreSQL database, so it will default to the PostgreSQL default port. This pre-built circleci image includes a database and a user already. The username is `postgres` and database is `circle_test`. So, you can begin with using that user and database without having to set it up yourself. 

Set the POSTGRES_USER environment variable in your CircleCI config to `postgres` to add the role to the image as follows:

          - image: circleci/postgres:9.6-alpine
            environment:
              POSTGRES_USER: postgres

This Postgres image in the example is slightly modified already with `-ram` at the end. It runs in-memory so it does not  hit the disk and that will significantly improve the testing performance on this PostgreSQL database by using this image.

{% raw %}

```yaml
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
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client-9.6
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```

{% endraw %}

The `steps` run `checkout` first, then install the Postgres client tools. The `postgres:9.6.5-alpine-ram` image doesn't install any client-specific database adapters. For example, for Python, you might install `psychopg2` so that you can interface with the PostgreSQL database. See [Pre-Built CircleCI Services Images]({{ site.baseurl }}/2.0/circleci-images/#service-images) for the list of images and for a video of this build configuration.

In this example, the config installs the PostgreSQL client tools to get access to `psql`.  **Note:** that `sudo` is run because the images do not run under the root account like most containers do by default. CircleCI has a circle account that runs commands by default, so if you want to do admin privileges or root privileges, you need to add `sudo` in front of your commands. 

Three commands follow the `postgresql-client-9.6` installation that interact with the database service. These are SQL commands that create a table called test, insert a value into that table, and select from the table. After committing changes and pushing them to GitHub, the build is automatically triggered on CircleCI and spins up the primary container. 

**Note:** CircleCI injects a number of convenience environment variables into the primary container that you can use in conditionals throughout the rest of your build. For example, CIRCLE_NODE_INDEX and CIRCLE_NODE_TOTAL are related to concurrent build environments. See the [Build Specific Environment Variables]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) document for details.

When the database service spins up, it automatically creates the database `circlecitest` and the `root` role that you can use to log in and run your tests. It isn't running as `root`, it is using the `circle` account. Then the database tests run to create a table, insert value into the table, and when SELECT is run on the table, the value comes out.

## Optional Customization

This section describes additional optional configuration for further customizing your build and avoiding race conditions.

### Optimizing Postgres Images
{:.no_toc}

The default `circleci/postgres` Docker image uses regular persistent storage on disk.
Using `tmpfs` may make tests run faster and may use fewer resources. To use a variant
leveraging `tmpfs` storage, just append `-ram` to the `circleci/postgres` tag (i.e., 
`circleci/postgres:9.6-alpine-ram`). 

PostGIS is also available and can be combined with the previous example:
`circleci/postgres:9.6-alpine-postgis-ram`

### Using Binaries
{:.no_toc}

To use `pg_dump`, `pg_restore` and similar utilities requires some extra configuration to ensure that `pg_dump` invocations will also use the correct version. Add the following to your `config.yml` file to enable `pg_*` or equivalent database utilities:

```
     steps:
    # Add the Postgres 9.6 binaries to the path.
       - run: echo 'export PATH=/usr/lib/postgresql/9.6/bin/:$PATH' >> $BASH_ENV
```

### Using Dockerize to Wait for Dependencies
{:.no_toc}

Using multiple Docker containers for your jobs may cause race conditions if the service in a container does not start  before the job tries to use it. For example, your PostgreSQL container might be running, but might not be ready to accept connections. Work around this problem by using `dockerize` to wait for dependencies.
Following is an example of how to do this in your CircleCI `config.yml` file:

```yaml
version: 2.0
jobs:
  build:
    working_directory: /your/workdir
    docker:
      - image: your/image_for_primary_container
      - image: postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: your_postgres_user
          POSTGRES_DB: your_postgres_test
    steps:
      - checkout
      - run:
          name: install dockerize
          command: wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && sudo tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
          environment:
            DOCKERIZE_VERSION: v0.3.0
      - run:
          name: Wait for db
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
```

It is possible to apply the same principle for the following databases:

- MySQL:

`dockerize -wait tcp://localhost:3306 -timeout 1m`

- Redis:

`dockerize -wait tcp://localhost:6379 -timeout 1m`

Redis also has a CLI available:

`sudo apt-get install redis-tools ; while ! redis-cli ping 2>/dev/null ; do sleep 1 ; done`

- Other services such as web servers:

`dockerize -wait http://localhost:80 -timeout 1m`

## See Also
{:.no_toc}

Refer to the [Database Configuration Examples]({{ site.baseurl }}/2.0/postgres-config/) document for additional configuration file examples.


