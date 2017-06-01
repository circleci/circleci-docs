---
layout: classic-docs
title: "Language Guide: Ruby"
short-title: "Ruby"
description: "Building and Testing with Ruby and Rails on CircleCI 2.0"
categories: [language-guides]
order: 7
---

## Overview

This guide will help you get started with a Ruby on Rails application on CircleCI. If you’re in a rush, just copy the sample configuration below into a `.circleci/config.yml` in your project’s root directory and start building.

Otherwise, we recommend reading our [walkthrough](#config-walkthrough) for a detailed explanation of our configuration.

We maintain a reference Ruby on Rails project to show how to build Ruby on CircleCI 2.0:

- <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails" target="_blank">Demo Ruby on Rails Project on GitHub</a>
- <a href="https://circleci.com/gh/CircleCI-Public/circleci-demo-ruby-rails" target="_blank">Demo Ruby on Rails Project building on CircleCI</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>.

We've built this application using the latest stable Rails version 5.1, `rspec-rails`, and [RspecJunitFormatter][rspec-junit-formatter] with PostgreSQL as our database of choice.

This application also assumes you're using one of our [CircleCI Images](http://circleci.com/docs/2.0/circleci-images).

## Pre-built CircleCI Docker images

We recommend using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Ruby version you need from Docker Hub: <https://hub.docker.com/r/circleci/ruby/>.

Database images for use as a secondary 'service' container are also available.

---

## Sample Configuration

{% raw %}
```YAML
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails
    docker:
      - image: circleci/ruby:2.4.1-node
      - image: circleci/postgres:9.4.12-alpine
    steps:
      - checkout

      # Restore bundle cache
      - type: cache-restore
        key: rails-demo-{{ checksum "Gemfile.lock" }}

      # Bundle install dependencies
      - run: bundle install --path vendor/bundle

      # Store bundle cache
      - type: cache-save
        key: rails-demo-{{ checksum "Gemfile.lock" }}
        paths:
          - vendor/bundle

      # Database setup
      - run: bundle exec rake db:create
      - run: bundle exec rake db:schema:load

      # Run rspec in parallel
      - type: shell
        command: |
          bundle exec rspec --profile 10 \
                            --format RspecJunitFormatter \
                            --out /tmp/test-results/rspec.xml \
                            --format progress \
                            $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

      # Save artifacts
      - type: store_test_results
        path: /tmp/test-results

```
{% endraw %}

---

## Build the demo Ruby on Rails project yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. [Fork the project][fork-demo-project] on GitHub to your own account
2. Go to the [Add Projects](https://circleci.com/add-projects) page in CircleCI and click the Build Project button next to the project you just forked
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

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
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, we can specify container images under a `docker` key.

```YAML
version: 2
# ...
    docker:
      - image: circleci/ruby:2.4.1-node
      - image: circleci/postgres:9.4.12-alpine
```

We use the [official Ruby images](https://hub.docker.com/_/ruby/) tagged to version `2.4.1` and with additional packages installed for NodeJS.

We've also specified the [official Postges image](https://hub.docker.com/_/postgres/) for use as our database container.

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

```YAML
steps:
  - checkout
```

This step tells our build to checkout our project code into the working directory.

Next we pull down the cache, if present. If this is your first run, or if you've changed `Gemfile.lock`, this won't do anything. We run `bundle install` next to pull down the project's dependencies. Normally you never call this task directly since it's done automatically when it's needed, but calling it directly allows us to insert a `cache-save` step that will store the dependencies in order to speed things up for next time.

```YAML
steps:
  # ...

  # Restore bundle cache
  - type: cache-restore
    key: rails-demo-{{ checksum "Gemfile.lock" }}

  # Bundle install dependencies
  - run: bundle install --path vendor/bundle

  # Store bundle cache
  - type: cache-save
    key: rails-demo-{{ checksum "Gemfile.lock" }}
    paths:
      - vendor/bundle
```

Now we can setup our test database we'll use during the build.

```YAML
steps:
  # ...

  # Database setup
  - run: bundle exec rake db:create
  - run: bundle exec rake db:schema:load
```

Then `bundle exec rspec` which runs the actual tests in parallel.

If they succeed, it stores the test results using `store_test_results` so we can quickly see our build failures in the Test Summary section. This is why we added [RspecJunitFormatter][rspec-junit-formatter] to our Gemfile.

From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```YAML
steps:
  # ...

  # Run rspec in parallel
  - type: shell
    command: |
      bundle exec rspec --profile 10 \
                        --format RspecJunitFormatter \
                        --format progress \
                        --out /tmp/test-results/rspec.xml \
                        $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

  # Save artifacts
  - type: store_test_results
    path: /tmp/test-results
```
{% endraw %}

You can see we've specified 2 formatters for our RSpec test suite:

* `RspecJunitFormatter` for outputing JUnit style test results
* `progress` for displaying running build output

We've also added `--profile` which reports the slowest examples of each run.

For more on `circleci tests glob` and `circleci tests split` commands, please refer to our documentation on [Parallelism with CircleCI CLI](https://circleci.com/docs/2.0/parallelism-faster-jobs).

---

Success! You just set up CircleCI 2.0 for a Ruby on Rails app. Check out our [project’s build page](https://circleci.com/gh/CircleCI-Public/circleci-demo-ruby-rails) to see how this looks when building on CircleCI.

If you have any questions about the specifics of testing your Ruby application, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.

## Detailed Examples

This app illustrates the simplest possible setup for a Ruby on Rails web app. Real world projects tend to be more complex, so you may find these more detailed examples of real-world apps useful as you configure your own projects:

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml), an open source discussion platform.

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.

[fork-demo-project]: https://github.com/CircleCI-Public/circleci-demo-ruby-rails/fork
[rspec-junit-formatter]: https://github.com/sj26/rspec_junit_formatter
