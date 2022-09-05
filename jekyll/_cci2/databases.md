---
layout: classic-docs
title: "Configuring Databases"
short-title: "Configuring Databases"
description: "This document describes how to use the official CircleCI pre-built Docker container images for a database service in CircleCI."
order: 35
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes how to use the official CircleCI pre-built Docker container images for a database service in CircleCI.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

CircleCI provides pre-built images for languages and services like databases with a lot of conveniences added into the images on [CircleCI Developer Hub](https://circleci.com/developer/images).

The following example shows a [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file with one job called `build`. Docker is selected for the executor and the first image is the primary container where all execution occurs. This example has a second image and this will be used as the service image. The first image is the programming language Python. The Python image has `pip` installed and `-browsers` for browser testing. The service image gives access to additional services like databases.

## PostgreSQL database testing example
{: #postgresql-database-testing-example }

In the primary image, the config defines an environment variable with the `environment` key, giving it a URL. The URL tells it that it is a PostgreSQL database, so it will default to the PostgreSQL default port. This pre-built circleci image includes a database and a user already. The username is `postgres` and database is `circle_test`. So, you can begin with using that user and database without having to set it up yourself.

Set the `POSTGRES_USER` environment variable in your CircleCI config to `postgres` to add the role to the image as follows:

```yml
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
```

{% raw %}

```yml
version: 2.1

jobs:
  build:

    # Primary container image where all commands run
    docker:
      - image: cimg/python:3.10
        environment:
          TEST_DATABASE_URL: postgresql://postgres@localhost/circle_test
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    # Service container image
      - image: cimg/postgres:14.0
        environment:
          POSTGRES_USER: postgres
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
```

{% endraw %}

The `steps` run `checkout` first, then install the Postgres client tools. The `cimg/postgres:14.0` image doesn't install any client-specific database adapters. For example, for Python, you might install [`psycopg2`](https://www.psycopg.org/) so that you can interface with the PostgreSQL database. See [Pre-Built CircleCI Services Images]({{ site.baseurl }}/circleci-images/#next-gen-service-images) for the list of images.

In this example, the config installs the PostgreSQL client tools, `postgresql-client` via `apt-get`, to get access to `psql`. Installing packages in images requires administrator privileges, therefore `sudo` is used - a password is not required.

Two commands follow the `postgresql-client` installation that interact with the database service. These are SQL commands that create a table called test and insert a value into that table. After committing changes and pushing them, the build is automatically triggered on CircleCI and spins up the primary container.

**Note:** CircleCI injects a number of convenience environment variables into the primary container that you can use in conditionals throughout the rest of your build. For example, CIRCLE_NODE_INDEX and CIRCLE_NODE_TOTAL are related to concurrent execution environments. See the [Build Specific Environment Variables]({{ site.baseurl }}/env-vars/#built-in-environment-variables) document for details.

When the database service spins up, it automatically creates the database `circle_test` and the `postgres` role that you can use to log in and run your tests. Then the database tests run to create a table and insert a value into it.

## Optional customization
{: #optional-customization }

This section describes additional optional configuration for further customizing your build and avoiding race conditions.

### Optimizing PostgreSQL images
{: #optimizing-postgresql-images }
{:.no_toc}

The `cimg/postgres` Docker image uses regular persistent storage on disk. Storing the database in a ramdisk may improve performance. This can be done by setting the `PGDATA: /dev/shm/pgdata/data` environment variable in the service container image config.

### Using binaries
{: #using-binaries }
{:.no_toc}

To use `pg_dump`, `pg_restore` and similar utilities requires some extra configuration to ensure that `pg_dump` invocations will also use the correct version. Add the following to your `config.yml` file to enable `pg_*` or equivalent database utilities:

```yml
    steps:
    # Add the Postgres 12.0 binaries to the path.
       - run: echo 'export PATH=/usr/lib/postgresql/1bin/:$PATH' >> $BASH_ENV
```

### Using Dockerize to wait for dependencies
{: #using-dockerize-to-wait-for-dependencies }
{:.no_toc}

Using multiple Docker containers for your jobs may cause race conditions if the service in a container does not start  before the job tries to use it. For example, your PostgreSQL container might be running, but might not be ready to accept connections. Work around this problem by using `dockerize` to wait for dependencies.
Following is an example of how to do this in your CircleCI `config.yml` file:

```yml
version: 2.0
jobs:
  build:
    working_directory: /your/workdir
    docker:
      - image: your/image_for_primary_container
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: your_postgres_user
          POSTGRES_DB: your_postgres_test
    steps:
      - checkout
      - run:
          name: install dockerize
          command: wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && sudo tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
          environment:
            DOCKERIZE_VERSION: v0.6.1
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

## See also
{: #see-also }
{:.no_toc}

Refer to the [Database Configuration Examples]({{ site.baseurl }}/postgres-config/) document for additional configuration file examples.

