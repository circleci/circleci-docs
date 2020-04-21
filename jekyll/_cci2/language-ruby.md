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

This application build also uses one of the pre-built [CircleCI Docker Images]({{site.baseurl}}/2.0/circleci-images/).

## Pre-Built CircleCI Docker Images

Consider using a CircleCI pre-built image that comes pre-installed with tools that are useful in a CI environment. You can select the Ruby version you need from Docker Hub: <https://hub.docker.com/r/circleci/ruby/>.

Database images for use as a secondary 'service' container are also available on Docker Hub in the `circleci` directory.

---

## Sample Configuration

{:.tab.rubyconf.Config_2__1}
{% raw %}

```yaml
version: 2.1 # Use CircleCI 2.1 
orbs: # use orbs to help shorten and reduce repetition in our config.
  ruby: circleci/ruby@0.1.2 

# Yaml anchors and aliases enable reusing yaml in multiple places of out config.
# read more about yaml: https://circleci.com/docs/2.0/writing-yaml/#section=configuration
references:
  default_ruby_version: &default_ruby_version 2.6.3-stretch-node
  default_postgress_version: &default_postgress_version 9.5-alpine
  ruby_envs: &ruby_envs # yaml reference:  environment variables for primary container
    environment:
      BUNDLE_JOBS: 3
      BUNDLE_RETRY: 3
      BUNDLE_PATH: vendor/bundle
      PGHOST: 127.0.0.1
      PGUSER: circleci-demo-ruby
      PGPASSWORD: ""
      RAILS_ENV: test
  postgres_envs: &postgres_envs # yaml reference: environment varaibles for the postgres-executor
    environment:
      POSTGRES_USER: circleci-demo-ruby
      POSTGRES_DB: rails_blog_test
      POSTGRES_PASSWORD: ""

# We create two executors that get used in two separate jobs.
# this yaml block is used for creating reusable configuration.
# read more: https://circleci.com/docs/2.0/reusing-config/#executors
executors:
  default: # our first executor is used for later in the "build" job.
    parameters:
      ruby_tag:
        description: "The `circleci/ruby` Docker image version tag."
        type: string
        default: *default_ruby_version
    docker:
      - image: circleci/ruby:<< parameters.ruby_tag >>
        <<: *ruby_envs # invoke the yaml references so that we have environment variables.
  ruby_with_postgres: # our next executor is used in the "test" job.
    parameters:
      ruby_tag:
        description: "The `circleci/postgres` Docker image version tag."
        type: string
        default: *default_ruby_version
      postgres_tag:
        description: "The `circleci/postgres` Docker image version tag."
        type: string
        default: *default_postgress_version
    docker:
      - image: circleci/ruby:<< parameters.ruby_tag >>
        <<: *ruby_envs
      - image: circleci/postgres:<< parameters.postgres_tag >>
        <<: *postgres_envs

# A Command definition defines a sequence of steps as a map to be executed in a job, 
# enabling you to reuse a single command definition across multiple jobs.
commands:
  yarn-install:
    description: "Install node_modules in your build."
    parameters:
      cache-folder-path:
        description: "The path of cache-folder"
        type: string
        default: "~/.cache/yarn"
    steps:
      - run:
          name: Yarn Install
          command: yarn install --cache-folder << parameters.cache-folder-path >>
  yarn-load-cache:
    description: "Load node_modules cached"
    parameters:
      key:
        description: "The cache key to use. The key is immutable."
        type: string
        default: "rails-demo-yarn-v1"
    steps:
      - restore_cache:
          keys:
            - << parameters.key >>-{{ checksum "yarn.lock"  }}
  yarn-save-cache:
    description: "Save node_modules to cache."
    parameters:
      key:
        description: "The cache key to use. The key is immutable."
        type: string
        default: "rails-demo-yarn-v1"
    steps:
      - save_cache:
          key: << parameters.key >>-{{ checksum "yarn.lock"  }}
          paths:
            - ~/.cache/yarn

jobs: # our map of jobs, here we have `build` and `test`
  build:
    executor: default # use the `default` declared executor above.
    steps:
      - checkout # get our code from our VCS
      # A sample step that checks which version of bundler we are using.
      - run:
          name: Which bundler?
          command: bundle -v
      # Invoke the ruby orb to load our cache (if it exists)
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
      - ruby/load-cache:
          key: rails-demo-bundle
      # using the ruby orb, install our dependencies.
      - ruby/bundle-install
      # using the ruby orb, save our cache
      - ruby/save-cache:
          key: rails-demo-bundle # the key we are saving our cache under.
      # Using our custom commands, we restore, install and save node_packages.
      - yarn-load-cache
      - yarn-install
      - yarn-save-cache
  # our test job makes use of postgres, which is defined in our separate executor.
  test:
    parallelism: 3 # run parallel jobs to speed up our job when we do testing.
    executor: ruby_with_postgres
    steps:
      - checkout # pull down code from our VCS
      - ruby/load-cache: # use the ruby orb, as above.
          key: rails-demo-bundle
      - ruby/bundle-install
      - yarn-load-cache # re-use our yarn-load-cache command, declared in the `commands` block
      # Check DB status
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      # Setup database
      - run:
          name: Database setup
          command: bundle exec rails db:schema:load --trace
      # Run rspec in parallel
      - ruby/test

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build


```
{% endraw %}

{:.tab.rubyconf.Config_2__0}
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
          command: bundle check --path vendor/bundle || bundle install --deployment

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

Let's walk through the [2.1 configuration](https://github.com/CircleCI-Public/circleci-demo-ruby-rails/blob/2.1-orbs-config/.circleci/config.yml) of the Ruby sample project.

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used to issue warnings about breaking changes.

```yaml
version: 2.1
```

The bulk of our config exists in creating *reusable configuration*. This means
using orbs, commands, executors, and commands. Your configuration does not have
to use tools, but as projects get more complex it can help to organize your
configuration into blocks that can be reusable throughout your config (and other
configurations).

We will start by creating a few yaml references. [Yaml anchors and aliases]({{site.baseurl}}/2.0/writing-yaml/#section=configuration) enable reusing yaml in multiple places of our config. 

```yaml
references:
  default_ruby_version: &default_ruby_version 2.6.3-stretch-node
  default_postgress_version: &default_postgress_version 9.5-alpine
  ruby_envs: &ruby_envs 
    environment:
      BUNDLE_JOBS: 3
      BUNDLE_RETRY: 3
      BUNDLE_PATH: vendor/bundle
      PGHOST: 127.0.0.1
      PGUSER: circleci-demo-ruby
      PGPASSWORD: ""
      RAILS_ENV: test
  postgres_envs: &postgres_envs
    environment:
      POSTGRES_USER: circleci-demo-ruby
      POSTGRES_DB: rails_blog_test
      POSTGRES_PASSWORD: ""
```

Now, let's create some reusable [executors]({{ site.baseurl }}/2.0/configuration-reference/#executors-requires-version-21) under the `executors` key. We will see these executors used later under the `jobs` key.

```yaml
executors:
  default: # our first executor is used for later in the "build" job.
    parameters:
      ruby_tag:
        description: "The `circleci/ruby` Docker image version tag."
        type: string
        default: *default_ruby_version
    docker:
      - image: circleci/ruby:<< parameters.ruby_tag >>
        <<: *ruby_envs # invoke the yaml references so that we have environment variables.
  ruby_with_postgres: # our next executor is used in the "test" job.
    parameters:
      ruby_tag:
        description: "The `circleci/postgres` Docker image version tag."
        type: string
        default: *default_ruby_version
      postgres_tag:
        description: "The `circleci/postgres` Docker image version tag."
        type: string
        default: *default_postgress_version
    docker:
      - image: circleci/ruby:<< parameters.ruby_tag >>
        <<: *ruby_envs
      - image: circleci/postgres:<< parameters.postgres_tag >>
        <<: *postgres_envs
```

Now we'll move on to creating some reusable
[commands]({{site.baseurl}}/2.0/configuration-reference/#commands-requires-version-21).

```yaml
commands:
  yarn-install:
    description: "Install node_modules in your build."
    parameters:
      cache-folder-path:
        description: "The path of cache-folder"
        type: string
        default: "~/.cache/yarn"
    steps:
      - run:
          name: Yarn Install
          command: yarn install --cache-folder << parameters.cache-folder-path >>
  yarn-load-cache:
    description: "Load node_modules cached"
    parameters:
      key:
        description: "The cache key to use. The key is immutable."
        type: string
        default: "rails-demo-yarn-v1"
    steps:
      - restore_cache:
          keys:
            - << parameters.key >>-{{ checksum "yarn.lock"  }}
  yarn-save-cache:
    description: "Save node_modules to cache."
    parameters:
      key:
        description: "The cache key to use. The key is immutable."
        type: string
        default: "rails-demo-yarn-v1"
    steps:
      - save_cache:
          key: << parameters.key >>-{{ checksum "yarn.lock"  }}
          paths:
            - ~/.cache/yarn
```

This block might seem a bit intimidating, but if you look
closely you will see that every command follows the same structure. Here, we are
creating commands that are responsible for handling dependencies and caching for
JavaScript assets with Yarn. These commands can be used across any job.

Now then, it's time to look at how our jobs are constructed. The sample
application has two jobs: `build` and `test`. Let's look at each one individually.

```yaml
jobs: 
  build:
    executor: default
    steps:
      - checkout 
      - run:
          name: Which bundler?
          command: bundle -v
      - ruby/load-cache:
          key: rails-demo-bundle
      - ruby/bundle-install
      - ruby/save-cache:
          key: rails-demo-bundle 
      - yarn-load-cache
      - yarn-install
      - yarn-save-cache
```

Our first job is `build`. This job is responsible for building the rails
application and makes use of the several Yarn commands we established above. You
can also see that we are making use of the [Ruby
orb](https://circleci.com/orbs/registry/orb/circleci/ruby) which abstracts away
the mechanism for installing our dependencies. 

Let's move on to the `test` job. 

```yaml
#...
  test:
    parallelism: 3 # run parallel jobs to speed up our job when we do testing.
    executor: ruby_with_postgres
    steps:
      - checkout # pull down code from our VCS
      - ruby/load-cache: # use the ruby orb, as above.
          key: rails-demo-bundle
      - ruby/bundle-install
      - yarn-load-cache # re-use our yarn-load-cache command, declared in the `commands` block
      # Check DB status
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      # Setup database
      - run:
          name: Database setup
          command: bundle exec rails db:schema:load --trace
      # Run rspec in parallel
      - ruby/test

```

This job is quite different from the `build` job for two reasons. Firstly, we
are using a new executor, one of which makes use of *two* docker images - one
for Ruby (known as the "primary container") and the second for Postgres.

Next, because we are executing tests in this job, we have the option to build
this job in parallel - meaning we can split our tests across multiple containers
to increase our build time. You can consult the [job parallelism
document]({{site.baseurl/2.0/parallelism-faster-jobs}}) for more information
about splitting test files. The `ruby/test` command enables us to automatically
split our tests.

Finally, we set up [workflows]({{site.baseurlr/2.0/workflows}}). Workflows
enable us to sequence our jobs and the data that may flow between them. 

```yaml
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

Here we are declaring a workflow called `build_and_test` which is responsible 
for running the `build` and `test` job. Here we are declaring that the `test`
job *requires* the `build` job to pass - it will not run if it fails.

And that's it! We covered a lot of ground, but this is just a start with what is
possible using CircleCI.

## See Also
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

This app illustrates the simplest possible setup for a Ruby on Rails web app. Real-world projects tend to be more complex, so you may find these more detailed examples of real-world apps useful as you configure your own projects:

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml), an open-source discussion platform.
* [Sinatra](https://github.com/CircleCI-Public/circleci-demo-ruby-sinatra), a demo app for the [simple DSL for quickly creating web applications](http://www.sinatrarb.com/).

[fork-demo-project]: https://github.com/CircleCI-Public/circleci-demo-ruby-rails/tree/2.1-orbs-config
[rspec-junit-formatter]: https://github.com/sj26/rspec_junit_formatter
