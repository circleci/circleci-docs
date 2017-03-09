---
layout: classic-docs2
title: "Language Guide: Ruby"
short-title: "Ruby"
categories: [language-guides]
order: 7
---

## Overview

This guide will help you get started with a Ruby project on CircleCI. If you’re in a rush, just copy the sample configuration below into `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

## Sample Configuration

```YAML
version: 2
jobs:
  build:
    docker:
      - image: ruby:2.3
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

    working_directory: ~/cci-demo-rails
    steps:
      - checkout
      - run:
          name: Install System Dependencies
          command: apt-get update -qq && apt-get install -y build-essential nodejs
      - run:
          name: Install Ruby Dependencies
          command: bundle install
      - run:
          name: Create DB
          command: bundle exec rake db:create db:schema:load --trace
      - run:
          name: DB Migrations
          command: bundle exec rake db:migrate
      - run:
          name: Run Tests
          command: bundle exec rake test
```

## Get the Code

The configuration above is from a demo Go app, which you can access at [https://github.com/circleci/cci-demo-rails](https://github.com/circleci/cci-demo-rails).

Fork the project and download it to your machine. Then, [add the project]({{ site.baseurl }}/2.0/first-steps/#adding-projects) through CircleCI. Finally, delete everything in `.circleci/config.yml`.

Now we’re ready to build a `config.yml` from scratch.

---

## Config Walkthrough

We always start with the version.

```YAML
version: 2
```

Next, we have a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. Our sample app only needs a `build` job, so everything else is going to live under that key.

In each job, we have the option of specifying a `working_directory`. In this sample config, we’ll name it after the project in our home directory.

```YAML
...
jobs:
  build:
    working_directory: ~/cci-demo-rails
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images for the build under a `docker` key.

```YAML
...
    docker:
      - image: ruby:2.3
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root
```

We use 2 Docker images here: `ruby:2.3` as the primary build image and `postgres:9.4.1` as the database image.

Now we’ll add several `steps` within the `build` job.

First we check out the codebase.

In our second step, we install NodeJS because Docker’s Ruby image doesn’t include it. This command will also install any tools/headers required to build native gems.

```YAML
...
    steps:
      - checkout
      - run:
          name: Install System Dependencies
          command: apt-get update -qq && apt-get install -y build-essential nodejs
```

Now we have to install our actual dependencies for the project.

```YAML
...
      - run:
          name: Install Ruby Dependencies
          command: bundle install
```

Next, set up the DB.

```YAML
...
      - run:
          name: Create DB
          command: bundle exec rake db:create db:schema:load --trace
```

Rails will read `config/database.yml` and create a test DB automatically with `db:create` task. Ensure that `POSTGRES_USER` env var matches a username specified in your `database.yml`.

**(Optional)** If you want to create a DB manually, you can do so with `createdb` command. We are installing the postgresql package because we need the `createdb` command.

```YAML
      - run: |
        apt-get update -qq; apt-get install -y postgresql
        createdb -h localhost my_test_db
```

Run our migrations.

```YAML
...
      - run:
          name: DB Migrations
          command: bundle exec rake db:migrate
```

Finally, run our tests.

```YAML
...
      - run:
          name: Run Tests
          command: bundle exec rake test

```

Nice! You just set up CircleCI for a Rails app. Check out our [project’s build page](https://circleci.com/gh/circleci/cci-demo-rails).

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
