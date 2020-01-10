---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories: [getting-started]
order: 4
---

This document describes how to get started with a basic build of your Linux, Android, Windows, or macOS project on CircleCI 2.x after you [sign up]({{ site.baseurl }}/2.0/first-steps/).  

## Echo Hello World on Linux 

This example adds a job called `build` that spins up a container running a [pre-built CircleCI Docker image for Node]({{ site.baseurl }}/2.0/circleci-images/#nodejs). Then, it runs a simple `echo` command. To get started, complete the following steps:

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository. 

1. Create a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file with the following lines: 

   ```yaml
   version: 2.1
   jobs:
     build:
       docker: 
         - image: circleci/node:4.8.2 # the primary container, where your job's commands are run
       steps:
         - checkout # check out the code in the project directory
         - run: echo "hello world" # run the `echo` command
   ```

1. Commit and push the changes. 

1. Go to the Projects page in the CircleCI app, click the **Add Projects** button, then click
the **Set Up Project** button next to your project. If you don't see your project, make sure you have selected the associated Org. See the Org Switching section below for tips.

3. Click the **Start Building** button to trigger your first build. 

The Workflows page appears with your `build` job and prints `Hello World` to the console. 

**Note:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or VM. That is, each time your job runs, CircleCI spins up a container or VM to run the job in.

Refer to the [Node.js - JavaScript Tutorial]({{site.baseurl}}/2.0/language-javascript/) for a sample project.

## Hello World for Android

Using the basic ideas from the Linux example above, you can add a job that uses the `docker` executor with a pre-built Android image in the same `config.yml` file as follows:

```
jobs:
  build-android:
    docker:
      - image: circleci/android:api-25-alpha
```

See the [Android Language Guide]({{site.baseurl}}/2.0/language-android/) for details and a sample project.

## Hello World for macOS

Using the basics from the Linux and Android examples above, you can add a job that uses the `macos` executor and a supported version of Xcode as follows:

```
jobs: 
  build-macos: 
    macos:  
      xcode: "10.0.0" 
```      

Refer to the [Hello World on MacOS]({{site.baseurl}}/2.0/hello-world-macos) document for more information and a sample project.

## Hello World for Windows

Using the basics from the Linux, Android, and macOS examples above, you can add a job that uses the `win/vs2019` executor (Windows Server 2019) by adding the `orb:` key in the same `.circleci/config.yml` file as follows:

```
orbs:
  win: circleci/windows@1.0.0

jobs:
  build-windows:
    executor: win/vs2019
    steps:
      - checkout
      - run: Write-Host 'Hello, Windows'
```

**Note**: For Windows builds, some setup and prerequisites are different. Please refer to our [Hello World on Windows]({{site.baseurl}}/2.0/hello-world-windows). 

### More About Using and Authoring Orbs

Orbs are a great way to simplify your config or re-use config across your projects, by referencing packages of config in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry).

## Following Projects

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your org on the Projects page in the CircleCI app, clicking the Add Projects button, and then clicking the button next to the project you want to follow or stop following.

## Org Switching

In the top left, you will find the Org switcher.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

## Next Steps

- See the [Concepts]({{ site.baseurl }}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.
