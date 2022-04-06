---
layout: classic-docs
title: "Hello World On Windows"
short-title: "Hello World On Windows"
description: "First Windows project on CircleCI"
categories: [getting-started]
order: 4
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document describes how to get started with continuous integration on **Windows execution environments** on CircleCI. If this is your first time setting up CircleCI, we recommend checking out the [Getting Started guide]({{ site.baseurl}}/2.0/getting-started/).

* TOC
{:toc}

<div class="alert alert-warning" role="alert">
  <strong>A Windows Server 2022 image is now available to CircleCI Cloud customers, read more on <a href="https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198">Discuss</a></strong>.
</div>


## Prerequisites
{: #prerequisites }

To follow along with this document you will need:

* An [account](https://circleci.com/signup/) on CircleCI.
* Either the Free, Performance, or Scale [plan](https://circleci.com/pricing/usage/). If you are running CircleCI server there are alternative code examples below.
* For the Cloud version, pipelines must be [enabled]({{site.baseurl}}/2.0/build-processing/) for your project to use Windows.

## Overview of the Windows executor
{: #overview-of-the-windows-executor }

The Windows execution environment (or `executor`) gives users the tools to build Windows projects, such as a Universal Windows Platform (UWP) application, a .NET executable, or Windows-specific (like the .NET framework) projects. The following specifications detail the capacities and included features of the Windows executor:

- Is VM-based to guarantee full job isolation.
- Can use either the Server Core version of Windows Server 2019 Datacenter Edition, or Windows Server 2022 Datacenter edition.
- Powershell is the default shell (Bash and cmd are available to be manually selected).
- Docker Engine - Enterprise is available for running Windows containers.

**Notes:**

- The Windows executor currently only supports Windows containers. Running Linux containers on Windows is not possible for now.
- Orb usage is not supported on CircleCI Server v2.x (please view the "server" code samples for server usage.)

## Windows executor images
{: #windows-executor-images }

CircleCI supports Windows Server 2019 with Visual Studio 2019 and Windows Server 2022 with Visual Studio 2022. Contact your systems administrator for details of what is included in CircleCI Server Windows images, or visit the [Discuss](https://discuss.circleci.com/) page.

Details on the Windows Server 2022 image can be found on [Discuss](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198/1).

The Windows images are updated approximately every 30 days. If a tag is not specified when using the Windows image, by default the latest stable version will be applied. The tagging scheme for the Windows image is as follows:

- Stable: This image tag points to the latest production ready Windows image. This image should be used by projects that want a decent level of stability, but would like to get occasional software updates. It is typically updated once a month.<br>

The new `current` tag is available for Windows images and will eventually completely replace `stable`. Refer to the [Discuss forum](https://discuss.circleci.com/t/april-2022-windows-image-updates-available-for-stable-tags/43511) for more information.
{: class="alert alert-info"}

- Previous: This image tag points to the previous ("stable") production ready Windows image. This image can be used in cases where there was a breaking change in the latest software updates. It is typically updated once a month.

- Edge: This image tag points to the latest version of the Windows image, and is built from the HEAD of the main branch. This tag is intended to be used as a testing version of the image with the most recent changes, and not guaranteed to be stable.

Please note that it is possible to run Windows Docker Containers on the Windows executor like so:

{:.tab.windowsblockone.Cloud}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1

jobs:
  build:
    executor:
      name: win/default
      shell: powershell.exe
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Check docker"
          shell: powershell.exe
          command: |
            docker info
            docker run hello-world:nanoserver-1809
```

{:.tab.windowsblockone.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Check docker"
          shell: powershell.exe
          command: |
            docker info
            docker run hello-world:nanoserver-1809
```

Note that in order to use the Windows Server 2022 image in CircleCI cloud, it must be specified as the `executor`, as shown in the following:
{: class="alert alert-info"}

```yaml
version: 2.1
orbs:
  win: circleci/windows@4.1
jobs:
  build:
    executor: win/server-2022
    steps:
      - run: Write-Host 'Hello, Windows'
workflows:
  my-workflow:
    jobs:
      - build
```

Additionally, it is possible to access the Windows image directly in your jobs without using the orb:

```yaml
jobs:
  build-windows:
    machine:
      image: windows-server-2022:current
      resource_class: windows.medium
      shell: powershell.exe -ExecutionPolicy Bypass
```

With that said, we strongly encourage using the orb as it helps simplify your configuration.

## Known issues
{: #known-issues }

These are the issues with the Windows executor that we are aware of and will address as soon as we can:

* Connecting to a Windows job via SSH and using the `bash` shell results in an empty terminal prompt.
* It is currently not possible to do nested virtualization (for example, using the `--platform linux` flag).

## Example configuration file
{: #example-configuration-file }

Get started with Windows on CircleCI with the following configuration snippet that you can paste into your `.circleci/config.yml` file:

{:.tab.windowsblocktwo.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@4.1 # The Windows orb give you everything you need to start using the Windows executor.

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

{:.tab.windowsblocktwo.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblocktwo.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

From here we will use the version 2.1 syntax to discuss using the Windows executor, but if you're using Server, you can follow along with the executor definition syntax described above.

## Specifying a Shell with the Windows Executor
{: #specifying-a-shell-with-the-windows-executor }

There are three shells that you can use to run job steps on Windows:

* PowerShell (default in the Windows Orb)
* Bash
* Command

You can configure the shell at the job level or at the step level. It is possible to use multiple shells in the same job. Consider the example below, where we use Bash, Powershell, and Command by adding a `shell:` argument to our `job` and `step` declarations:


{:.tab.windowsblockthree.Cloud}
```YAML
version: 2.1

orbs:
  win: circleci/windows@4.1

jobs:
  build:
    executor:
      name: win/default
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

{:.tab.windowsblockthree.Server_3}
```YAML
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

{:.tab.windowsblockthree.Server_2}
```YAML
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

**Note:** It is possible to install updated or other Windows shell-tooling as well; for example, you could install the latest version of Powershell Core with the `dotnet` cli and use it in a job's successive steps:


{:.tab.windowsblockfour.Cloud}
```YAML

version: 2.1

orbs:
  win: circleci/windows@4.1

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1

```

{:.tab.windowsblockfour.Server_3}
```YAML
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1
```

{:.tab.windowsblockfour.Server_2}
```YAML
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1
```

## Example application
{: #example-application }

Let’s consider a more advanced (but still introductory) "hello world" application using the Windows executor. This [example application](https://github.com/CircleCI-Public/circleci-demo-windows) still prints "Hello World" to the console, but does so using .NET core to create an executable, uses dependency caching, and creates an artifact on every build. **Note:** If you are using Windows on CircleCI server, replace usage of orbs with a machine image as described in the previous code samples.

You can view the entire configuration [here](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml). It also includes browser and UI testing, but we'll focus on the `hello-world` workflow for now. 

```yaml
version: 2.1
```

Above, we start by declaring that we will use version `2.1` of CircleCI, giving us access to [Orbs](https://circleci.com/orbs/) and [Pipelines]({{site.baseurl}}/2.0/build-processing/).

```yaml
orbs:
  win: circleci/windows@2.4.0
```

Next, we declare orbs that we will be using in our build. We will only use the [windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) to help us get started. This example uses the 2.4.0 version of the orb, but you may consider using a more recent version.

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

In our first step, we run the [`checkout`]({{ site.baseurl}}/2.0/configuration-reference/#checkout) command to pull our source code from our version control system.

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

## SSH into your build
{: #ssh-into-your-build }

It is possible to SSH into a Windows build container. This is useful for troubleshooting problems in your pipeline. Follow these steps to SSH into a Windows container:

### Steps
{: #steps }

1. Ensure that you have added an SSH key to your [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) or [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) account.

2. To start a job with SSH enabled, select the 'Rerun job with SSH' option from the 'Rerun Workflow' dropdown menu.

3. To see the connection details, expand the 'Enable SSH' section in the job output where you will see the SSH command needed to connect:
![SSH connection details]({{ site.baseurl }}/assets/img/docs/ssh-windows-obf.png)

Ensure that you are passing the name of the shell you want to run when you ssh
in. To run  `cmd.exe` in the build above you would run: `ssh -p <remote_ip> -- cmd.exe`

The available options are:

- powershell.exe
- bash.exe
- cmd.exe

You can read more about using SSH in your builds [here]({{site.baseurl}}/2.0/ssh-access-jobs).

## Next steps
{: #next-steps }

Also, consider reading documentation on some of CircleCI’s features:

* See the [Concepts]({{site.baseurl}}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a .circleci/config.yml file.
* Refer to the [Workflows]({{site.baseurl}}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.
* Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{site.baseurl}}/2.0/configuration-reference/) and [CircleCI Images]({{site.baseurl}}/2.0/circleci-images/) documentation, respectively.

## Software pre-installed on the Windows image
{: #software-pre-installed-on-the-windows-image }

To find information on what software is pre-installed on the Windows image, please visit the [Developer Hub](https://circleci.com/developer/machine/image/windows-server). The Windows image page on the Developer Hub lists links to the most recent updates.
