---
layout: classic-docs2
title: "Language Guide: Go"
short-title: "Go"
categories: [languages-and-tools]
order: 2
---

This guide will help get you started with a Go project on CircleCI 2.0. This walkthrough will be pretty thorough and will explain why we need each piece of configuration. If you’re just looking for a sample `config.yml` file, then just skip to the end.

If you want to follow along, fork our [example Go app](https://github.com/circleci/cci-demo-go) and add the project through CircleCI. Once you’ve done that, create an empty `.circleci/config.yml` in your project’s root.

Enough talk, let’s get started!

---

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy (BTD) process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. Go is very strict about the structure of the [Go Workspace](https://golang.org/doc/code.html#Workspaces), so we’ll need to specify a path that satisfies those requirements.

```yaml
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/circleci/cci-demo-go
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we’ll specify container images for this build under `docker`.

```yaml
version: 2
jobs:
  build:
    working_directory: /go/src/github.com/circleci/cci-demo-go
    docker:
      - image: golang:1.6.2
```

We'll also create a container for PostgreSQL, along with 2 environment variables for initializing the database.

```yaml
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
```

Now we need to add several `steps` within the `build` job.

The `checkout` step will default to the `working_directory` we have already defined.

```yaml
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
```

Next, we install the Go implementation of the JUnit reporting tool. We'll also create a directory for test results.

```yaml
...
      - run:
          name: "Install JUnit reporter & Setup Test Path"
          command: |
            go get github.com/jstemmer/go-junit-report
            mkdir -p /tmp/test-results
```

Now we have to actually run our tests.

To do that, we need to set an environment variable for our database's URL. Then, we'll download packages needed for testing without installing them. Once we've completed those actions, we can run our tests.

```yaml
      - run:
          environment:
            DATABASE_URL: "postgres://ubuntu@localhost:5432/service_test?sslmode=disable"
          command: |
            set -eu
            go get -t -d -v ./...
            go test -v -race ./... | go-junit-report > /tmp/test-results/unit-tests.xml
```

Finally, let's specify a path to store the results of the tests.

```yaml
      - store_test_results:
          path: /tmp/test-results
```

And we're done! Let's see what the whole `config.yml` looks like now:

```yaml
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

Nice! You just set up CircleCI for a Go app. Check out our project’s corresponding build on CircleCI [here](https://circleci.com/gh/circleci/cci-demo-go).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
