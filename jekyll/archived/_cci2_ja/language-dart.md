---
layout: classic-docs
title: "Language Guide: Dart"
short-title: "Dart"
description: "Overview and sample config for a Dart project"
categories:
  - language-guides
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

This document is a walkthrough of a sample Dart project setup on CircleCI. The project cherry-picks `number_guesser` and `number_thinker` code from the [Write HTTP clients & servers](https://dart.dev/tutorials/server/httpserver) tutorial.

We assume you have a basic working knowledge of CircleCI and associated terminology. If not, visit our [Getting Started docs]({{ site.baseurl }}/2.0/getting-started/).

## Quickstart
{: #quickstart }

**Repository**: [circleci-dart-demo](https://github.com/CircleCI-Public/circleci-dart-demo) **Builds**: [circleci-dart-demo on CircleCI](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-dart-demo)

1. Find the full configuration at the bottom of this document or in the repository linked above.
1. Copy that config into [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) in your project's root directory.
1. Modify as needed.

The CircleCI config does the following:

- **It runs the tests in a Docker container.**
    - The `test` job uses the `google/dart` Docker image as its execution image.
    - The tests use the [junitreporter](https://pub.dev/packages/junitreport) package to produce JUnit XML output for CircleCI's [test metadata feature]({{site.baseurl}}/2.0/collect-test-data/), which in turn supports features such as test summary, intelligent test splitting, and insights data/metrics.
- **After tests run, it builds executables for deployment.**
    - `build-docker` uses Google's [`dart-runtime`](https://hub.docker.com/r/google/dart-runtime) as a base to build a Docker container. There's a commented section that pushes to DockerHub. It's there as an example.
    - The other three jobs compile native executables on macOS, Windows, and Linux VMs.
- **All jobs use dependency caching.**
    - The cache keys change according to the `pubspec.lock` file and the `arch` of the system. If the `pubspec.lock` file changes, the cache is invalidated and a new cache is created.
    - `~/.pub-cache` and `.dart_tool` folders are cached by default on Linux and macOS. `~/AppData/Local/Pub/Cache` if Windows.
    - For Dart projects that have it, you'll probably also want to add and cache the `.packages` folder in the main project directory.

If you fork this project and want to push to DockerHub, this project assumes [a context]({{site.baseurl}}/2.0/contexts/) called `dart-docker` with the following variables & keys:

| KEY          | VALUE                             |
| ------------ | --------------------------------- |
| DOCKER_TAG   | The tag/repository for your image |
| DOCKER_LOGIN | Your Docker login                 |
| DOCKER_PWD   | Your Docker password              |
{: class="table table-striped"}

See the config and modify as needed for your use case.

## 設定ファイルの詳細
{: #config-walkthrough }

The first section of the file defines common items. The order in which things are defined in a CircleCI configuration doesn't matter - we have laid it out this way for readability.

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.4.0
```

- **Config Version**: Current is `2.1`. If you are using CircleCI server v2.x, you will need to use config version 2.
- **Orbs**: CircleCI offers [orbs](https://circleci.com/developer/orbs), which are packaged, templatized, and reusable configuration. Here, we include the [Windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) to make use of a pre-defined execution environment later on.

{% raw %}

```yaml
commands:
  dependencies:
    description: "Download dependencies and setup global packages"
    parameters:
      shell:
        type: string
        default: "/bin/bash --login -eo pipefail"
      pub-cache:
        type: string
        default: "~/.pub-cache"
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1.4-dependencies-{{ arch }}-{{ checksum "pubspec.lock" }}
            - v1.4-dependencies-{{ arch }}-
      - run:
          name: Download deps
          shell: << parameters.shell >>
          command: pub get
      - run:
          name: Get junitreporter
          shell: << parameters.shell >>
          command: pub global activate junitreport
      - save_cache:
          key: v1.4-dependencies-{{ arch }}-{{ checksum "pubspec.lock" }}
          paths:
            - .dart_tool
            - << parameters.pub-cache >>

  native-build:
    description: "Runs the dart2native command to build native executable for machine. Artifacts executable"
    parameters:
      shell:
        type: string
        default: "/bin/bash --login -eo pipefail"
    steps:
      - run:
          name: Native compile
          shell: << parameters.shell >>
          command: dart2native bin/server.dart -o circleci_dart_demo.exe
      - store_artifacts:
          path: circleci_dart_demo.exe
```

{% endraw %}

- CircleCI offers [reusable configuration syntax]({{ site.baseurl }}/2.0/reusing-config), which is what our orbs are built off of. Under `commands`, we define a few parameterized commands that run the same sequence of steps.
    - `dependencies` checks out the code and restores/saves a dependency cache (Dart packages downloaded from last build).
    - `native-build` uses the `dart2native` command to compile a native executable for each operating system and then artifacts it, making it available to download from the job details.
    - In both commands, we take parameters to override a cache path and shell for different jobs. Dart's package cache is in a different location in Windows, and it also uses a different shell (Powershell).

```yaml
workflows:
  version: 2.1
  test-and-build:
    jobs:
      - test
      - build-mac:
          requires:
            - test
      - build-windows:
          requires:
            - test
      - build-linux:
          requires:
            - test
      - build-docker:
          # Uncomment/modify context to use secrets (e.g., DockerHub credentials, etc.)
          #context: dart-docker
          requires:
            - test
```

- In the `workflows` section, we define a workflow called `test-and-build` and define which jobs are run.
- Each of the `build-*` jobs depend on `test` passing, which is set by the `requires` key.
- The commented line for `build-docker` uses a `dart-docker` context. See links to resources at the bottom of this document.

```yaml
jobs:
  test:
    docker:
      - image: google/dart:2.9.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - dependencies:
          shell: "/bin/bash -eo pipefail"
      - run:
          name: Make folder for test results
          command: mkdir -p test-results/dart-tests
      - run:
          name: Run tests
          command: pub run test --reporter json | tojunit --output test-results/dart-tests/circleci_dart_demo_test-report.xml
      - store_test_results:
          path: test-results
```

- In the `jobs` section, we define each of the jobs we configured to run in the workflow. The first `test` job runs tests and uses the `junitreporter` to output results in JUnit XML format.

```yaml
  build-mac:
    macos:
      xcode: "12.5.1"
    steps:
      - run:
          name: Install Dart SDK
          command: |
            HOMEBREW_NO_AUTO_UPDATE=1 brew tap dart-lang/dart
            HOMEBREW_NO_AUTO_UPDATE=1 brew install dart
      - dependencies
      - native-build

  build-windows:
    executor: win/default
    steps:
      - run:
          name: Install Dart SDK
          command: choco install dart-sdk
      - dependencies:
          shell: "powershell.exe"
          pub-cache: "~/AppData/Local/Pub/Cache"
      - native-build:
          shell: "powershell.exe"

  build-linux:
    machine: true
    steps:
      - run:
          name: Install Dart SDK
          shell: /bin/bash --login -eo pipefail
          command: |
            # Setup repo & signing key
            sudo apt update
            sudo apt install apt-transport-https
            sudo sh -c 'wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
            sudo sh -c 'wget -qO- https://storage.googleapis.com/download.dartlang.org/linux/debian/dart_stable.list > /etc/apt/sources.list.d/dart_stable.list'

            # Update again and install
            sudo apt update
            sudo apt install dart

            # Set PATH in profile for downstream commands
            echo "export PATH=$PATH:/usr/lib/dart/bin" >> $BASH_ENV
      - dependencies
      - native-build
```

- Each of the `build-*` jobs uses different setup steps to install the Dart runtime and executables.
- Then as defined above, we make use of the same `dependencies` and `native-build` commands, overriding parameters when needed.

```yaml
  build-docker:
    docker:
      - image: cimg/base:2020.08
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - setup_remote_docker
      - checkout
      - run:
          name: Build & tag Docker image
          command: docker build -t circleci/circleci-dart-demo -t circleci/circle-dart-demo:${CIRCLE_SHA1} .
      # Uncomment the following to use DOCKER_* env variables defined in context set above (line 79) and push to DockerHub
      #- run:
          #name: Build & tag Docker image
          #command: docker build -t ${DOCKER_TAG} -t ${DOCKER_TAG}:${CIRCLE_SHA1} .
      #- run:
          #name: Login to DockerHub and push
          #command: |
          # echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin
          # docker push ${DOCKER_TAG}
          # docker push ${DOCKER_TAG}:${CIRCLE_SHA1}
```

- The final job builds a Docker image using Google's [`dart-runtime`](https://hub.docker.com/r/google/dart-runtime) as a base.
- The commented section is code to build, tag, and push a Docker image according to environment variables defined in a [context]({{site.baseurl}}/2.0/contexts/). It's included as an example.

## Full sample configuration
{: #full-sample-configuration }

Below is the entirety of the file. Additional resources and links to supporting documentation can be found below.

{% raw %}

```yaml
# Author @mvxt
version: 2.1

#####################
# Common Definitions
#####################

# Orb declarations
orbs:
  win: circleci/windows@2.4.0

# Simple YAML anchors
aliases:
  - &project_dir "~/project"

commands:
  dependencies:
    description: "Download dependencies and setup global packages"
    parameters:
      shell:
        type: string
        default: "/bin/bash --login -eo pipefail"
      pub-cache:
        type: string
        default: "~/.pub-cache"
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1.4-dependencies-{{ arch }}-{{ checksum "pubspec.lock" }}
            - v1.4-dependencies-{{ arch }}-
      - run:
          name: Download deps
          shell: << parameters.shell >>
          command: pub get
      - run:
          name: Get junitreporter
          shell: << parameters.shell >>
          command: pub global activate junitreport
      - save_cache:
          key: v1.4-dependencies-{{ arch }}-{{ checksum "pubspec.lock" }}
          paths:
            - .dart_tool
            - << parameters.pub-cache >>

  native-build:
    description: "Runs the dart2native command to build native executable for machine. Artifacts executable"
    parameters:
      shell:
        type: string
        default: "/bin/bash --login -eo pipefail"
    steps:
      - run:
          name: Native compile
          shell: << parameters.shell >>
          command: dart2native bin/server.dart -o circleci_dart_demo.exe
      - store_artifacts:
          path: circleci_dart_demo.exe

###### ################
# Workflow definition
###### ################
workflows:
  version: 2.1
  test-and-build:
    jobs:
      - test
      - build-mac:
          requires:
            - test
      - build-windows:
          requires:
            - test
      - build-linux:
          requires:
            - test
      - build-docker:
          # Uncomment/modify context to use secrets (e.g., DockerHub credentials, etc.)
          #context: dart-docker
          requires:
            - test

##################
# Job Definitions
##################
jobs:
  test:
    docker:
      - image: google/dart:2.9.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - dependencies:
          shell: "/bin/bash -eo pipefail"
      - run:
          name: Make folder for test results
          command: mkdir -p test-results/dart-tests
      - run:
          name: Run tests
          command: pub run test --reporter json | tojunit --output test-results/dart-tests/circleci_dart_demo_test-report.xml
      - store_test_results:
          path: test-results

  build-mac:
    macos:
      xcode: "12.5.1"
    steps:
      - run:
          name: Install Dart SDK
          command: |
            HOMEBREW_NO_AUTO_UPDATE=1 brew tap dart-lang/dart
            HOMEBREW_NO_AUTO_UPDATE=1 brew install dart
      - dependencies
      - native-build

  build-windows:
    executor: win/default
    steps:
      - run:
          name: Install Dart SDK
          command: choco install dart-sdk
      - dependencies:
          shell: "powershell.exe"
          pub-cache: "~/AppData/Local/Pub/Cache"
      - native-build:
          shell: "powershell.exe"

  build-linux:
    machine: true
    steps:
      - run:
          name: Install Dart SDK
          shell: /bin/bash --login -eo pipefail
          command: |
            # Setup repo & signing key
            sudo apt update
            sudo apt install apt-transport-https
            sudo sh -c 'wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
            sudo sh -c 'wget -qO- https://storage.googleapis.com/download.dartlang.org/linux/debian/dart_stable.list > /etc/apt/sources.list.d/dart_stable.list'

            # Update again and install
            sudo apt update
            sudo apt install dart

            # Set PATH in profile for downstream commands
            echo "export PATH=$PATH:/usr/lib/dart/bin" >> $BASH_ENV
      - dependencies
      - native-build

  build-docker:
    docker:
      - image: cimg/base:2020.08
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - setup_remote_docker
      - checkout
      - run:
          name: Build & tag Docker image
          command: docker build -t circleci/circleci-dart-demo -t circleci/circle-dart-demo:${CIRCLE_SHA1} .
      # Uncomment the following to use DOCKER_* env variables defined in context set above (line 79) and push to DockerHub
      #- run:
          #name: Build & tag Docker image
          #command: docker build -t ${DOCKER_TAG} -t ${DOCKER_TAG}:${CIRCLE_SHA1} .
      #- run:
          #name: Login to DockerHub and push
          #command: |
          # echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin
          # docker push ${DOCKER_TAG}
          # docker push ${DOCKER_TAG}:${CIRCLE_SHA1}
```

{% endraw %}

## Additional resources
{: #additional-resources }

- [はじめよう]({{site.baseurl}}/2.0/getting-started/#section=getting-started)
- [Migrating to CircleCI]({{site.baseurl}}/2.0/migration-intro/#section=getting-started)
- [依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)
- [データベースの構成]({{ site.baseurl }}/2.0/databases/)
- [Deploying on CircleCI]({{site.baseurl}}/2.0/deployment-integrations/#section=deployment)
- [コンテキストの使用]({{site.baseurl}}/2.0/contexts/)
- [設定に関するリファレンス]({{site.baseurl}}/2.0/configuration-reference/#section=configuration)
