---
layout: classic-docs
title: "Hello World On Windows"
short-title: "Hello World On Windows"
description: "First Windows project on CircleCI 2.0"
categories: [getting-started]
order: 4
---

This document describes how to get started with continuous integration on **Windows build environments** on CircleCI. If this is your first time setting up CircleCI, we recommended checking out the [getting started guide.]({{ site.baseurl}}/2.0/getting-started/).

* TOC
{:toc}


# Prerequisites

To follow along with this document you will need:

* An [account](https://circleci.com/signup/) on CircleCI.
* A [performance plan](https://circleci.com/pricing/usage/) subscription.
* Pipelines must be [enabled]({{site.baseurl}}/2.0/build-processing/) for your project to use Windows.

# Overview of the Windows executor

The Windows build environment (or `executor`) gives users the tools to build Windows projects, such as a Universal Windows Platform (UWP) application, a .NET executable, or Windows-specific (like the .NET framework) projects. The following specifications detail the capacities and included features of the Windows executor: 

- Is VM-based to guarantee full job isolation.
- Uses the Server Core version of Windows Server 2019 Datacenter Edition.
- Has 4 vCPUS and 15 GB of RAM.
- Powershell is the default shell (Bash and cmd are available to be manually selected).

Note: the Windows executor does not have have support for [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching).

The Windows executor is only available on the CircleCI Performance Plan. Please see the [CircleCI Plans page](https://circleci.com/pricing/usage/) for more details on the cost of Windows compute.

## Windows executor images

Currently CircleCI supports a single Windows image: Windows Server 2019 with Visual Studio 2019. Please see the full contents of the image in the [list of installed software](#software-pre-installed-in-the-windows-images) further along in this document.

# Example configuration file

Get started with Windows on CircleCI with the following configuration snippet that you can paste into your `.circleci/config.yml` file:

```yaml
version: 2.1

orbs:
  win: circleci/windows@1.0.0

jobs:
  build:
    executor: win/vs2019
    steps:
      - checkout
      - run: Write-Host 'Hello, Windows'
```

# Specifying a Shell with the Windows Executor

There are three shells that you can use to run job steps on Windows:

* PowerShell (default in the Windows Orb)
* Bash
* Command

You can configure the shell at the job level or at the step level. It is possible to use multiple shells in the same job. Consider the example below, where we use Bash, Powershell, and Command by adding a `shell:` argument to our `job` and `step` declarations:

```YAML
version: 2.1

orbs:
  win: circleci/windows@1.0.0

jobs:
  build:
    executor:
      name: win/vs2019
      shell: bash.exe
    steps:
      - checkout
      - run: ls -lah
      - run:
          command: ping circleci.com
          shell: cmd.exe
      - run:
          command: echo 'This is powershell'
          shell: powershell.exe
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
  win: circleci/windows@1.0.0
```

Next, we declare orbs that we will be using in our build. We will only use the [windows-tools orb](https://circleci.com/orbs/registry/orb/circleci/windows-tools) to help us get started.

```yaml
jobs:
  build:
    executor:
      name: win/vs2019
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

# Software pre-installed in the Windows images

**Windows Server 2019 with Visual Studio 2019**

* Windows Server 2019 Core Datacenter Edition
* Visual Studio 2019 Community Edition
    * Additional licensing terms may apply to your organisation when using this version of Visual Studio on CircleCI. Please review the [Visual Studio 2019 Community Edition licensing terms](https://visualstudio.microsoft.com/vs/community/#usage) before using this Visual Studio version in your Windows jobs.
    * Azure SDK for Visual Studio 2019
    * Visual Studio 2019 Build Tools
* Shells:
    * Powershell 5
    * Bash
    * cmd
* .NET Framework 4.8
* .NET Core
    * SDK 3.0.100-preview7-012821
    * Runtime 3.0.0-preview6-27804-01
    * SDK 2.2.401 
    * Runtime 2.2.6
    * SDK 2.1.801
* Git 2.22.0
* Git LFS 2.7.2
* Windows 10 SDK
    * 10.0.26624
    * 10.1.18362.1
* Docker Engine - Enterprise version 18.09.7 
* NuGet CLI 5.2.0.6090
* Chocolatey
* Azure Service Fabric
    * SDK 3.3.617.9590
    * Runtime 6.4.617.9590
* OpenJDK 12.0.2
* node.js v12.8.0
* Python 3.7.4
* pyenv
* Ruby 2.6.3
* Go 1.12.7
* Text editors
    * nano 2.5.3
    * vim 8.0.604
* jq 1.5
