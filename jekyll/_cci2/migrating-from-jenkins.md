---
layout: classic-docs
title: Differences from Jenkins
categories: [migration]
description: Differences from Jenkins
---

This document provides the basic concepts that a longtime Jenkins user needs to know when migrating from Jenkins to CircleCI   in the following sections:

* TOC
{:toc}

## Quick Start
{:.no_toc}

CircleCI is a very different product from Jenkins with a lot of different concepts on how to manage CI and CD, but it won’t take long to migrate the basic functionality of your Jenkins build to CircleCI. To get started quickly, try one of these options:

1. **Getting Started:** Run your first green build on CircleCI 2.0 using the [getting started video and steps]({{ site.baseurl }}/2.0/).

2. **Copy-paste your commands from Execute Shell:** To simply duplicate your project exactly as it is in Jenkins, add a file called `config.yml` to a `.circleci/` directory of your project with the following content:

```yaml
    steps:
      - run: "Add any bash command you want here"
      - run:
          command: |
            echo "Arbitrary multi-line bash"
            echo "Copy-paste from 'Execute Shell' in Jenkins"
```

Some programs and utilities are [pre-installed on CircleCI Images]( {{ site.baseurl }}/2.0/circleci-images/#pre-installed-tools), but anything else required by your build must be installed a `run` `step`. Your project’s dependencies may be [cached]( {{ site.baseurl }}/2.0/caching/) for the next build using the `save_cache` and `restore_cache` `steps`, so that they only need to be fully downloaded and installed once.

**Manual configuration:** If you were using plugins or options other than Execute Shell in Jenkins to run your build steps, you may need to manually port your build from Jenkins. Use the [Configuring CircleCI]( {{ site.baseurl }}/2.0/configuration-reference/) document as a guide to the complete set of CircleCI configuration keys.

## Job Configuration

Jenkins projects are generally configured in the Jenkins web UI and their settings are stored on the filesystem of the Jenkins server. This makes it difficult to share configuration information within a team or organization. Cloning a GitHub or Bitbucket repository doesn’t copy the information stored in Jenkins. Settings stored on the Jenkins server also make regular backup of all Jenkins servers required.

Almost all configuration of CircleCI builds is stored in a file called `.circleci/config.yml` that goes in the root of each project. Treating CI configuration like any other source code makes it easier to back up and share. Just a few project settings, like secrets, that shouldn’t be stored in source code are stored (encrypted) in the CircleCI app.

### Access to Build Machines
{:.no_toc}

It’s often up to an Ops person or team to manage Jenkins servers. These people generally get involved with various CI maintenance tasks like installing dependencies and troubleshooting issues.

It’s never necessary to access a CircleCI environment to install dependencies because every build starts in a fresh environment where custom dependencies must be installed automatically (ensuring that the entire build process is truly automated). Troubleshooting in the build environment can be done easily and securely by any developer using CircleCI’s [SSH feature]( {{ site.baseurl }}/2.0/ssh-access-jobs/).

If you install CircleCI on your own hardware, the divide between the host OS (at the “metal”/VM level) and the containerized build environments can be extremely useful for security and ops (see Your Builds in Containers below). Ops team members can do what they need to on the host OS without affecting builds, and they never need to give developers access. Developers, on the other hand, can use CircleCI’s SSH feature to debug builds at the container level as much as they like without affecting ops.

## Web UI
{:.no_toc}

CircleCI is a single-page web app that makes the entire user experience fast and easy on the eyes. The CircleCI team also continually refreshes and improves it’s UI. CircleCI’s modern UI is very popular with users, so the team will keep investing in it as technology and user expectations change.

![](  {{ site.baseurl }}/assets/img/docs/circle-ui.png)

## Plugins

You’ve almost certainly worked with plugins if you’ve used Jenkins. These plugins are Java-based like Jenkins itself and a bit complicated. They interface with any of several hundred possible extension points in Jenkins and can generate web views using JSP-style tags and views. You also have to use plugins to do almost anything with Jenkins. Even checking out a Git repository requires a plugin.

All core CI functionality is built into CircleCI. Features such as checking out source from GitHub or Bitbucket, running builds and tests with your favorite tools, parsing test output, and storing artifacts are first-class and plugin-free. When you do need to add custom functionality to your builds and deployments, you can do so with a couple snippets of bash in appropriate places.

## Distributed Builds

It is possible to make a Jenkins server distribute your builds to a number of “agent” machines to execute the jobs, but this takes a fair amount of work to set up. According to Jenkins’ [docs on the subject](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds), “Jenkins is not a clustering middleware, and therefore it doesn't make this any easier.”

CircleCI distributes builds to a large fleet of builder machines by default. If you use SaaS-based circleci.com, then this just happens for you, your builds don’t queue unless you are using all the build capacity in your plan, and that’s that. If you use CircleCI installed in your own environment, then you will appreciate that CircleCI does manage your cluster of builder machines without the need for any extra tools.

## Containers and Docker

Talking about containerization in build systems can be complicated because arbitrary build and test commands can be run inside of containers as part of the implementation of the CI system, and some of these commands may themselves involve running containers. Both of these points are addressed below. Also note that Docker is an extremely popular tool for running containers, but it is not the only one. Both the terms “container” (general) and “Docker” (specific) will be used.


### Containers in Your Builds
{:.no_toc}


If you use a tool like Docker in your workflow, you will likely also want to run it on CI. Jenkins doesn’t provide any built-in support for this, and it is up to you to make sure it is installed and available within your build environment.

Docker has long been one of the tools that is pre-installed on CircleCI, so you can access Docker in your builds by adding `docker` as an executor in you `config.yml` file. See the [Choosing an Executor Type]( {{ site.baseurl }}/2.0/executor-types/) and [Docker]( {{ site.baseurl }}/2.0/build/#docker) documents for more info.

### Your Builds in Containers
{:.no_toc}


Jenkins normally runs your build in an ordinary directory on the build server, which can cause lots of issues with dependencies, files, and other state gathering on the server over time. There are plugins that offer alternatives, but they must be manually installed.


CircleCI runs all Linux and Android builds in dedicated containers, which are destroyed immediately after use (macOS builds run in single-use VMs). This creates a fresh environment for every build, preventing unwanted cruft from getting into builds. One-off environments also promote a disposable mindset that ensures all dependencies are documented in code and prevents “snowflake” build servers.


If you run builds on your own hardware with [CircleCI](https://circleci.com/enterprise/), running all builds in containers allows you to heavily utilize the hardware available to run builds.

## Parallelism

It is possible to run multiple tests in parallel on a Jenkins build using techniques like multithreading, but this can cause subtle issues related to shared resources like databases and filesystems.

CircleCI lets you increase the parallelism in any project’s settings so that each build for that project uses multiple containers at once. Tests are evenly split between containers allowing the total build to run in a fraction of the time it normally would. Unlike with simple multithreading, tests are strongly isolated from each other in their own environments. You can read more about parallelism on CircleCI in the [Running Tests in Parallel]( {{ site.baseurl }}/2.0/parallelism-faster-jobs/) document.
