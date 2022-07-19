---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI"
categories: [getting-started]
order: 4
redirect_from: /examples-intro/
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document describes how to get started with a basic build of your Linux, Android, Windows, or macOS project on CircleCI after you [sign up]({{ site.baseurl }}/first-steps/).

## Echo hello world on Linux
{: #echo-hello-world-on-linux }

This example adds a job called `build` that spins up a container running a [pre-built CircleCI Docker image for Node]({{ site.baseurl }}/circleci-images/#nodejs). Then, it runs a simple `echo` command. To get started, complete the following steps:

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository.

2. Create a [`config.yml`]({{ site.baseurl }}/configuration-reference/) file with the following lines (if you are using CircleCI server v2.x, use `version: 2.0` configuration):
   ```yaml
   version: 2.1
   jobs:
     build:
       docker:
         - image: cimg/node:17.2.0 # the primary container, where your job's commands are run
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       steps:
         - checkout # check out the code in the project directory
         - run: echo "hello world" # run the `echo` command
   ```

3. Commit and push the changes.

4. Go to the **Projects** page in the CircleCI app, then click
the **Set Up Project** button next to your project. If you do not see your project, make sure you have selected the associated org. See the [Org Switching](#org-switching) section below for tips.

5. Follow the steps to configure your `config.yml` file for the project and trigger your first pipeline.

The **Workflow** page appears with your `build` job and prints `Hello World` to the console.

**Tip:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

CircleCI runs each [job]({{site.baseurl}}/glossary/#job) in a separate [container]({{site.baseurl}}/glossary/#container) or virtual machine (VM). That is, each time your job runs, CircleCI spins up a container or VM to run the job in.

Sample project: [Node.js - JavaScript Tutorial]({{site.baseurl}}/language-javascript/)

## Hello world for Android
{: #hello-world-for-android }

Using the basic ideas from the Linux example above, you can add a job that uses the `docker` executor with a pre-built Android image in the same `config.yml` file as follows:

```yaml
jobs:
  build-android:
    docker:
      - image: cimg/android:2021.10.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

See the [Android Language Guide]({{site.baseurl}}/language-android/) for details and a sample project.

## Hello world for macOS
{: #hello-world-for-macos }

The macOS executor is not currently available on installations of CircleCI server v2.x.
{: class="alert alert-info" }

Using the basics from the Linux example above, you can add a job that uses the `macos` executor and a supported version of Xcode as follows:

```yaml
jobs:
  build-macos:
    macos:
      xcode: 12.5.1
```

Refer to the [Hello World on MacOS]({{site.baseurl}}/hello-world-macos) document for more information and a sample project.

## Hello world for Windows
{: #hello-world-for-windows }

Using the basics from the Linux example above, you can add a job that uses the Windows executor as follows. Notice the cloud version of this requires the use of `version: 2.1` config as well as orbs:

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@4.1.1 # The Windows orb give you everything you need to start using the Windows executor.

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
      image: windows-default # Windows machine image
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
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

For Windows builds, some setup and prerequisites are different. Please refer to our [Hello World on Windows]({{site.baseurl}}/hello-world-windows) page for more information.
{: class="alert alert-info" }

### More about using and authoring orbs
{: #more-about-using-and-authoring-orbs }

Orbs are a great way to simplify your config or re-use config across your projects, by referencing packages of config in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

## Following / unfollowing projects
{: #following-unfollowing-projects }

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your organization in the CircleCI application (as detailed below), clicking **Projects** in the sidebar, and then clicking the button next to the project you want to follow or stop following.

## Org switching
{: #org-switching }

In the top left, you will find the Org switcher.


{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_3}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_2}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available. If you want to add the GitHub project `your-org/project`, you must select `your-org` from the org switcher.

## Next steps
{: #next-steps }

- See the [Concepts]({{ site.baseurl }}/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.

- Refer to the [Workflows]({{ site.baseurl }}/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/circleci-images/) documentation, respectively.
