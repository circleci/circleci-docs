---
layout: classic-docs
title: "Language Guide: Go"
short-title: "Go"
description: "Building and Testing with Go (Golang) on CircleCI 2.0"
categories: [language-guides]
order: 3
---

CircleCI supports building Go projects using any version of Go that can be
installed in a Docker image. If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

* TOC
{:toc}

## Quickstart: Demo Go Reference Project

We maintain a reference Go project to show how to build on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project on GitHub</a>
- [Demo Go Project building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-go/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>. This file shows best practice for using CircleCI 2.0 with Go projects.


## Sample Configuration

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    docker: # run the steps with Docker
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.12 #
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
        environment: # environment variables for primary container
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    environment: # environment variables for the build itself
      TEST_RESULTS: /tmp/test-results # path to where test results will be saved

    steps: # steps that comprise the `build` job
      - checkout # check out source code to working directory
      - run: mkdir -p $TEST_RESULTS # create the test results directory

      - restore_cache: # restores saved cache if no changes are detected since last run
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          keys:
            - v1-pkg-cache

      # Normally, this step would be in a custom primary image;
      # we've added it here for the sake of explanation.
      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      #  CircleCi's Go Docker image includes netcat
      #  This allows polling the DB port to confirm it is open before proceeding
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
          environment: # environment variables for the database url and path to migration files
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          # Store the results of our tests in the $TEST_RESULTS directory
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out

      - run: make # pull and build dependencies for the project

      - save_cache: # Store cache in the /go/pkg directory
          key: v1-pkg-cache
          paths:
            - "/go/pkg"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true # keep service running and proceed to next step

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts

      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results: # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: /tmp/test-results
```

{% endraw %}

### Pre-Built CircleCI Docker Images
{:.no_toc}

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the version you need from Docker Hub: <https://hub.docker.com/r/circleci/golang/>. The demo project uses an official CircleCI image.

### Build the Demo Project Yourself
{:.no_toc}

A good way to start using CircleCI is to build a project yourself. Here's how to build the <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project</a> with your own account:

1. Fork the <a href="https://github.com/CircleCI-Public/circleci-demo-go" target="_blank">Demo Go Project on GitHub</a> to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

If you want to test your changes locally, use [our CLI tool](https://circleci.com/docs/2.0/local-jobs/) and run `circleci build`.

---

## Config Walkthrough

This section explains the commands in `.circleci/config.yml`

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

Next, we have a `jobs` key. Every config file must have a ‘build’ job. This is the only job that will be automatically picked up and run by CircleCI.

In the job, we specify a `working_directory`. Go is very strict about the structure of the [Go Workspace](https://golang.org/doc/code.html#Workspaces), so we’ll need to specify a path that satisfies those requirements.

```yaml
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) images for this job under `docker`.

```yaml
    docker:
      - image: circleci/golang:1.12
```

We'll use a custom image which is based on `golang:1.12.0` and includes also `netcat` (we'll need it later).

We're also using an image for PostgreSQL, along with 2 environment variables for initializing the database.

```yaml
      - image: circleci/postgres:9.6-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle_test
```

After setting up Docker we will set an environment variable to store the path to
our test results.

```yaml
    environment:
      TEST_RESULTS: /tmp/test-results
```

Now we need to add several `steps` within the `build` job.

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
to check out source code. By default, source code is checked out to the path specified by `working_directory`.

```yaml
    steps:
      - checkout
```

Next we create a directory for collecting test results

```yaml
      - run: mkdir -p $TEST_RESULTS
```

Then we pull down the cache (if present). If this is your first run, this won't do anything.

```yaml
      - restore_cache:
          keys:
            - v1-pkg-cache
```

And install the Go implementation of the JUnit reporting tool and other dependencies for our application. These are good candidates to be pre-installed in primary container.

```yaml
      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report
```

Both containers (primary and postgres) start simultaneously, however Postgres may require some time to get ready and if our tests start before that the job will fail. So it's good practice to wait until dependent services are ready. Here we have only Postgres, so we add this step:

```yaml
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

```yaml
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://rot@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
```

Our project uses `make` for building and testing (you can see `Makefile` [here](https://github.com/CircleCI-Public/circleci-demo-go/blob/master/Makefile)), so we can just run `make test`. In order to collect test results and upload them later (read more about test results in the [Project Tutorial]({{ site.baseurl }}/2.0/project-walkthrough/)) we're using `go-junit-report`:

```bash
make test | go-junit-report > ${TEST_RESULTS}/go-test-report.xml
```

In this case all output from `make test` will go straight into `go-junit-report` without appearing in `stdout`. We can solve this by using two standard Unix commands `tee` and `trap`. The first one allows us to duplicate output into `stdout` and somewhere else ([read more](http://man7.org/linux/man-pages/man1/tee.1.html)). The second one allows us to specify some command to be executed on script exit ([read more](http://man7.org/linux/man-pages/man1/trap.1p.html)). So we can do:

```bash
trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
make test | tee ${TEST_RESULTS}/go-test.out
```

Now we know that our unit tests succeeded we can start our service and validate it's running.

```yaml
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - ~/.cache/go-build

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

After we pull and build the project's dependencies using `make`, we store any built packages in the cache. This is the recommended way to cache dependencies for your Go project.

To start the service we need to build it first. After that we use the same environment variables as we did in the testing step for the service to start. We're using `background: true` to keep the service running and proceed to the next step where we use `curl` to validate it successfully started and is responding to our request.

Finally, let's specify a path to store the results of the tests.

```yaml
      - store_test_results:
          path: /tmp/test-results
```

Success! You just set up CircleCI 2.0 for a Go app. Check out our [Job page](https://circleci.com/gh/CircleCI-Public/circleci-demo-go){:rel="nofollow"} to see how this looks when building on CircleCI.

## See Also

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for example deploy target configurations.

Refer to the [Caching Dependencies]({{ site.baseurl }}/2.0/caching/) document for more caching strategies.
