---
layout: classic-docs
title: Migrating from Jenkins to CircleCI
categories: [migration]
description: Migrating from Jenkins to CircleCI
sitemap: false
---

Jenkins is a very popular open-source CI tool, so many users that are new to CircleCI have used it at some point. This document provides the basics that a longtime Jenkins user needs to know when making the switch.

## Quick Start

CircleCI is a very different product from Jenkins with a lot of different concepts on how to manage CI and CD (see [High-Level Differences]( {{ site.baseurl }}/1.0/migrating-from-jenkins/#high-level-differences) below), but it won’t take long to migrate the basic functionality of your Jenkins build to CircleCI. If you just want to jump in and get started, try one of these three options:


1. **Inference:** [Follow your project on CircleCI]({{ site.baseurl }}/1.0/getting-started/) and run a build without any custom configuration. CircleCI infers what build and test steps need to be run based on your project’s structure, so everything may work just fine automatically. If the inferred steps mostly work, then you can just add a couple [tweaks]( {{ site.baseurl }}/1.0/configuration/).

2. **Copy-paste your commands from “Execute Shell”:** If you really want to simply duplicate your project exactly as it is in Jenkins, then you can add a file called `circle.yml` to the root of your project with the following content:
    <pre>
    dependencies:
      override:
        - echo "Add any bash commands you want here"
        - echo "Perform any dependency steps required by your build"
    test:
      override:
        - echo "More arbitrary bash"
        - echo "Probably copy-pasted from 'Execute Shell' on Jenkins"
    </pre>

    Some programs and utilities are [pre-installed on CircleCI]( {{ site.baseurl }}/1.0/environment/), but anything else required by your build must be installed in the `dependencies` section. Your project’s dependencies will be [cached]( {{ site.baseurl }}/1.0/how-cache-works/) for the next build, so that they only need to be fully downloaded and installed once.

3. **Manual configuration:** If CircleCI’s inference doesn’t work for your project, or if you were using other plugins or options than “Execute Shell” in Jenkins to run your build steps, then you may need to manually port your build from Jenkins. This is usually pretty simple as documented [here]( {{ site.baseurl }}/1.0/manually/).



## High-Level Differences

In addition to differences in the basics of running builds on Jenkins and CircleCI, there are many conceptual differences between how each system manages CI and CD functionality.

### Build configuration

Jenkins projects are generally configured in the Jenkins web UI and their settings are stored on the filesystem of the Jenkins server. This makes it difficult to share configuration information within a team or organization. Cloning a GitHub or Bitbucket repository doesn’t copy the information stored in Jenkins. Settings living on the Jenkins server also make regular backup of all Jenkins servers extra important.

Almost all configuration of CircleCI builds is stored in a file called `circle.yml` that goes in the root of each project. Treating CI configuration like any other source code makes it easier to back up and share. Just a few project settings, like secrets, that shouldn’t go in source are stored (encrypted) on CircleCI.

### Access to build machines

It’s often up to an ops person or team to manage Jenkins servers. These people generally get involved with various CI maintenance tasks like installing dependencies and troubleshooting issues.

It’s never necessary to access a CircleCI environment to install dependencies because every build starts in a fresh environment where custom dependencies must be installed automatically (ensuring that the entire build process is truly automated). Troubleshooting in the build environment can be done easily and securely by any developer using CircleCI’s [SSH feature]( {{ site.baseurl }}/1.0/ssh-build/).

If you install CircleCI Enterprise on your own hardware, the divide between the host OS (at the “metal”/VM level) and the containerized build environments can be extremely useful for security and ops (see Your builds in containers below). Ops team members can do what they need to on the host OS without affecting builds, and they never need to give developers access. Developers, on the other hand, can use CircleCI’s SSH feature to debug builds at the container level as much as they like without affecting ops.

### Web UI

Jenkins is extremely widespread because it has been around since nearly the beginning of CI. This means that its UI was originally developed in a very different landscape of web technology, and it is still fairly dated. Each page load generally needs to be rendered completely by the server, making the navigation experience a bit sluggish. The UI can also be impacted by any number of installed plugins.

![](  {{ site.baseurl }}/assets/img/docs/jenkins-ui.png)

CircleCI is a single-page web app that makes heavy use of AJAX, HTML5, and other newer technologies to make the entire user experience fast and easy on the eyes. The CircleCI team also continually refreshes and improves it’s UI. It was technically overhauled in mid-2014 to run on ClojureScript and React and visually revamped in late 2015. CircleCI’s modern UI is very popular with users, so the team will keep investing in it as technology and user expectations change.

![](  {{ site.baseurl }}/assets/img/docs/circle-ui.png)

### Plugins

You’ve almost certainly worked with plugins if you’ve used Jenkins. These plugins are Java-based like Jenkins itself and a bit complicated. They interface with any of several hundred possible extension points in Jenkins and can generate web views using JSP-style tags and views. You also have to use plugins to do almost anything with Jenkins. Even checking out a Git repository requires a plugin.

All core CI functionality is built into CircleCI. Features such as checking out source from GitHub or Bitbucket, running builds and tests with your favorite tools, parsing test output, and storing artifacts are first-class and plugin-free. When you do need to add custom functionality to your builds and deployments, you can do so with a couple snippets of bash in appropriate places.

### Distributed builds

It is possible to make a Jenkins server distribute your builds to a number of “slave” machines to execute the jobs, but this takes a fair amount of work to set up. According to Jenkins’ [docs on the subject](https://wiki.jenkins-ci.org/display/JENKINS/Distributed+builds), “Jenkins is not a clustering middleware, and therefore it doesn't make this any easier.”

CircleCI distributes builds to a large fleet of builder machines by default. If you use SaaS-based circleci.com, then this just happens for you, your builds don’t queue unless you are using all the build capacity in your plan, and that’s that. If you use CircleCI Enterprise installed in your own environment, then you will appreciate that CircleCI Enterprise does manage your cluster of builder machines without the need for any extra tools.

### Containers and Docker

Talking about containerization in build systems can be complicated because arbitrary build and test commands can be run inside of containers as part of the implementation of the CI system, and some of these commands may themselves involve running containers. Both of these points are addressed below. Also note that Docker is an extremely popular tool for running containers, but it is not the only one (for example CircleCI currently runs all Linux-based builds using plain LXC containers). Both the terms “container” (general) and “Docker” (specific) will be used.


#### Containers in your builds:


  If you use a tool like Docker in your workflow, you will likely also want to run it on CI. Jenkins doesn’t provide any built-in support for this, and it is up to you to make sure it is installed and available within your build environment.

  Docker has long been one of the tools that is pre-installed on CircleCI, so you can access Docker in your builds by adding “docker” to the “services” section of your `circle.yml` file. See our in-depth [Docker doc]( {{ site.baseurl }}/1.0/docker/) for more info.

#### Your builds in containers:


  Jenkins normally runs your build in an ordinary directory on the build server, which can cause lots of issues with dependencies, files, and other state gathering on the server over time. There are plugins that offer alternatives, but they must be manually installed.


  CircleCI runs all Linux builds in dedicated containers, which are destroyed immediately after use (macOS builds run in single-use VMs). This creates a fresh environment for every build, preventing unwanted cruft from getting into builds. One-off environments also promote a disposable mindset that ensures all dependencies are documented in code and prevents “snowflake” build servers.


  If you run builds on your own hardware with [CircleCI Enterprise](https://circleci.com/enterprise/), running all builds in containers allows you to heavily utilize the hardware available to run builds.

### Parallelism

It is possible to run multiple tests in parallel on a Jenkins build using techniques like multithreading, but this can cause subtle issues related to shared resources like databases and filesystems.

CircleCI lets you increase the parallelism in any project’s settings so that each build for that project uses multiple containers at once. Tests are evenly split between containers allowing the total build to run in a fraction of the time it normally would. Unlike with simple multithreading, tests are strongly isolated from each other in their own environments. You can read more about parallelism on CircleCI [here]( {{ site.baseurl }}/1.0/setting-up-parallelism/).
