---
layout: classic-docs2
title: "Migrating from 1.0 to 2.0"
short-title: "Migrating from 1.0 to 2.0"
categories: [getting-started]
order: 15
---

**[Click here for Configuration Equivalents](#configuration-equivalents)**

## Why Migrate from CircleCI 1.0 to 2.0?

While CircleCI 1.0 is a powerful CI/CD platform, it has some current limitations that make building software harder than it needs to be. This document explains some of those limitations and how they are addressed in CircleCI 2.0.

### Native Docker Support

Although 1.0 does support Docker, it’s limited to older versions that don’t have access to Docker’s latest features.

This is because 1.0 uses LXC as a base container with a BTRFS file system. Recent versions of Docker don’t run properly in this environment, which means users can’t access Docker’s full featureset on 1.0.

In 2.0, if your job uses Docker, we’ll run your job on a dedicated VM so you can access all of Docker’s features.

### Flexible Job Configuration

1.0 infers your project type and automatically runs the most suitable test and build commands. Running builds are divided into well-defined steps that are performed in order. For example, 1.0 always saves your dependency cache before running tests.

While this configuration can be powerful, there are some drawbacks. Maybe you want to disable inference. Or maybe you need to save the dependency cache _after_ running tests since the tests themselves create _more_ dependencies.

In 2.0, jobs are broken into granular steps. You can compose these steps within a job at your discretion. This gives you greater flexibility to run your build the way you want.

To learn more, please see [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/configuration).

### Custom Build Image

In 1.0, you’re restricted to the build image CircleCI provides. In Linux builds, there are 2 images you can use: Ubuntu 12.04 and 14.04. While these images come with many languages and tools pre-installed, it’s frustrating if you need a version of a service or dependency that isn’t included.

Maybe you want to use a different version of MySQL than the one included in either default image. Installing another version adds time and complexity to your builds.

In 2.0, we support almost all public Docker images. You can also create a custom image and run jobs on that. You can even compose multiple images together (like MySQL 5.7 + Redis 3.2) and run jobs on them as if they were a single image.

To learn more, please see [job images]( {{ site.baseurl }}/2.0/configuration/#job-images).

----

# Configuration Equivalents

CircleCI 2.0 introduces a completely new syntax in `.circleci/config.yml`. This article will help you convert your 1.0 `circle.yml` to 2.0 syntax.


## Machine

### Global Environment Variables

**1.0**

```
machine:
  environment:
    FOO: foo
    BAR: bar
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /tmp
    docker:
      - image: busybox
    environment:
       FOO: foo
       BAR: bar
```

### Languages

**1.0**

```
machine:
  ruby:
    version: 2.3
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /tmp

    # In 2.0, we specify our Ruby version by using a public Docker image
    docker:
      - image: ruby:2.3
```

### Hosts

**1.0**

```
machine:
  hosts:
    circlehost: 127.0.0.1
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /tmp
    docker:
      - image: busybox

    steps:
      - run: echo 127.0.0.1 circlehost | tee -a /etc/host
```

## Checkout

**1.0**

```
# 1.0
checkout:
  post:
    - git submodule sync
    - git submodule update --init # use submodules
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: phusion/baseimage
    steps:
      # Ensure your image has git, otherwise the checkout step will fail
      - run: apt-get -qq update; apt-get -y install git

      # Checkout timing is no longer hardcoded, so this step can occur anywhere
      - checkout
      - run: git submodule sync && git submodule update --init # use submodules
```

## Dependency/Database/Test

**1.0**

```
dependencies:
  override:
    - bundle install --path vendor/bundle:
        timeout: 180

database:
  override:
    - cp config/database.yml.ci config/database.yml
    - bundle exec rake db:create db:schema:load

test:
  override:
    - bundle exec rspec
```

**2.0**

The `dependency`, `database`, and `test` sections are translated into a sequence of 'run' steps.

```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

      # You can use any DB here, but postgres requires the POSTGRES_USER environment variable
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

    steps:
      - checkout

      # There’s no inference in 2.0, which means there’s nothing to override
      # You’ll need to manually install your project’s dependencies
      # The current timeout for no output is hardcoded to 600 seconds
      - run: bundle install --path vendor/bundle

      # The DB is not automatically created in 2.0, so we manually set up a test DB
      - run: sudo -u root createuser -h localhost --superuser ubuntu
      - run: sudo createdb -h localhost test_db
      - run: bundle exec rake db:create db:schema:load

      # Run any test commands
      - run: bundle exec rspec

```

## Caching

### Cache Directories

**1.0**

```
dependencies:
  override:
    - bundle install --path vendor/bundle:
        timeout: 180

  cache_directories:
    - "vendor/bundle"
```

**2.0**

{% raw %}
```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

    steps:
      - checkout
      - run: bundle install --path vendor/bundle

     # Caching is fully customizable in 2.0
     - save_cache:
        key: dependency-cache-{{ checksum "Gemfile.lock" }}
        paths:
          - vendor/bundle
```
{% endraw %}

Please note that you need to have a restore cache step by yourself in 2.0. There are also lots of cache prefix options available.

Read about them in [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/configuration).

## Deployment

**1.0**

```
deployment:
  staging:
    branch: master
    heroku:
      appname: foo-bar-123
```

**2.0**

Currently, 2.0 doesn’t support automatic deployment via integrations (like the above Heroku example).

You can write your own manual `deploy` steps as shown in the `deploy` section of the `config.yml` [configuration example here](/docs/2.0/configuration/).
