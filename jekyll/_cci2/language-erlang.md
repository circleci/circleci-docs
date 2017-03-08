---
layout: classic-docs2
title: "Demo App: Erlang"
short-title: "Erlang"
categories: [demo-apps]
order: 1
---

You can use the following `.circleci/config.yml` to start building Phoenix apps. See below for an explanation of each step.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
    docker:
      - image: trenpixster/elixir:1.3.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
    steps:
      - checkout
      - run: mix deps.get
      - run: mix ecto.create
```

## Config Walkthrough

We always start with the version.

```yaml
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
    docker:
      - image: trenpixster/elixir:1.3.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
```

We use 2 Docker images here: `trenpixster/elixir:1.3.2` as the primary build image and `postgres:9.4.1` as the database image.

Now we’ll add several `steps` within the `build` job.

We’ll do 3 things: checkout the codebase, install missing dependencies, and create the storage for the repo:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
    docker:
      - image: trenpixster/elixir:1.3.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
    steps:
      - checkout
      - run: mix deps.get
      - run: mix ecto.create
```

Nice! You just set up CircleCI for a Phoenix app.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.