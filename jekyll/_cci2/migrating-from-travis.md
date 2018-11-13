---
layout: classic-docs
title: Migrating From Travis CI
categories: [migration]
description: Migrating from Travi CI
---

This document provides an overview of how to migrate from Travis CI to CircleCI.
We'll step through setting up different features of CI ranging in complexity and use of
features for each system.

The examples that follow will be applied to an [example JavaScript
repository](). For context (and limiting the scope of this article), we will consider the example repository's owner to
want to achieve the following things:

- On pushing code: run a build and run all tests.
- Expect that build time will be reduced by caching any dependencies after the
  initial build.
- Enable the safe use of environment variables.
- On each build, upload a `test-results.xml` file to be made accessible online.
- On pushing a git tag: create a Github Release, and also deploy.

* TOC
{:toc}

## Pre-requisites

This document assumes that you have an account with CircleCI that is linked
to a repository. If you don't, consider going over our [getting started guide]({{ site.baseurl }}/2.0/getting-started/).


## Configuration Files

Both Travis and CircleCI make use of a _configuration file_ to determine what
each Continuous Integration provider does respectively. With Travis, your
configuration will live in a `.travis.yml` file in the root of your repository.
With CircleCI, your configuration will live in `.circleci/config.yml` at the
root of your repository.

## Building on Pushing Code

Let's look at the minimum viable config we can use to get our build running
before we explore more complex configuration choices.

For the example repository, the beginnings of a simple Travis Configuration might look like so:

```yaml
language: node_js
services: mongodb
before_install: 
  - npm i -g npm@5
node_js:
  - "5"
cache: npm
```

For basic builds, a TravisCI configuration will leverage a language's best known
dependency and build tools and will abstract them away from the user. In this
case, when the build runs, TravisCI will automatically run `npm install` behind
the scenes and cache dependencies via `node_modules`. 

If a user needs more control with their CI environment, TravisCI uses _hooks_
to run commands before/after the `install` and `script` steps. In our case, we
want to specify that the npm version we use is pinned to `5`, so we execute the
installation of npm@5 in the `before_install` hook. Hooks can execute shell
scripts as well, which users will sometimes store in a `.travis` folder at the
root of their repository.

A CircleCI configuration looks like so:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
    steps:
      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@5'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - ./node_modules
      - run:
          name: test
          command: npm test
```

In the config above, no _language_ is specifically required, and the
user is able to specify any number of `steps` that can be run, with no
restrictions on order or step. By leveraging Docker, specific Node.js and
MongoDB versions are made available in each `command` that gets run.

Further, as a user you have control over when and where in your config you want
to cache and restore dependencies. In the above example, the CircleCI `.config`
checks for a dependency cache based specifically on a package.json. Refer to the
[caching dependencies document]({{ site.baseurl }}/2.0/caching/) to learn about customizing how your build
creates and restores caches for more fine-grained control.

### On Using Containers

## Environment Variables

## Test Results / Artifacts

## Build Rules based on Git Tags
