---
layout: classic-docs
title: "Language Guide: Go"
short-title: "Go"
description: "Overview and sample config for a Go project"
categories: [language-guides]
order: 3
---

**CircleCI 2.0 supports building Go projects using any version of Go that can be installed in a Docker image.**

## New to CircleCI 2.0?

If you're new to CircleCI 2.0, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Quickstart: demo Go reference project

We maintain a reference Go project to show how to build on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-go"> target="_blank">Demo Go Project on GitHub</a>
- <a href="https://circleci.com/gh/CircleCI-Public/circleci-demo-go"> target="_blank">Demo Go Project building on CircleCI</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with Go projects.

## Pre-built CircleCI Docker images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the version you need from Docker Hub: <https://hub.docker.com/r/circleci/golang/>. The demo project uses an official CircleCI image.

## Build the demo project yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. Fork the project on GitHub to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

---

## Config Walkthrough

This section explains the commands in `.circleci/config.yml`

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Every config file must have a ‘build’ job. This is the only job that will be automatically picked up and run by CircleCI.

In the job, we specify a `working_directory`. Go is very strict about the structure of the [Go Workspace](https://golang.org/doc/code.html#Workspaces), so we’ll need to specify a path that satisfies those requirements.

```YAML
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) images for this job under `docker`.

```YAML
    docker:
      - image: circleci/golang:1.8
```

We'll use a custom image which is based on `golang:1.8.0` and includes also `netcat` (we'll need it later).

We're also using an image for PostgreSQL, along with 2 environment variables for initializing the database.

```YAML
      - image: circleci/postgres:9.4.12-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
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
      - run: go get github.com/jstemmer/go-junit-report
```

Both containers (primary and postgres) start simultaneously, however Postgres may require some time to get ready and if our tests start before that the job will fail. So it's good practice to wait until dependent services are ready. Here we have only Postgres, so we add this step:

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

This is why `netcat` installed on the CircleCI Go image. We use it to validate that the port is open.

Now we run our tests. To do that, we need to set an environment variable for our database's URL and path to the DB migrations files. This step has some additional commands, we'll explain them below.

```YAML
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
```

Our project uses `make` for building and testing (you can see `Makefile` [here](https://github.com/CircleCI-Public/circleci-demo-go/blob/master/Makefile)), so we can just run `make test`. In order to collect test results and upload them later (read more about [test results]({{ site.baseurl }}/2.0/project-walkthrough/#store-test-results)) we're using `go-junit-report`:

``` YAML
make test | go-junit-report > ${TEST_RESULTS}/go-test-report.xml
```

In this case all output from `make test` will go straight into `go-junit-report` without appearing in `stdout`. We can solve this by using two standard Unix commands `tee` and `trap`. The first one allows us to duplicate output into `stdout` and somewhere else ([read more](http://man7.org/linux/man-pages/man1/tee.1.html)). The second one allows us to specify some command to be executed on script exit ([read more](http://man7.org/linux/man-pages/man1/trap.1p.html)). So we can do:

``` YAML
trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
make test | tee ${TEST_RESULTS}/go-test.out
```

Now we know that our unit tests succeeded we can start our service and validate it's running.

``` YAML
      - run: make

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://root@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: Validate service is working
          command: curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

To start the service we need to build it first. After that we use the same environment variables as we did in the testing step for the service to start. We're using `background: true` to keep the service running and proceed to the next step where we use `curl` to validate it successfully started and is responding to our request.

Finally, let's specify a path to store the results of the tests.

```YAML
      - store_test_results:
          path: /tmp/test-results
```

Success! You just set up CircleCI 2.0 for a Go app. Check out our [project’s build page](https://circleci.com/gh/CircleCI-Public/circleci-demo-go) to see how this looks when building on CircleCI.

If you have any questions about the specifics of testing your Go applicatio, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
