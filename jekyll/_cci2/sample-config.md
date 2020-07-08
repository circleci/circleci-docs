---
layout: classic-docs
title: "Sample config.yml Files"
short-title: "Sample config.yml File"
description: "Sample config.yml File"
categories: [migration]
order: 2
---

This document provides sample [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) files, as follows:

* TOC
{:toc}

## Simple Configuration Examples

### Concurrent Workflow

The configuration example below shows a concurrent  workflow in which the `build` and `test` jobs run at the same time. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

This image shows the workflow view for the following configuration example:
![Concurrent Workflow Map]({{ site.baseurl }}/assets/img/docs/concurrent-workflow-map.png)

{:.tab.basic-concurrent.Cloud}
```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test
```

{:.tab.basic-concurrent.Server}
```yaml
version: 2

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command

# Orchestrate our job run sequence
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```

### Sequential Workflow

The configuration example below shows a sequential job workflow where the `build` job runs and then the `test` job runs once `build` has completed. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

This image shows the workflow view for the following configuration example, in which jobs run sequentially; one after the other:
![Sequential Workflow Map]({{ site.baseurl }}/assets/img/docs/sequential-workflow-map.png)

{:.tab.basic-sequential.Cloud}
```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

{:.tab.basic-sequential.Server}
```yaml
version: 2
# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-command

# Orchestrate our job run sequence
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

### Approval Job

The example below shows a sequential job workflow with an approval step. The `build` job runs, then the `test` job, then a `hold` job, with `type: approval` ensures the workflow waits for manual approval before the `deploy` job can run. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

This image shows the workflow view for the following configuration example. This image has three parts to show the approval popup that appears when you click on a hold step in the app, and then the workflow view again once the `hold` job has been approved and the `deploy` job has run:

![Approval Workflow Map]({{ site.baseurl }}/assets/img/docs/approval-workflow-map.png)

{:.tab.approval.Cloud}
```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-build-commands
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-test-commands
  deploy:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-deploy-commands

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
      - hold:
          type: approval
          requires:
            - build
            - test
      - deploy:
          requires:
            - hold
```

{:.tab.approval.Server}
```yaml
version: 2

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-build-commands
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-test-commands
  deploy:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: my-deploy-commands

# Orchestrate our job run sequence
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
      - hold:
          type: approval
          requires:
            - build
            - test
      - deploy:
          requires:
            - hold
```

## Sample Configuration with Sequential Workflow

Following is a sample `.circleci/config.yml` file using the following configuration features: 

* A sequential workflow
* An orb (`version: 2.1`/Cloud config only) - the node orb handles caching automatically, but you can see saving and restoring caches in the `version: 2.0`/Server example
* A secondary services container
* Workspaces
* Storing artifacts

{:.tab.complex-sequential.Cloud}
```yaml
version: 2.1

orbs:
  node: circleci/node@3.0.0

jobs:
  build:
    working_directory: ~/mern-starter
    # Reuse Docker container specification given by the node Orb
    executor: node/default
    steps:
      - checkout
      # Install the latest npm - the node Orb takes care of it
      - node/install-npm
      # Install dependencies - the node Orb take care of installation and dependency caching
      - node/install-packages:
          app-dir: ~/mern-starter
          cache-path: node_modules
          override-ci-command: npm i
      # Save workspace for subsequent jobs (i.e. test)
      - persist_to_workspace:
          root: .
          paths:
            - .

  test:
    docker:
      # The primary container is an instance of the first image listed. The job's commands run in this container.
      - image: cimg/node:current
      # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:4.2
    steps:
      # Reuse the workspace from the build job
      - attach_workspace:
          at: .
      - run:
          name: Demonstrate that Mongo DB is available as localhost
          command: |
            curl -sSJL https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
            sudo apt update
            sudo apt install mongodb-org
            mongo localhost --eval 'db.serverStatus()'
      - run:
          name: Test
          command: npm test
      - run:
          name: Generate code coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      # You can specify either a single file or a directory to store as artifacts
      - store_artifacts:
          path: test-results.xml
          destination: deliverable.xml
      - store_artifacts:
          path: coverage
          destination: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

{:.tab.complex-sequential.Server}
{% raw %}
```yaml
version: 2

jobs:
  build:
    working_directory: ~/mern-starter
    # The primary container is an instance of the first image listed. The job's commands run in this container.
    docker:
      - image: circleci/node:4.8.2-jessie
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
  test:
    docker:
      - image: circleci/node:4.8.2-jessie
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Test
          command: npm test
      - run:
          name: Generate code coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
          filters:
            branches:
              only: master
```
{% endraw %}

This example shows a sequential workflow with the `test` job configured to run only on the master branch. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

## Sample Configuration with Fan-in/Fan-out Workflow
Following is a sample configuration for a Fan-in/Fan-out workflow. Refer to [the complete demo repo on GitHub](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) for details.

Note that since a job can only run when its dependencies are satisfied it transitively requires the dependencies of all upstream jobs, this means only the immediate upstream dependencies need to be specified in the `requires:` blocks.

{% raw %}

```yaml
version: 2.0

jobs:
  checkout_code:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - checkout
      - save_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  bundle_dependencies:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle install --path vendor/bundle
      - save_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
          paths:
            - ~/circleci-demo-workflows/vendor/bundle

  rake_test:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run: bundle exec rake db:create db:schema:load
      - run:
          name: Run tests
          command: bundle exec rake

  precompile_assets:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
      - save_cache:
          key: v1-assets-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows/public/assets

  deploy:
    machine:
        enabled: true
    working_directory: ~/circleci-demo-workflows
    environment:
      HEROKU_APP: still-shelf-38337
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - restore_cache:
          key: v1-assets-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Deploy Master to Heroku
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP.git master

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - checkout_code
      - bundle_dependencies:
          requires:
            - checkout_code
      - rake_test:
          requires:
            - bundle_dependencies
      - precompile_assets:
          requires:
            - bundle_dependencies
      - deploy:
          requires:
            - rake_test
            - precompile_assets
```

{% endraw %}

## Sample Configuration with Multiple Executor Types (macOS + Docker)

It is possible to use multiple [executor types](https://circleci.com/docs/2.0/executor-types/)
in the same workflow. In the following example each push of an iOS
project will be built on macOS, and additional iOS tools
([SwiftLint](https://github.com/realm/SwiftLint) and
[Danger](https://github.com/danger/danger))
will be run in Docker.

{% raw %}

```yaml
version: 2.1

jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    steps:
      - checkout
      - run:
          name: Install CocoaPods
          command: pod install --verbose
      - run:
          name: Build and run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests
      - store_test_results:
          path: test_output/report.xml
      - store_artifacts:
          path: /tmp/test-results
          destination: scan-test-results
      - store_artifacts:
          path: ~/Library/Logs/scan
          destination: scan-logs

  swiftlint:
    docker:
      - image: dantoml/swiftlint:latest
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:
      - image: dantoml/danger:latest
    steps:
      - checkout
      - run: danger

workflows:
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```

{% endraw %}

## See Also
{:.no_toc}

* See the [Concepts document]({{ site.baseurl }}/2.0/concepts/#configuration) and [Workflows]({{ site.baseurl }}/2.0/workflows/) for more details of the concepts covered in this example.
* See the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/) document for full details of each individual configuration key.
* See the [Example Public Repos]({{ site.baseurl }}/2.0/example-configs/) document for a list of public projects that use CircleCI.
