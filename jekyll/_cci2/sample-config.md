---
layout: classic-docs
title: "Sample config.yml Files"
description: "Sample config.yml File"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

This document provides sample `.circleci/config.yml` files that you can use as a starting point when setting up projects, or to better understand different ways to orchestrate jobs using workflows and filters. For information on all configuration elements available to you, see the [Configuration reference](/docs/configuration-reference/) page.

## Tools for editing configuration files
{: tools-for-editing-configuration-files }

CircleCI has created an [extension for Visual Studio Code](/docs/vs-code-extension-overview/) that reduces context switching between the web app and VS Code through a set of helpful features.

The VS Code extension reduces the time to create, modify, and troubleshoot configuration files through real-time syntax validation, highlighting, and autocomplete suggestions. Authenticating the extension with your CircleCI account will also allow you to visualize and manage your CircleCI pipelines directly from your code editor, and be notified of workflow status changes.

The CircleCI VS Code extension is available to download on the [VS Code marketplace](https://marketplace.visualstudio.com/items?itemName=circleci.circleci).

## Simple configuration examples
{: #simple-configuration-examples }

### Concurrent workflow
{: #concurrent-workflow }

The configuration example below shows a concurrent workflow in which the `build` and `test` jobs run at the same time. Both jobs are run in Docker containers using the base image provided by CircleCI.

* Refer to the [Workflows](/docs/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.
* Refer to the [Developer Hub convenience images](https://circleci.com/developer/images?imageType=docker) page to find out about available Docker images for running your jobs.

This image shows the workflow view for the following configuration example:

![Concurrent Workflow Graph]({{ site.baseurl }}/assets/img/docs/concurrent-workflow-map.png)

```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the test job"

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test
```

### Sequential workflow
{: #sequential-workflow }

The configuration example below shows a sequential workflow where the `build` job runs, and then the `test` job runs once `build` has completed. This is achieved by using the [`requires` key](/docs/configuration-reference/#requires), and specifying the `test` job "requires" the `build` job in order to run. Both jobs are run in Docker containers using the base image provided by CircleCI.

* Refer to the [Workflows](/docs/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.
* Refer to the [developer hub convenience images](https://circleci.com/developer/images?imageType=docker) page to find out about available Docker images for running your jobs.

This image shows the workflow view for the following configuration example, in which jobs run sequentially (one after the other):

![Sequential Workflow Graph]({{ site.baseurl }}/assets/img/docs/sequential-workflow-map.png)

```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the test job"

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

### Approval job
{: #approval-job }

The example below shows a sequential workflow with an [approval step](/docs/configuration-reference/#type). The `build` job runs, then the `test` job, then a `hold` job, with `type: approval` ensuring the workflow waits for manual approval in the CircleCI web app before the `deploy` job can run. All jobs run in Docker containers using the base image provided by CircleCI.

* Refer to the [Workflows](/docs/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.
* Refer to the [developer hub convenience images](https://circleci.com/developer/images?imageType=docker) page to find out about available Docker images for running your jobs.

This image shows the workflow view for the following configuration example. This image has three parts to show the approval popup that appears when you click on a hold step in the app, and then the workflow view again once the `hold` job has been approved and the `deploy` job has run:

![Approval Workflow Graph]({{ site.baseurl }}/assets/img/docs/approval-workflow-map.png)

```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the test job"
  deploy:
    docker:
      - image: cimg/base:2023.03
    steps:
      - checkout
      - run: echo "this is the deploy job"

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

## Sample configuration with sequential workflow and secondary Docker container
{: #sample-configuration-with-sequential-workflow }

Following is a sample `.circleci/config.yml` file using the following configuration features:

* A sequential workflow
* An orb
* A secondary services container
* Workspaces
* Storing artifacts

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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:4.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
            mongo localhost --eval "db.serverStatus()"
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
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

This example shows a sequential workflow with the `test` job configured to run only on the main branch. Refer to the [Workflows]({{ site.baseurl }}/workflows) document for complete details about orchestrating job runs with concurrent, sequential, and manual approval workflows.

## Sample configuration with fan-in/fan-out workflow
{: #sample-configuration-with-fan-infan-out-workflow }
Below are two sample configurations for a Fan-in/Fan-out workflow.

![Fan-in-out]({{ site.baseurl }}/assets/img/docs/fan-in-out-example.png)

{:.tab.fan-in-out.Cloud}
{% raw %}
```yaml
version: 2.1

orbs:
    docker: circleci/docker@1.0.1

jobs:
    prepare-dependencies:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        steps:
            - checkout
            - run:
                  name: Compute version number
                  command: echo "0.0.${CIRCLE_BUILD_NUM}-${CIRCLE_SHA1:0:7}" | tee version.txt
            - restore_cache:
                  keys:
                      - yarn-deps-{{ checksum "yarn.lock" }}
                      - yarn-deps
            - run:
                  name: yarn install
                  command: yarn install
            - save_cache:
                  paths:
                      - node_modules
                  key: yarn-deps-{{ checksum "yarn.lock" }}-{{ epoch }}
            - store_artifacts:
                  path: yarn.lock
            - persist_to_workspace:
                  root: .
                  paths:
                      - .

    build-production:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: Production build
                  command: |
                      export __BUILD_VERSION="$(cat version.txt)"
                      yarn build
            - store_artifacts:
                  path: dist/server.js
            - persist_to_workspace:
                  root: .
                  paths:
                      - .

    build-docker-image:
        machine:
            # The image uses the current tag, which always points to the most recent
            # supported release. If stability and determinism are crucial for your CI
            # pipeline, use a release date tag with your image, e.g. ubuntu-2004:202201-02
            image: ubuntu-2004:current
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: Setup __BUILD_VERSION envvar
                  command: |
                      echo 'export __BUILD_VERSION="$(cat version.txt)"' >> "$BASH_ENV"
            - docker/check:
                  registry: $DOCKER_REGISTRY
            - docker/build:
                  image: $DOCKER_IMAGE_NAME
                  tag: $__BUILD_VERSION
                  registry: $DOCKER_REGISTRY
            - docker/push:
                  image: $DOCKER_IMAGE_NAME
                  tag: $__BUILD_VERSION
                  registry: $DOCKER_REGISTRY

    test:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        parallelism: 2
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: Run tests
                  command: |
                      circleci tests glob '**/*.test.ts' | circleci tests split --split-by timings | xargs yarn test:ci
            - store_artifacts:
                  path: test-results
            - store_test_results:
                  path: test-results

    deploy-docker-image:
        machine:
            image: ubuntu-2004:current
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: Setup __BUILD_VERSION envvar
                  command: |
                      echo 'export __BUILD_VERSION="$(cat version.txt)"' >> "$BASH_ENV"
            - docker/check:
                  registry: $DOCKER_REGISTRY
            - docker/pull:
                  images: $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$__BUILD_VERSION
            - run:
                  name: Tag the image as latest
                  command: docker tag $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$__BUILD_VERSION $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest
            - docker/push:
                  image: $DOCKER_IMAGE_NAME
                  tag: latest
                  registry: $DOCKER_REGISTRY

workflows:
    build-test-deploy:
        jobs:
            - prepare-dependencies
            - build-production:
                  requires:
                      - prepare-dependencies
            - build-docker-image:
                  context: docker-hub
                  requires:
                      - build-production
            - test:
                  requires:
                      - prepare-dependencies
            - deploy-docker-image:
                  context: docker-hub
                  requires:
                      - build-docker-image
                      - test
```
{% endraw %}

**Note:** a job can only run when its dependencies are satisfied therefore it requires the dependencies of all upstream jobs. This means only the immediate upstream dependencies need to be specified in the `requires:` blocks.

## Sample configuration with multiple executor types
{: #sample-configuration-with-multiple-executor-types }

It is possible to use multiple [executor types]({{site.baseurl}}/executor-intro/)
in the same workflow.

In `Example-1` each push will build and test the project on Linux, Windows and macOS.

In `Example-2` each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

{:.tab.multiple-executors.Example-1}
```yaml
version: 2.1

orbs:
  github-release: haskell-works/github-release@1.3.3

parameters:
  src-repo-url:
    type: string
    default: https://github.com/esnet/iperf.git
  branch-name:
    type: string
    default: "3.8.1"
  common-build-params:
    type: string
    default: "--disable-shared --disable-static"

jobs:
  build-linux:
    docker:
      - image: archlinux/base
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parameters:
      label:
        type: string
        default: iperf3-linux
    steps:
      - run:
          name: Install dependencies
          command: pacman -Syu --noconfirm openssl git gcc make awk tar
      - run:
          name: Clone iperf3
          command: git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
      - run:
          name: Build iperf3
          working_directory: iperf
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            ./configure --prefix=$IPERF3_MAKE_PREFIX << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
      - run:
          name: Create a tarball
          command: tar -cJf << parameters.label >>.tar.xz << parameters.label >>
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.tar.xz
      - store_artifacts:
          path: << parameters.label >>.tar.xz

  build-windows:
    machine:
      image: windows-server-2019-vs2019:stable
      shell: powershell.exe
    resource_class: windows.medium
    parameters:
      label:
        type: string
        default: iperf3-cygwin64
    steps:
      - run:
          name: Download Cygwin installer
          shell: bash.exe
          command: |
            curl -sSJOL https://cygwin.com/setup-x86_64.exe
      - run:
          name: Install Cygwin and required packages
          command: .\setup-x86_64.exe -q -s https://mirrors.kernel.org/sourceware/cygwin/ -P libssl-devel,git,gcc-core,make
      - run:
          name: Build iperf3 with Cygwin
          shell: C:\\cygwin64\\bin\\bash.exe --login -eo pipefail
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            cd $CIRCLE_WORKING_DIRECTORY
            git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
            cd iperf
            ./configure --prefix=$IPERF3_MAKE_PREFIX << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
            cp /usr/bin/cygwin1.dll /usr/bin/cygcrypto-1.1.dll /usr/bin/cygz.dll -t $IPERF3_MAKE_PREFIX/bin
      - run:
          name: Create a Zip file
          command: |
            $ProgressPreference = "SilentlyContinue"
            Compress-Archive .\\<< parameters.label >> .\\<< parameters.label >>.zip
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.zip
      - store_artifacts:
          path: << parameters.label >>.zip

  build-macos:
    macos:
      xcode: 14.2.0
    parameters:
      label:
        type: string
        default: iperf3-macos
    steps:
      - run:
          name: Clone iperf3
          command: git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
      - run:
          name: Build iperf3
          working_directory: iperf
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            ./configure --prefix=$IPERF3_MAKE_PREFIX --with-openssl=$(brew --prefix openssl) << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
            # Postruns
            cd $IPERF3_MAKE_PREFIX/bin
            # Copy linked OpenSSL libraris to the current directory
            # and tell the linker to refer to them
            otool -L iperf3 | grep openssl | awk '{ print $1 }' | while read dylib
            do
              name=$(basename $dylib)
              cp $dylib ./
              chmod u+w $name
              install_name_tool -change $dylib @executable_path/$name iperf3
            done
            # Modify libssl as well
            otool -L libssl.1.1.dylib | grep openssl | awk '{ print $1 }' | while read dylib
            do
              install_name_tool -change $dylib @executable_path/$(basename $dylib) libssl.1.1.dylib
            done
      - run:
          name: Create a Zip file
          command: zip -r << parameters.label >>.zip << parameters.label >>
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.zip
      - store_artifacts:
          path: << parameters.label >>.zip

  test-linux:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    parameters:
      label:
        type: string
        default: iperf3-linux
    steps:
      - attach_workspace:
          at: ./
      - run:
          name: Extract << parameters.label >>.tar.xz
          command: tar -xf << parameters.label >>.tar.xz
      - run:
          name: Test executable
          command: << parameters.label >>/bin/iperf3 -v
      - run:
          name: Run as a server
          command: << parameters.label >>/bin/iperf3 -s
          background: true
      - run:
          name: Run as a client
          command: << parameters.label >>/bin/iperf3 -c localhost -R

  test-windows:
    machine:
      image: windows-server-2019-vs2019:stable
      shell: powershell.exe
    resource_class: windows.medium
    parameters:
      label:
        type: string
        default: iperf3-cygwin64
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Extract iperf3-cygwin64.zip
          command: |
            $ProgressPreference = "SilentlyContinue"
            Expand-Archive .\\<< parameters.label >>.zip .
      - run:
          name: Test executable
          command: .\\<< parameters.label >>\bin\iperf3.exe -v
      - run:
          name: Run as a server
          command: .\\<< parameters.label >>\bin\iperf3.exe -s
          background: true
      - run:
          name: Run as a client
          command: .\\<< parameters.label >>\bin\iperf3.exe -c localhost -R

  test-macos:
    macos:
      xcode: 14.2.0
    parameters:
      label:
        type: string
        default: iperf3-macos
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Uninstall pre-installed OpenSSL
          command: brew uninstall --ignore-dependencies openssl
      - run:
          name: Extract << parameters.label >>
          command: unzip << parameters.label >>
      - run:
          name: Test executable
          command: << parameters.label >>/bin/iperf3 -v
      - run:
          name: Run as a server
          command: << parameters.label >>/bin/iperf3 -s
          background: true
      - run:
          name: Run as a client
          command: << parameters.label >>/bin/iperf3 -c localhost -R

  release:
    executor: github-release/default
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Compute version number
          command: |
            echo 'export IPERF3_BUILD_VERSION="<< pipeline.parameters.branch-name>>-${CIRCLE_BUILD_NUM}-${CIRCLE_SHA1:0:7}"' | tee -a "$BASH_ENV"
      - github-release/release:
          tag: v$IPERF3_BUILD_VERSION
          title: $IPERF3_BUILD_VERSION
          artefacts-folder: .

workflows:
  build-test-release:
    jobs:
      - build-linux
      - build-windows
      - build-macos
      - test-linux:
          requires:
            - build-linux
      - test-windows:
          requires:
            - build-windows
      - test-macos:
          requires:
            - build-macos
      - release:
          requires:
            - test-linux
            - test-windows
            - test-macos
          context: github
          filters:
            branches:
              only: main
```

{:.tab.multiple-executors.Example-2}
{% raw %}
```yaml
version: 2.1

jobs:
  build-and-test:
    macos:
      xcode: 14.2.0
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

## See also
{: #see-also }

* See the [Concepts document]({{ site.baseurl }}/concepts/#configuration) and [Workflows]({{ site.baseurl }}/workflows/) for more details of the concepts covered in this example.
* See the [Configuration Reference]({{ site.baseurl }}/configuration-reference/) document for full details of each individual configuration key.
* See the [Example Public Repos]({{ site.baseurl }}/example-configs/) document for a list of public projects that use CircleCI.
