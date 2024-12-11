---
layout: classic-docs
title: Publish packages to Packagecloud
description: How to publish packages to Packagecloud using CircleCI.
contentTags:
  platform:
  - Cloud
  - Server v4+
---

In this how-to guide, you will learn how to configure CircleCI to publish packages to Packagecloud.

## Introduction
{: #introduction }

[Packagecloud](https://packagecloud.io) is a hosted package repository service. It allows users to host npm, Java/Maven, python, apt, yum and rubygem repositories without any pre-configuration.

## 1. Configure environment variables
{: #configure-environment-variables }

Under project settings in CircleCI, create an environment variable with the name `PACKAGECLOUD_TOKEN`, containing the value of a packagecloud API token. This environment variable will be used to authenticate with the packagecloud API directly, or using the packagecloud CLI.

The packagecloud CLI will automatically read this environment variable from the system when interacting with repositories.

Alternatively, if you prefer to keep your sensitive environment variables checked into git, but encrypted, you can follow the process outlined at [circleci/encrypted-files](https://github.com/circleci/encrypted-files).


## 2. Set the $PACKAGECLOUD_URL for packagecloud:enterprise
{: #set-the-packagecloudurl-for-packagecloud-enterprise }

**Only set the `$PACKAGECLOUD_URL` if you are a packagecloud:enterprise customer**.

This setting is only for packagecloud:enterprise customers. Under project settings in CircleCI, set the `$PACKAGECLOUD_URL` environment variable to the URL of the packagecloud:enterprise installation.
{: class="alert alert-info" }

## 3. Install the packagecloud CLI
{: #install-the-packagecloud-cli }

To use the packagecloud CLI from CircleCI, install it using RubyGems by adding the following `run` step to your `.circleci/config.yml` under the job that is configured to deploy the package:

```yml
- run:
   name: Install packagecloud CLI
   command: gem install package_cloud
```

The CLI will automatically use the `$PACKAGECLOUD_TOKEN` environment variable to authenticate against the packagecloud service.

## 4. Use dependency caching
{: #use-dependency-caching }

If you want to cache this dependency between builds, you can add the `package_cloud` gem to a `Gemfile` and follow CircleCI's guide for [Caching dependencies](/docs/caching/).

## 5. Push packages with the packagecloud CLI
{: #push-packages-with-the-packagecloud-cli }

The build processes for package types will vary, but pushing them into a packagecloud repository is quite simple. To add packages to a repository from your CircleCI builds, add a step in your `deploy` configuration that uses the packagecloud CLI.

The following is a full example `.circleci/config.yml` that will checkout a git repository, run a `make` task (this command can be anything configured to build your package), then deploy the package to a packagecloud repo.

{% include snippets/docker-auth.md %}

```yaml
version: 2.1
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: cimg/ruby:3.1.2
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
  package-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
```

## 6. Deploy npm packages
{: #deploy-npm-packages }

CircleCI users can deploy packages directly to npm registries hosted on Packagecloud.

### a. Configure the test job
{: #configure-the-test-job }

This job will retrieve the project code, install its dependencies and run any tests in the NodeJS project:

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

### b. Configure the deploy job
{: #configure-the-deploy-job }

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
version: 2.1
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: cimg/node:19.0.1
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
  test-deploy:
    jobs:
      - test
      - deploy:
          requires:
            - test
```

The workflows section will tie together both the `test` and `deploy` jobs into sequential steps in the build process.

You can read more about publishing npm packages to packagecloud on the CircleCI blog post: [Publishing npm Packages Using CircleCI](https://circleci.com/blog/publishing-npm-packages-using-circleci-2-0/)

## Use the Packagecloud API
{: #use-the-packagecloud-api }

Packagecloud also provides a robust API to manage package repositories. You can read more about the [Packagecloud API](https://packagecloud.io/docs/api) and how to upload, delete, and promote packages across repositories.

## See also
{: #see-also }

- [Storing and accessing artifacts](/docs/artifacts/)
