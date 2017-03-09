---
layout: classic-docs2
title: "Language Guide: Go"
short-title: "Go"
categories: [language-guides]
order: 3
---

## Overview

This guide will help you get started with a Go project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

```YAML
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/circleci/cci-demo-go
    docker:
      - image: golang:1.6.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: service_test
    steps:
      - checkout
      - run:
          name: "Install JUnit & Setup Test Path"
          command: |
            go get github.com/jstemmer/go-junit-report
            mkdir -p /tmp/test-results
      - run:
          environment:
            DATABASE_URL: "postgres://ubuntu@localhost:5432/service_test?sslmode=disable"
          command: |
            set -eu
            go get -t -d -v ./...
            export DATABASE_URL="postgres://ubuntu@localhost:5432/service_test?sslmode=disable"
            go test -v -race ./... | go-junit-report > /tmp/test-results/unit-tests.xml
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

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. Go is very strict about the structure of the [Go Workspace](https://golang.org/doc/code.html#Workspaces), so we’ll need to specify a path that satisfies those requirements.

```YAML
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/circleci/cci-demo-go
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify container images for this build under `docker`.

```YAML
...
    docker:
      - image: golang:1.6.2
```

We'll also create a container for PostgreSQL, along with 2 environment variables for initializing the database.

```YAML
...
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: service_test
```

Now we need to add several `steps` within the `build` job.

The `checkout` step will default to the `working_directory` we have already defined.

```YAML
...
    steps:
      - checkout
```

Next, we install the Go implementation of the JUnit reporting tool. We'll also create a directory for test results.

```YAML
...
      - run:
          name: "Install JUnit & Setup Test Path"
          command: |
            go get github.com/jstemmer/go-junit-report
            mkdir -p /tmp/test-results
```

Now we have to actually run our tests.

To do that, we need to set an environment variable for our database's URL. Then, we'll download packages needed for testing without installing them. Once we've completed those actions, we can run our tests.

```YAML
...
      - run:
          environment:
            DATABASE_URL: "postgres://ubuntu@localhost:5432/service_test?sslmode=disable"
          command: |
            set -eu
            go get -t -d -v ./...
            export DATABASE_URL="postgres://ubuntu@localhost:5432/service_test?sslmode=disable"
            go test -v -race ./... | go-junit-report > /tmp/test-results/unit-tests.xml
```

Finally, let's specify a path to store the results of the tests.

```YAML
...
      - store_test_results:
          path: /tmp/test-results
```

Nice! You just set up CircleCI for a Go app. Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-go).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
