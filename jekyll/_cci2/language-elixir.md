---
layout: classic-docs
title: "Language Guide: Elixir"
short-title: "Elixir"
description: "Overview and sample config for an Elixir project"
categories: [language-guides]
order: 2
---

*[Tutorials & 2.0 Demo Apps]({{ site.baseurl }}/2.0/tutorials/) > Language Guide: Elixir*

This is an annotated `config.yml` for a demo Phoenix web application, which you can access at <https://github.com/CircleCI-Public/circleci-demo-elixir>.

If you're in a rush, just copy the configuration below into `.circleci/config.yml` in your project's root directory. Otherwise, we recommend reading through the whole configuration for a better understanding of CircleCI.

## Sample Configuration

```yaml
{% raw %}
version: 2  # use CircleCI 2.0 instead of CircleCI Classic
jobs:  # basic units of work in a run
  build:  # runs not using Workflows must have a `build` job as entry point
    parallelism: 1  # run only one instance of this job in parallel
    docker:  # run the steps with Docker
      - image: circleci/elixir:1.5  # ...with this image as the primary container; this is where all `steps` will run
        environment:  # environment variables for primary container
          MIX_ENV: test
      - image: circleci/postgres:10.1-alpine  # database image
        environment:  # environment variables for database
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # directory where steps will run

    steps:  # commands that comprise the `build` job
      - checkout  # check out source code to working directory

      - run: mix local.hex --force  # install Hex locally (without prompt)
      - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

      - restore_cache:  # restores saved mix cache
          keys:  # list of cache keys, in decreasing specificity
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # restores saved build cache
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # get updated dependencies & compile them
      - save_cache:  # generate and store cache so `restore_cache` works
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:  # make another less specific cache
          key: v1-mix-cache-{{ .Branch }}
          paths: "deps"
      - save_cache:  # you should really save one more cache just in case
          key: v1-mix-cache
          paths: "deps"
      - save_cache: # don't forget to save a *build* cache, too
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
      - save_cache: # and one more build cache for good measure
          key: v1-build-cache
          paths: "_build"

      - run:  # special utility that stalls main process until DB is ready
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # run all tests in project

      - store_test_results:  # upload test results for display in Test Summary
          path: _build/test/junit
{% endraw %}
```

## Get the Code
The configuration above is from a demo Elixir app, which you can access at [https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix](https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix).

If you want to step through it yourself, you can fork the project on GitHub and download it to your machine. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to your project. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we specify a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```YAML
version: 2
...
    docker:
      - image: elixir:1.5.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
```

We use 2 Docker images here: `elixir:1.5.2` as the primary build image and `postgres:9.4.1` as the database image.

Now we’ll add several `steps` within the `build` job.

We’ll do 6 things: checkout the codebase, install hex package manager and rebar, install missing dependencies, create the storage for the repo, and finally run the tests:

```YAML
...
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar
      - run: mix deps.get
      - run: mix ecto.create
      - run: mix test
```

Nice! You just set up CircleCI for a Phoenix app.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
