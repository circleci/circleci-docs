---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories: [getting-started]
order: 4
---

This document describes how to get started with a basic build of your Linux, Android, or macOS project on CircleCI 2.x after you [sign up]({{ site.baseurl }}/2.0/first-steps/).  

## Use the Hello-Build Orb

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository. 

2. Add a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file in the `.circleci` directory with the following lines that import the [`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build).

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.7 # uses the circleci/buildpack-deps Docker image

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

Commit and push the changes to trigger a build. If this is your first project on
CircleCI, go to the Projects page, click the **Add Projects** button, then click
the **Set Up Project** button next to your project. You may also click **Start
Building** to manually trigger your first build.

## Echo Hello World with a `build` Job

Add a job called `build` that uses the Docker executor to spin up a Node container and runs a simple `echo` command:

1. Add following lines to your `.circleci/config.yml` file. For Docker executors, replace `node:4.8.2` with any [Docker image]({{ site.baseurl }}/2.0/circleci-images/) you want: 

```yaml
version: 2
jobs:
  build:
    docker: # use the docker executor type; machine and macos executors are also supported
      - image: circleci/node:4.8.2 # the primary container, where your job's commands are run
    steps:
      - checkout # check out the code in the project directory
      - run: echo "hello world" # run the `echo` command
```

CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or VM. That is, each time your job runs, CircleCI spins up a container or VM to run the job in.

**Note**: For `macos` executors, some setup is different. If you want to setup for an iOS project, please check out the [Hello World macOS]({{site.baseurl}}/2.0/hello-world-macos/) document and the [iOS tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) for examples of a simple `macos` config files. 

Commit and push the changes to trigger a build. If this is your first project on
CircleCI, go to the Projects page, click the **Add Projects** button, then click
the **Set Up Project** button next to your project. You may also click **Start
Building** to manually trigger your first build.

CircleCI checks out your code, prints "Hello World", and posts a green build to the Job page, adding a green checkmark on your commit in GitHub or Bitbucket.

**Note:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

## Following Projects

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your org on the Projects page in the CircleCI app, clicking the Add Projects button, and then clicking the button next to the project you want to follow or stop following.

## Org Switching

In the top left, you will find the Org switcher.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

## Next Steps

- See the [Concepts]({{ site.baseurl }}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with parallel, sequential, scheduled, and manual approval workflows.

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.
