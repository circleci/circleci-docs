---
layout: classic-docs
title: "Hello World On Windows"
short-title: "Hello World On Windows"
description: "First Windows project on CircleCI"
categories: [getting-started]
order: 4
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes how to get started with continuous integration on **Windows execution environments** on CircleCI. If this is your first time setting up CircleCI, we recommend checking out the [Getting Started guide]({{ site.baseurl}}/getting-started/).

* TOC
{:toc}


A Windows Server 2022 image is now available to CircleCI Cloud customers, read more on [Discuss](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198).
{: class="alert alert-warning"}

## Prerequisites
{: #prerequisites }

To follow along with this document you will need:

* An [account](https://circleci.com/signup/) on CircleCI.
* Either the Free, Performance, or Scale [plan](https://circleci.com/pricing/usage/).

## Example application
{: #example-application }

Let us consider a more advanced (but still introductory) "hello world" application using the Windows executor. This [example application](https://github.com/CircleCI-Public/circleci-demo-windows) still prints "Hello World" to the console, but does so using .NET core to create an executable, uses dependency caching, and creates an artifact on every build.

**Note:** If you are using Windows on CircleCI server, replace usage of orbs with a machine image, as described in the [Using the Windows executor on CircleCI server](#windows-on-server) section.

You can view the entire configuration [here](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml). It also includes browser and UI testing, but we will focus on the `hello-world` workflow for now.

```yaml
version: 2.1
```

Above, we start by declaring that we will use version `2.1` of CircleCI, giving us access to [Orbs](https://circleci.com/orbs/) and [Pipelines]({{site.baseurl}}/pipelines/).

```yaml
orbs:
  win: circleci/windows@4.1.1
```

Next, we declare orbs that we will be using in our build. We will only use the [Windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) to help us get started. This example uses the 2.4.0 version of the orb, but you may consider using a more recent version.

```yaml
workflows:
  hello-world:
    jobs:
      - build
```

We define a `hello-world` workflow, in which we run a single job named `build`.

```yaml
jobs:
  build:
    executor:
      name: win/default
```

Under the `jobs` key, we define the `build` job, and set the executor via the orb we are using.

```yaml
    steps:
      - checkout
```

In our first step, we run the [`checkout`]({{ site.baseurl}}/configuration-reference/#checkout) command to pull our source code from our version control system.

```yaml
      - restore_cache:
          keys:
      - run:
          name: "Install project dependencies"
          command: dotnet.exe restore
      - save_cache:
          paths:
            - C:\Users\circleci\.nuget\packages
```

Next in the config, we make use of caching to restore cached dependencies from previous builds. The command `dotnet restore` will fetch any dependencies that are not already installed/restored from the cache. Learn more about caching in our [caching document]({{ site.baseurl}}/caching).

```yaml
      - run:
          name: "Run Build step"
          command: dotnet.exe publish -c Release -r win10-x64
      - run:
          name: "Test the executable"
          command: .\bin\Release\netcoreapp2.1\win10-x64\publish\circleci-demo-windows.exe
```

Next, we run two steps: one to build the executable for Windows 10, and another to test the executable (expecting to see “Hello World” printed to the console).

```yaml
      - store_artifacts:
          path: .\bin\Release\netcoreapp2.1\win10-x64\publish\circleci-demo-windows.exe
```

In our last step, we store the build executable as an artifact, making it accessible with the CircleCI web application or API.



## Next steps
{: #next-steps }

Consider reading documentation on some of CircleCI’s features:

* See the [Concepts]({{site.baseurl}}/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a .circleci/config.yml file.
* Refer to the [Workflows]({{site.baseurl}}/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.
* Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{site.baseurl}}/configuration-reference/) and [CircleCI Images]({{site.baseurl}}/circleci-images/) documentation, respectively.
