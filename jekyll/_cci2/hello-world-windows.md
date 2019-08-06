---
layout: classic-docs
title: "Hello World On Windows"
short-title: "Hello World On Windows"
description: "First Windows project on CircleCI 2.0"
categories: [getting-started]
order: 4
---

This document describes how to get started with continuous integration on **Windows build environments** on CircleCI. If this is your first time setting up CircleCI, we recommended checking out the [getting started guide.]({{ site.baseurl}}/2.0/getting-started/) Please note, Windows access is currently in a **preview phase** and is **not** production ready.

# Prerequisites

To follow along with this document you will need:

* An [account](https://circleci.com/signup/) on CircleCI
* A [performance plan](https://circleci.com/pricing/usage/) subscription
* Pipelines must be [enabled]({{site.baseurl}}/2.0/build-processing/) (to enable Orbs and a 2.1 config).
* To request access to Windows Preview using [this form](https://docs.google.com/forms/d/e/1FAIpQLSfspug2MP0eTK8eRC1_FpiDQzNHkk8a36fflN_za29CwGzGoQ/viewform).


# Overview of the Windows executor

The Windows build environment (or `executor`) gives users the tools to build Windows projects, such as a Universal Windows Platform (UWP) application, a .NET executable, or Windows-specific (like the .NET framework) projects. The following specifications detail the capacities and included features of the Windows executor: 

- Uses the Server Core version of Windows Server 2019 DataCenter Edition (`windows-server-2019`.)
- Has 4 vCPUS and 15 GB of ram.
- Has `Git`, `Chocolatey` and `7zip` pre-installed.
- Powershell is the default shell (Bash and Command are available to be manually selected).

The Windows executor does not have have support for [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching).

# Example configuration file

The following code snippet is an absolute minimum to get started with Windows on CircleCI:

```yaml
version: 2.1

orbs:
  win: circleci/windows@1.0.0

jobs:
  build:
    executor: win/preview-default
    steps:
      - checkout
      - run: Write-Host 'Hello, Windows'

```

# Example Application

Let’s consider a more advanced (but still introductory) "hello world" application using the Windows executor. This [example application](https://github.com/CircleCI-Public/circleci-demo-windows) still prints "Hello World" to the console, but does so using .NET core to create an executable, uses dependency caching, and creates an artifact on every build.

You can view the entire configuration [here](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml).

```yaml
version: 2.1
```

Above, we start by declaring that we will use version `2.1` of CircleCI, giving us access to [Orbs](https://circleci.com/orbs/) and [Pipelines]({{site.baseurl}}/2.0/build-processing/).

```yaml
orbs:
  
  circleci/windows@1.0.0
```

Next, we declare orbs that we will be using in our build. We will only use the [windows-tools orb](https://circleci.com/orbs/registry/orb/circleci/windows-tools) to help us get started.

```yaml
jobs:
  build:
    executor:
      name: win/preview-default
      shell: powershell.exe
```

Under the `jobs` key, we set the executor via the orb we are using. We can also declare the default shell to be applied across future steps in the configuration. The default shell is `Powershell.exe`

```yaml
    steps:
      - checkout
      - run:
          name: "Install dotnet core"
          command: |
            choco install dotnetcore-sdk
            refreshenv
            dotnet.exe --info
```

In our first step, we run the [`checkout`]({{ site.baseurl}}/2.0/configuration-reference/#checkout) command to pull our source code from our version control system. Next, we install .NET core via a powershell script included in the [.circleci folder](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/dotnet-install.ps1). As the comment in our config makes note, we have gotten the powershell script to install .NET core from Microsoft’s .NET documentation. While we could pull the script dynamically and run it using curl or powershell, we have vendored it into the project to have one less dependency in the tutorial.

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

Next in the config, we make use of caching to restore cached dependencies from previous builds. The command `dotnet restore` will fetch any dependencies that are not already installed/restored from the cache. Learn more about caching in our [caching document]({{ site.baseurl}}/2.0/caching).

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

# Next Steps

Also, consider reading documentation on some of CircleCI’s features:

* See the [Concepts]({{site.baseurl}}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a .circleci/config.yml file.
* Refer to the [Workflows]({{site.baseurl}}/2.0/workflows) document for examples of orchestrating job runs with parallel, sequential, scheduled, and manual approval workflows.
* Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{site.baseurl}}/2.0/configuration-reference/) and [CircleCI Images]({{site.baseurl}}/2.0/circleci-images/) documentation, respectively.
