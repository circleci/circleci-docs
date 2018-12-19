---
layout: classic-docs
title: "Language Guide: Ruby"
short-title: "Ruby"
description: "Building and Testing with Ruby and Rails on CircleCI 2.0"
categories: [language-guides]
order: 8
---

This guide will help you get started with a Ruby on Rails application on CircleCI. 

* TOC
{:toc}

## Overview
{:.no_toc}

If you’re in a rush, just copy the sample configuration below into a [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project’s root directory and start building.

CircleCI maintains the sample Ruby on Rails project at the following links:

- <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails" target="_blank">Demo Ruby on Rails Project on GitHub</a>
- [Demo Ruby on Rails Project building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-ruby-rails){:rel="nofollow"}

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>.

The application uses the latest stable Rails version 5.1, `rspec-rails`, and [RspecJunitFormatter][rspec-junit-formatter] with PostgreSQL as the database.

This application build also uses one of the pre-built [CircleCI Docker Images](http://circleci.com/docs/2.0/circleci-images).

## Pre-Built CircleCI Docker Images

Consider using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Ruby version you need from Docker Hub: <https://hub.docker.com/r/circleci/ruby/>.

Database images for use as a secondary 'service' container are also available on Docker Hub in the `circleci` directory.

---

## Sample Configuration

{% raw %}

```yaml
version: 2 # use CircleCI 2.0
jobs: # a collection of steps
  build: # runs not using Workflows must have a `build` job as entry point
    parallelism: 3 # run three instances of this job in parallel
    docker: # run the steps with Docker
      - image: circleci/ruby:2.4.2-jessie-node # ...with this image as the primary container; this is where all `steps` will run
        environment: # environment variables for primary container
          BUNDLE_JOBS: 3
          BUNDLE_RETRY: 3
          BUNDLE_PATH: vendor/bundle
          PGHOST: 127.0.0.1
          PGUSER: circleci-demo-ruby
          RAILS_ENV: test
      - image: circleci/postgres:9.5-alpine # database image
        environment: # environment variables for database
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
    steps: # a collection of executable commands
      - checkout # special step to check out source code to working directory

      # Which version of bundler?
      - run:
          name: Which bundler?
          command: bundle -v

      # Restore bundle cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
      - restore_cache:
          keys:
            - rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
            - rails-demo-bundle-v2-

      - run: # Install Ruby dependencies
          name: Bundle Install
          command: bundle check || bundle install

      # Store bundle cache for Ruby dependencies
      - save_cache:
          key: rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      # Only necessary if app uses webpacker or yarn in some other way
      - restore_cache:
          keys:
            - rails-demo-yarn-{{ checksum "yarn.lock" }}
            - rails-demo-yarn-

      - run:
          name: Yarn Install
          command: yarn install --cache-folder ~/.cache/yarn

      # Store yarn / webpacker cache
      - save_cache:
          key: rails-demo-yarn-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn

      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: Database setup
          command: bin/rails db:schema:load --trace

      - run:
          name: Run rspec in parallel
          command: |
            bundle exec rspec --profile 10 \
                              --format RspecJunitFormatter \
                              --out test_results/rspec.xml \
                              --format progress \
                              $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

      # Save test results for timing analysis
      - store_test_results: # Upload test results for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test_results
      # See https://circleci.com/docs/2.0/deployment-integrations/ for example deploy configs
```

{% endraw %}

---

## Build the Demo Ruby on Rails Project Yourself

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. [Fork the project][fork-demo-project] on GitHub to your own account.
2. Go to the [Add Projects](https://circleci.com/add-projects){:rel="nofollow"} page in CircleCI and click the Build Project button next to the project you just forked.
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

---

## Config Walkthrough

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

Next, add a `jobs` key. Each job represents a phase in your Build-Test-Deploy process. The sample app only needs a `build` job, so all other options are nested under that key.

In each job, you have the option of specifying a `working_directory`. In this sample config, it is named after the project in the home directory.

```yaml
version: 2
jobs:
  build:
    parallelism: 3
    working_directory: ~/circleci-demo-ruby-rails
```

This path will be used as the default working directory for the rest of the `job` unless otherwise specified.

Directly beneath `working_directory`, you can specify container images under a `docker` key.

```yaml
    docker:
      - image: circleci/ruby:2.4.2-jessie-node  # language image
        environment:
          BUNDLE_JOBS: 3
          BUNDLE_RETRY: 3
          BUNDLE_PATH: vendor/bundle
          PGHOST: 127.0.0.1
          PGUSER: circleci-demo-ruby
          RAILS_ENV: test
      - image: circleci/postgres:9.5-alpine  # service image
        environment:
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
```

In this example,
two [CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/#image-types) are used:

- A language image
that runs on Debian Jessie
and installs both Ruby 2.4.2 and Node.js.

- A service image
that runs on Alpine Linux
and installs PostgreSQL 9.5.

Then, several environment variables are added to connect the application container with the database for testing purposes. The `BUNDLE_*` environment variables are there to ensure proper caching and improve performance and reliability for installing dependencies with Bundler.

Finally, add several `steps` within the `build` job.

Start with `checkout` so CircleCI can operate on the codebase.

```yaml
steps:
  - checkout
```

This step tells CircleCI to checkout the project code into the working directory.

Next CircleCI pulls down the cache, if present. If this is your first run, or if you've changed `Gemfile.lock`, this won't do anything. The `bundle install` command runs next to pull down the project's dependencies. Normally, you never call this task directly since it's done automatically when it's needed, but calling it directly allows a `save_cache` step that will store the dependencies to speed things up for next time.

{% raw %}
```yaml
steps:
  # ...

  # Restore bundle cache
  - restore_cache:
      keys:
        - rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
        - rails-demo-bundle-v2-

  - run:
      name: Bundle Install
      command: bundle check || bundle install

  # Store bundle cache
  - save_cache:
      key: rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
      paths:
        - vendor/bundle
```
{% endraw %}

If your application is using Webpack or Yarn for JavaScript dependencies, you should also add the following to your config.

{% raw %}
```yaml
steps:
  # ...

  # Only necessary if app uses webpacker or yarn in some other way
  - restore_cache:
      keys:
        - rails-demo-yarn-{{ checksum "yarn.lock" }}
        - rails-demo-yarn-

  - run:
      name: Yarn Install
      command: yarn install --cache-folder ~/.cache/yarn

  # Store yarn / webpacker cache
  - save_cache:
      key: rails-demo-yarn-{{ checksum "yarn.lock" }}
      paths:
        - ~/.cache/yarn
```
{% endraw %}

The next section sets up the test database. It uses the `dockerize` [utility](https://github.com/jwilder/dockerize) to delay starting the main process of the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) until after the database service is available.

```yaml
steps:
  # ...

  # Database setup
  - run:
      name: Wait for DB
      command: dockerize -wait tcp://localhost:5432 -timeout 1m

  - run:
      name: Database setup
      command: bin/rails db:schema:load --trace
```

Then `bundle exec rspec` runs the actual tests in parallel.

If they succeed, it stores the test results using `store_test_results` so CircleCI will quickly show the build failures in the Test Summary section of the app. This is the benefit of adding [RspecJunitFormatter][rspec-junit-formatter] to the Gemfile.

From there this can be tied into a continuous deployment scheme of your choice.

{% raw %}
```yaml
steps:
  # ...

  # Run rspec in parallel
  - run: |
      bundle exec rspec --profile 10 \
                        --format RspecJunitFormatter \
                        --out test_results/rspec.xml \
                        --format progress \
                        $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

  # Save test results for timing analysis
  - store_test_results:
      path: test_results
```
{% endraw %}

Two formatters are specified for the RSpec test suite:

* `RspecJunitFormatter` outputs JUnit style test results
* `progress` displays the running build output

The `--profile` option reports the slowest examples of each run.

For more on `circleci tests glob` and `circleci tests split` commands, please refer to our documentation on [Parallelism with CircleCI CLI](https://circleci.com/docs/2.0/parallelism-faster-jobs).


## See Also
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

This app illustrates the simplest possible setup for a Ruby on Rails web app. Real world projects tend to be more complex, so you may find these more detailed examples of real-world apps useful as you configure your own projects:

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml), an open source discussion platform.
* [Sinatra](https://github.com/CircleCI-Public/circleci-demo-ruby-sinatra), a demo app for the [simple DSL for quickly creating web applications](http://www.sinatrarb.com/).

[fork-demo-project]: https://github.com/CircleCI-Public/circleci-demo-ruby-rails/fork
[rspec-junit-formatter]: https://github.com/sj26/rspec_junit_formatter
