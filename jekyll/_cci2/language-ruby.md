---
layout: classic-docs
title: "Language Guide: Ruby"
short-title: "Ruby"
description: "Building and Testing with Ruby and Rails on CircleCI"
categories: [language-guides]
order: 8
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This guide will help you get started with a Ruby on Rails application on CircleCI.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

If you’re in a rush, just copy the sample configuration below into a
[`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) in
your project’s root directory and start building.

CircleCI maintains a sample Ruby on Rails project on
[GitHub](https://github.com/CircleCI-Public/circleci-demo-ruby-rails) which you
can see building on
[CircleCI](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-ruby-rails)

The application uses Rails version 6.1, `rspec-rails`, and
[RspecJunitFormatter][rspec-junit-formatter] with PostgreSQL as the database.


## Pre-Built CircleCI Docker Images
{: #pre-built-circleci-docker-images }

This application build also uses one of the pre-built [CircleCI Docker
Images]({{site.baseurl}}/circleci-images/).

Consider using a CircleCI pre-built image that comes pre-installed with tools
that are useful in a CI environment. You can select the Ruby version you need
from [Docker Hub](https://hub.docker.com/r/cimg/ruby).

Database images for use as a secondary 'service' container are also available on
Docker Hub in the `circleci` directory.

---

## Sample configuration
{: #sample-configuration }

The following code block is commented to describe each part of the configuration
for the sample application.

{% raw %}

```yaml
version: 2.1 # Use 2.1 to enable using orbs and other features.

# Declare the orbs that we'll use in our config.
# read more about orbs: https://circleci.com/docs/orb-intro/
orbs:
  ruby: circleci/ruby@1.0
  node: circleci/node@2

jobs:
  build: # our first job, named "build"
    docker:
      - image: cimg/ruby:2.7-node # use a tailored CircleCI docker image.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout # pull down our git code.
      - ruby/install-deps # use the ruby orb to install dependencies
      # use the node orb to install our packages
      # specifying that we use `yarn` and to cache dependencies with `yarn.lock`
      # learn more: https://circleci.com/docs/caching/
      - node/install-packages:
          pkg-manager: yarn
          cache-key: "yarn.lock"

  test:  # our next job, called "test"
    # we run "parallel job containers" to enable speeding up our tests;
    # this splits our tests across multiple containers.
    parallelism: 3
    # here we set TWO docker images.
    docker:
      - image: cimg/ruby:2.7-node # this is our primary docker image, where step commands run.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment: # add POSTGRES environment variables.
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog_test
          POSTGRES_PASSWORD: ""
    # environment variables specific to Ruby/Rails, applied to the primary container.
    environment:
      BUNDLE_JOBS: "3"
      BUNDLE_RETRY: "3"
      PGHOST: 127.0.0.1
      PGUSER: circleci-demo-ruby
      PGPASSWORD: ""
      RAILS_ENV: test
    # A series of steps to run, some are similar to those in "build".
    steps:
      - checkout
      - ruby/install-deps
      - node/install-packages:
          pkg-manager: yarn
          cache-key: "yarn.lock"
      # Here we make sure that the secondary container boots
      # up before we run operations on the database.
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run:
          name: Database setup
          command: bundle exec rails db:schema:load --trace
      # Run rspec in parallel
      - ruby/rspec-test

# We use workflows to orchestrate the jobs that we declared above.
workflows:
  version: 2
  build_and_test:     # The name of our workflow is "build_and_test"
    jobs:             # The list of jobs we run as part of this workflow.
      - build         # Run build first.
      - test:         # Then run test,
          requires:   # Test requires that build passes for it to run.
            - build   # Finally, run the build job.
```

{% endraw %}


## Build the demo Ruby on Rails project yourself
{: #build-the-demo-ruby-on-rails-project-yourself }

A good way to start using CircleCI is to build a project yourself. Here's how to build the demo project with your own account:

1. [Fork the project][fork-demo-project] on GitHub to your own account.
2. Go to the [**Projects**](https://app.circleci.com/projects/){:rel="nofollow"} dashboard in the CircleCI app and click the **Follow Project** button next to the project you just forked.
3. To make changes you can edit the `.circleci/config.yml` file and make a commit. When you push a commit to GitHub, CircleCI will build and test the project.

## See also
{: #see-also }
{:.no_toc}

See the [Deployment overview]({{site.baseurl}}/deployment-overview#next-steps/) document for links to various target configuration examples.

This app illustrates the simplest possible setup for a Ruby on Rails web app. Real-world projects tend to be more complex, so you may find these more detailed examples of real-world apps useful as you configure your own projects:

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml), an open-source discussion platform.
* [Sinatra](https://github.com/CircleCI-Public/circleci-demo-ruby-sinatra), a demo app for the [simple DSL for quickly creating web applications](http://www.sinatrarb.com/).

[fork-demo-project]: https://github.com/CircleCI-Public/circleci-demo-ruby-rails/tree/2.1-orbs-config
[rspec-junit-formatter]: https://github.com/sj26/rspec_junit_formatter
