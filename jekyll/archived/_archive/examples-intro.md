---
layout: classic-docs
title: "Examples"
short-title: "Examples"
description: "CircleCI Examples Introduction"
categories: [migration]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---


It is possible to build, test, and deploy applications that run on Linux, Android, iOS and Windows with CircleCI. See the following snippets for a peek into how you can customize the configuration of a job for any platform. You may also configure jobs to run on multiple platforms in a single [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file.

## Linux with Docker
{: #linux-with-docker }

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # The primary container is an instance of the first image listed. The job's commands run in this container.
    docker:
      - image: cimg/node:17.3.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
```

{% endraw %}

## Linux with machine
{: #linux-with-machine }

**Note**: Use of machine may require additional fees in a future pricing update.

To use the machine executor with the default machine image, set the machine key to true in `.circleci/config.yml`:

```yaml
version: 2
jobs:
  build:
    machine: true
```

## Android
{: #android }

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: cimg/android:2021.10.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      JVM_OPTS: -Xmx3200m
    steps:
      - checkout
      - restore_cache:
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
#      - run:
#         name: Chmod permissions #if permission for Gradlew Dependencies fail, use this.
#         command: sudo chmod +x ./gradlew
      - run:
          name: Download Dependencies
          command: ./gradlew androidDependencies
```

{% endraw %}

## macOS
{: #macos }
```yml
jobs:
  build-and-test:
    macos:
      xcode: "12.5.1"
    steps:
      ...
      - run:
          name: Run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

## Windows
{: #windows }

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor:
      name: win/default # executor type
      size: "medium" # resource class, can be "medium", "large", "xlarge", "2xlarge", defaults to "medium" if not specified

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

## See also
{: #see-also }

Learn more about the [executor types]({{ site.baseurl }}/2.0/executor-intro/) used in the examples above.
