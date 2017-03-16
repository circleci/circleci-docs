---
layout: classic-docs
title: "Language Guide: Go"
short-title: "Go"
categories: [language-guides]
order: 3
---

## Overview

This guide will help you get started with a Go project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

``` YAML
version: 2
jobs:
  build:
    docker:
      # using custom image, see .circleci/images/primary/Dockerfile
      - image: circleci/cci-demo-go-primary:0.0.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: contacts

    working_directory: /go/src/github.com/circleci/cci-demo-go

    environment:
      TEST_RESULTS: /tmp/test-results

    steps:
      - checkout

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

      - run: mkdir -p $TEST_RESULTS

      # This should be in custom primary image, here is just for the sake of explanation
      - run:
          name: Install JUnit
          command: go get github.com/jstemmer/go-junit-report

      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://ubuntu@localhost:5432/contacts?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/circleci/cci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out

      - run:
          name: Build service
          command: make

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://ubuntu@localhost:5432/contacts?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/circleci/cci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: Validate service is working
          command: curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test

      - store_test_results:
          path: /tmp/test-results
```

## Get the Code

The configuration above is from a demo Go app, which you can access at [https://github.com/circleci/cci-demo-go](https://github.com/circleci/cci-demo-go).

Fork the project and download it to your machine. Then, [add the project]({{ site.baseurl }}/2.0/first-steps/#adding-projects) through CircleCI. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

---

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Every config file must have a ‘build’ job. This is the only job that will be automatically picked up and run by CircleCI.

In the job, we have the option of specifying a `working_directory`. Go is very strict about the structure of the [Go Workspace](https://golang.org/doc/code.html#Workspaces), so we’ll need to specify a path that satisfies those requirements.

```YAML
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/circleci/cci-demo-go
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) images for this job under `docker`.

```YAML
    docker:
      - image: circleci/cci-demo-go-primary:0.0.2
```

We'll use a custom image which is based on `golang:1.8.0` and includes also `netcat` (we'll need it later). You can see complete `Dockerfile` [here](https://github.com/circleci/cci-demo-go/blob/master/.circleci/images/primary/Dockerfile). This is a recommended practice to build custom images with all required tools preinstalled. This way we remove clutter of additional steps from config and save some time for each build.

We'll also create a container for PostgreSQL, along with 2 environment variables for initializing the database. Read more about available customizations in [Postgres's Docker Hub repo](https://hub.docker.com/_/postgres/)

```YAML
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: contacts
```

Now we need to add several `steps` within the `build` job.

The `checkout` step will default to the `working_directory` we have already defined.

```YAML
    steps:
      - checkout
```

Next we create a directory for collecting test results

``` YAML
      - run: mkdir -p $TEST_RESULTS
```

And install the Go implementation of the JUnit reporting tool. This is another good candidate to be preinstalled in primary container.

```YAML
      - run:
        name: Install JUnit
        command: go get github.com/jstemmer/go-junit-report
```

Both containers (primary and postgres) start simultaneously, however Postgres may require some time to get ready and if our tests start before that - job will fail. So it's a good practice to wait until dependent services are ready. Here we have only Postgres, so we have this step:

``` YAML
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
```

This is why we need to have `netcat` installed, to use it to validate that certain port is open.

Now we have to actually run our tests. To do that, we need to set an environment variable for our database's URL and path to DB migrations files. Step will also have some additional commands, we'll explain them right below.

```YAML
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://ubuntu@localhost:5432/contacts?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/circleci/cci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
```

Our project uses `make` for building and testing (you can see `Makefile` [here](https://github.com/circleci/cci-demo-go/blob/master/Makefile)), so we can just run `make test`. In order to collect test results and upload them later (read more about [test results]({{ site.baseurl }}/2.0/project-walkthrough/#store-test-results)) we have to use `go-junit-report`, so we can do it like this:

``` YAML
make test | go-junit-report > ${TEST_RESULTS}/go-test-report.xml
```

However in this case all output from `make test` will go straight into `go-junit-report` without appearing in `stdout`. We can solve this by using two standard Unix commands `tee` and `trap`. The first one allows to duplicate output into `stdout` and somewhere else ([read more](http://man7.org/linux/man-pages/man1/tee.1.html)). The second one allows to specify some command to be executed on script exit ([read more](http://man7.org/linux/man-pages/man1/trap.1p.html)). So we can do:

``` YAML
trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
make test | tee ${TEST_RESULTS}/go-test.out
```

Now then we know that our unit tests succeeded we can start our service and validate it's running.

``` YAML
      - run:
          name: Build service
          command: make

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://ubuntu@localhost:5432/contacts?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/circleci/cci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: Validate service is working
          command: curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

To start service we need to build it first. After that we use the same environment variables as we did in the testing step for service to start. We're using `background: true` to keep service running and proceed to the next step where we use `curl` to validate service successfully started and responding to our request.

Finally, let's specify a path to store the results of the tests.

```YAML
      - store_test_results:
          path: /tmp/test-results
```

Nice! You just set up CircleCI 2.0 for a Go app. Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-go).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
