---
layout: classic-docs
title: "Language Guide: Elixir"
short-title: "Elixir"
description: "Overview and sample config for an Elixir project"
categories: [language-guides]
order: 2
---

*[Tutorials & 2.0 Demo Apps]({{ site.baseurl }}/2.0/tutorials/) > Language Guide: Elixir*

This guide will help you get started with an Elixir web application using Phoenix on CircleCI. If you’re in a rush, just copy the sample configuration below into a `.circleci/config.yml` in your project’s root directory and start building.

## Overview

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

```YAML
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-phoenix
    docker:
      - image: elixir:1.5.2
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: ubuntu
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar
      - run: mix deps.get
      - run: mix ecto.create
      - run: mix test
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
