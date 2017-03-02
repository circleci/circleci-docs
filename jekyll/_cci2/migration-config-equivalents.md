---
layout: classic-docs2
title: "Configuration Equivalents"
short-title: "Configuration Equivalents"
categories: [migrating-from-1-2]
order: 20
---

CircleCI 2.0 introduces a completely new syntax in `circle.yml`. This article will help you convert your 1.0 `circle.yml` to 2.0 syntax.


## Machine

### Global Environment Variables

**1.0**

```
# 1.0
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

    # You can use any public Docker images in 2.0, so using ruby:2.3 Docker image is a 2.0 way
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

### Custom Checkout

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

    # We are using phusion/baseimage because it's small yet handy enough for the purpose of this document
    docker:
      - image: phusion/baseimage

    steps:
      # Make sure you have git in your image. Otherwise the next checkout step will fail.
      - run: apt-get -qq update; apt-get -y install git

      # The timing when you checkout is not hardcoded anymore in 2.0.
      # You can do that at anytime you want.
      - checkout
      - run: git submodule sync && git submodule update --init # use submodules
```

## Dependency

### Override

**1.0**

```
dependencies:
  override:
    - bundle install --path vendor/bundle:
        timeout: 180
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

    # You need to install dependencies that your project requires by yourself.
    # Therefore, there is nothing to override in 2.0.
    # Currently, the timeout for no output is hardcoded to 600 secs.
    steps:
      - checkout
      - run: bundle install --path vendor/bundle
```

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
# 2.0
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

    steps:
      - checkout
      - run: bundle install --path vendor/bundle

     # Caching is fully customizable in 2.0.
     # (1) There are many available keys that you can use as a cache prefix
     - type: cache-save
        key: dependency-cache-{{ checksum "Gemfile.lock" }}
        paths:
          - vendor/bundle
```
{% endraw %}

**(1)** To learn more about available cache, please see [Configuring CircleCI 2.0]( {{ site.baseurl }}/2.0/configuration) page.

## Database

### Override

**1.0**

```
# 1.0
database:
  override:
    - cp config/database.yml.ci config/database.yml
    - bundle exec rake db:create db:schema:load
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

      # You can chose any DB that you want to use in 2.0
      # The postgres image requires POSTGRES_USER env var
      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

    steps:
      - checkout

      # Database is not created automatically in 2.0.
      # Following is an example of setting up test DB in PostgreSQL
      - run: sudo -u root createuser -h localhost --superuser ubuntu
      - run: sudo createdb -h localhost test_db
      - run: bundle exec rake db:create db:schema:load
```

## Test

### Override


**1.0**

```
test:
  override:
    - bundle exec rspec
```

**2.0**

```
version: 2
jobs:
  build:
    working_directory: /root/my-project
    docker:
      - image: ruby:2.3

    # You can use any test commands you want to use in 2.0
    # so there is nothing to override. Just use 'run' step with your test command
    steps:
      - checkout
      - run: bundle exec rspec
```

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

Automatic deployment via integrations that you might have used on CircleCI 1.0 (such as Heroku above) are not currently supported in 2.0.

You can write your own `deploy` manual steps as shown in the `deploy` sections of the `circle.yml` [configuration example here](/docs/2.0/configuration/).

We're working on creating more comprehensive deployment documentation for 2.0.
