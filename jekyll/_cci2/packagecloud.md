---
layout: classic-docs
title: Publishing Packages to packagecloud
categories: [how-to]
description: How to publish packages to packagecloud using CircleCI
---

[Packagecloud](https://packagecloud.io) is a hosted package repository service. It allows users to host npm, Java/Maven, python, apt, yum and rubygem repositories without any pre-configuration.

* TOC
{:toc}

## Configure Environment Variables

### Set the `$PACKAGECLOUD_TOKEN`

Under project settings in CircleCI, create an environment variable with the name `PACKAGECLOUD_TOKEN`, containing the value of a packagecloud API token. This environment variable will be used to authenticate with the packagecloud API directly, or using the packagecloud CLI.

The packagecloud CLI will automatically read this environment variable from the system when interacting with repositories.

Alternatively, if you prefer to keep your sensitive environment variables checked into git, but encrypted, you can follow the process outlined at [circleci/encrypted-files](https://github.com/circleci/encrypted-files).

{:.no_toc}

### Set the `$PACKAGECLOUD_URL` for packagecloud:enterprise

_**Only set the `$PACKAGECLOUD_URL` if you're a packagecloud:enterprise customer**_

This setting is only for packagecloud:enterprise customers. Under project settings in CircleCI, set the `$PACKAGECLOUD_URL` environment variable to the URL of the packagecloud:enterprise installation.

## Install the packagecloud CLI

To use the packagecloud CLI from CircleCI, install it using RubyGems by adding the following `run` step to your `.circleci/config.yml` under the job that is configured to deploy the package:

```
- run:
   name: Install packagecloud CLI
   command: gem install package_cloud
```

The CLI will automatically use the `$PACKAGECLOUD_TOKEN` environment variable to authenticate against the packagecloud service.

### Using Dependency Caching

If you want to cache this dependency between builds, you can add the `package_cloud` gem to a `Gemfile` and follow CircleCI's guide for [Caching Dependencies]({{ site.baseurl }}/2.0/caching/).

## Pushing Packages with the packagecloud CLI

The build processes for package types will vary, but pushing them into a packagecloud repository is quite simple. To add packages to a repository from your CircleCI builds, add a step in your `deploy` configuration that uses the packagecloud CLI.

The following is a full example `.circleci/config.yml` that will checkout a git repository, run a `make` task (this command can be anything configured to build your package), then deploy the package to a packagecloud repo.

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/ruby:2.3-jessie
jobs:
  build:
    <<: *defaults
    steps:
      - checkout
      - run:
          name: Build the package
          command: make
      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: Install packagecloud CLI
          command: gem install package_cloud
      - run:
          name: Push deb package
          command: package_cloud push example-user/example-repo/debian/jessie debs/packagecloud-test_1.1-2_amd64.deb
workflows:
  version: 2
  package-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
```

## Deploy `npm` Packages

CircleCI users can deploy packages directly to npm registries hosted on packagecloud.

### Configure the Test Job

This job will retrieve the project code, install it's dependencies and run any tests in the NodeJS project:

```yaml
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # fallback to using the latest cache if no exact match is found
          - v1-dependencies-

      - run: npm install
      - run:
          name: Run tests
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
```

### Configure the Deploy Job

The next job configured is the deploy job. This job will authenticate and publish to the packagecloud npm registry:

```yaml
jobs:
...
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: Set registry URL
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: Authenticate with registry
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: Publish package
          command: npm publish
```

* *Set registry URL* : This command sets the registry to URL that will be used by the `npm` CLI.
* *Authenticate with the registry* : This command will set the `authToken` to be used by the `npm` CLI to the environment variable configured in the project settings.
* *Publish package* : Publish the package to the configured npm registry on packagecloud.

The packagecloud npm registry URL is in the following format:

```
https://packagecloud.io/:username/:repo_name/npm/
```

The full `.circleci/config.yml` should look something like this:

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/node:8.9.1
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # fallback to using the latest cache if no exact match is found
          - v1-dependencies-

      - run: npm install
      - run:
          name: Run tests
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: Set registry URL
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: Authenticate with registry
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: Publish package
          command: npm publish
workflows:
  version: 2
  test-deploy:
    jobs:
      - test
      - deploy:
          requires:
            - test
```

The workflows section will tie together both the `test` and `deploy` jobs into sequential steps in the build process.

You can read more about publishing npm packages to packagecloud on the CircleCI blog post: [Publishing npm Packages Using CircleCI 2.0](https://circleci.com/blog/publishing-npm-packages-using-circleci-2-0/)

## Using the packagecloud API

Packagecloud also provides a robust API to manage package repositories. You can read more about the [packagecloud API](https://packagecloud.io/docs/api) and how to upload, delete, and promote packages across repositories.

{:.no_toc}

## See Also

[Storing and Accessing Artifacts]({{ site.baseurl }}/2.0/artifacts/)
