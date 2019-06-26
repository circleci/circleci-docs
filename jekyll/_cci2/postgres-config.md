---
layout: classic-docs
title: "Database Configuration Examples"
short-title: "Database Configuration Examples"
description: "Example of Configuring PostgreSQL"
categories: [configuring-jobs]
order: 35
---

This document provides example database [config.yml]({{ site.baseurl }}/2.0/databases/) files using PostgreSQL/Rails and MySQL/Ruby in the following sections:

* TOC
{:toc}

## Example CircleCI Configuration for a Rails App With structure.sql

If you are migrating a Rails app configured with a `structure.sql` file make
sure that `psql` is installed in your PATH and has the proper permissions, as
follows, because the circleci/ruby:2.4.1-node image does not have psql installed
by default and uses `pg` gem for database access.

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails
    
    # Primary container image where all commands run
    
    docker:
      - image: circleci/ruby:2.4.1-node
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root
    
    # Service container image available at `host: localhost`
    
      - image: circleci/postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle-test_test
        
    steps:
      - checkout

      # Restore bundle cache
      - restore_cache:
          keys:
            - rails-demo-{{ checksum "Gemfile.lock" }}
            - rails-demo-

      # Bundle install dependencies
      - run:
          name: Install dependencies
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # Store bundle cache
      - save_cache:
          key: rails-demo-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run:
          name: Database Setup
          command: |
            bundle exec rake db:create
            bundle exec rake db:structure:load

      - run:
          name: Parallel RSpec
          command: bin/rails test

      # Save artifacts
      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

**Note:** An alternative is to build your own image by extending the current image,
installing the needed packages, committing, and pushing it to Docker Hub or the
registry of your choosing.

### Example Environment Setup
{:.no_toc}

In CircleCI 2.0 you must declare your database configuration explicitly because multiple pre-built or custom images may be in use. For example, Rails will try to use a database URL in the following order:

1.	DATABASE_URL environment variable, if set
2.	The test section configuration for the appropriate environment in your `config.yml` file (usually `test` for your test suite).

The following example demonstrates this order by combining the `environment` setting with the image and by also including the `environment` configuration in the shell command to enable the database connection:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/appName
    docker:
      - image: ruby:2.3.1-jessie
        environment:
          PG_HOST: localhost
          PG_USER: ubuntu
          RAILS_ENV: test
          RACK_ENV: test
      # The following example uses the official postgres 9.6 image, you may also use circleci/postgres:9.6 
      # which includes a few enhancements and modifications. It is possible to use either image.
      - image: postgres:9.6-jessie
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: db_name
    steps:
      - checkout
      - run:
          name: Install Ruby Dependencies
          command: bundle install
      - run: 
          name: Set up DB
          command: |
            bundle exec rake db:create db:schema:load --trace
            bundle exec rake db:migrate
        environment:
          DATABASE_URL: "postgres://ubuntu@localhost:5432/db_name"
```

This example specifies the `$DATABASE_URL` as the default user and port for PostgreSQL 9.6. For version 9.5, the default port is 5433 instead of 5432. To specify a different port, change the `$DATABASE_URL` and all invocations of `psql`.

## Example Go App with PostgreSQL

Refer to the [Go Language Guide]({{ site.baseurl }}/2.0/language-go/) for a walkthrough of this example configuration and a link to the public code repository for the app.

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.8-jessie
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
        environment:
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go

    environment:
      TEST_RESULTS: /tmp/test-results

    steps:
      - checkout
      - run: mkdir -p $TEST_RESULTS

      - restore_cache:
          keys:
            - v1-pkg-cache

      # Normally, this step would be in a custom primary image;
      # we've added it here for the sake of explanation.
      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      - run:
          name: Waiting for Postgres to be ready
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres && exit 1
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - "/go/pkg"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts
      - store_artifacts:
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results:
          path: /tmp/test-results
```

## Example MYSQL project.

The following example sets up MYSQL as a secondary container alongside a PHP container.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-apache-node-browsers # The primary container where steps are run
      - image: circleci/mysql:8.0.4
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:
      - checkout
      - run:
      # Our primary container isn't MYSQL so run a sleep command until it's ready.
          name: Waiting for MySQL to be ready
          command: |
            for i in `seq 1 10`;
            do
              nc -z 127.0.0.1 3306 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for MySQL && exit 1
      - run:
          name: Install MySQL CLI; Import dummy data; run an example query
          command: |
            sudo apt-get install mysql-client
            mysql -h 127.0.0.1 -u user -ppassw0rd test_db < sql-data/dummy.sql
            mysql -h 127.0.0.1 -u user -ppassw0rd --execute="SELECT * FROM test_db.Persons"
workflows:
  version: 2
  build-deploy:
    jobs:
      - build
```

While it is possible to make MySQL as your primary and only container, this example
does not. As a more practical use case, the example uses a PHP docker image as
its primary container, and will wait until MySQL is up and running before performing any `run` commands
involving the DB.

Once the DB is up, we install the `mysql` client into the primary container so that we can run a command to connect and import the dummy data, presumably found at, `sql-data/dummy.sql` at the root of your project. In this case, that dummy data contains an example set of SQL commands:

```sql
DROP TABLE IF EXISTS `Persons`;

CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
);

INSERT INTO Persons
VALUES (
	1,
	"Foo",
	"Baz",
	"123 Bar Street",
	"FooBazBar City"
);
```


## See Also


Refer to the [Configuring Databases]({{ site.baseurl }}/2.0/databases/) document for a walkthrough of conceptual information about using service images and database testing steps. 
