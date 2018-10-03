---
layout: enterprise
section: enterprise
title: "Setting Up Projects"
category: [documentation]
order: 1
description: "Overview of getting started with CircleCI Enterprise."
sitemap: false
---

This guide describes how to set up a project and provides a primer on configuration troubleshooting in CircleCI Enterprise for developers, as follows:

* TOC
{:toc}

## Prerequisites

To add a project, you must have a GitHub or GitHub Enterprise account.

## Adding a Project

Complete the following steps to set up a project on CircleCI Enterprise.

1. Navigate to the IP address in your browser for the CircleCI application as installed by your administrator. The Welcome page appears with a Get Started button. 
2. Click the Get Started button on the Welcome to CircleCI page. If you are not already logged into GitHub, the Sign in to GitHub to continue to Local CCIE Enterprise page appears. 
3. Enter your GitHub login credentials and click the Sign in button followed by your Two-factor authentication if appropriate. The CircleCI application appears with a Getting Started section. ![CircleCI Enterprise Get Started]({{ site.baseurl }}/assets/img/docs/ccie_follow_build.png)
4. Select or deselect projects from the list and click the Follow and Build button to start building your projects. The Builds page appears with your first project in the Running state. ![CircleCI Enterprise Running Build]({{ site.baseurl }}/assets/img/docs/ccie_builds_running.png)
5. To view the real-time build console and details, click the link to your build from the Builds page. The details page for your build appears. The Build Timing tab is shown in the following screenshot. Notice the red section of the timeline indicates where it failed. ![CircleCI Enterprise Build Timing]({{ site.baseurl }}/assets/img/docs/ccie_build_timing.png)
6. Click the red section or scroll down to see the console error for the failure. ![CircleCI Enterprise Build Fail]({{ site.baseurl }}/assets/img/docs/ccie_build_failure.png)

Now that your project is set up, every time you commit to your repo, CircleCI will run a new build. **Note:** It is possible to skip a build by including the keyword `[ci skip]` in your commit description to skip the build, see the [Skip a Build  documentation]({{site.baseurl}}/1.0/skip-a-build/).

## Troubleshooting and Customizing Configuration
If the build steps are not appropriate for your project, it is possible to add a `circle.yml` configuration file as described below. Add more projects at any time by clicking the Projects icon on the left sidebar in the CircleCI Enterprise app.
Following is a video walkthrough of the process to add a `circle.yml` file to your project:

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/LwEdbdSqcZI" frameborder="0" allowfullscreen></iframe>
</div>

### Overriding or Adding Commands

Use a <code>circle.yml</code> file to override or add to the commands that CircleCI infers for your project.
You can find extensive documentation about the structure of this file and available
options in the <a href="https://circleci.com/docs/1.0/configuration/">Configuring CircleCI 1.0 document</a>. 

Unlike conventional CI servers that store the project configuration
on the CI server itself, CircleCI stores the configuration as code in the <code>circle.yml</code>
file. Storing
configuration in code is a great way of both tracking configuration versions and keeping
everything durably backed up independently of the CI server itself. CircleCI does not require a `circle.yml` file to build your project. If a `circle.yml` file is not found,
CircleCI will infer steps to run based on the structure of your project. 

If you are migrating to CircleCI from Jenkins, you may also find the
<a href="https://circleci.com/docs/1.0/migrating-from-jenkins/">Migrating from Jenkins to CircleCI</a> helpful.  Here's another video that
covers the basics of adding a `circle.yml` file to your project repository

<div class="video-wrapper">
<iframe width="560" height="315" src="https://www.youtube.com/embed/X6TOyHL_RXs" frameborder="0" allowfullscreen></iframe>
</div>


### Debugging

CircleCI enables any developer to SSH into builds for their projects to debug problems.
Find instructions in the [SSH build documentation]({{site.baseurl}}/1.0/ssh-build/).
**Note:** In CircleCI Enterprise, SSH access to builds may require connecting to a VPN, using a bastion
host, or following other special instructions specific to your installation. Consult your CircleCI
administrator if you are unable to access builds using SSH.

### Using Parallelism

In addition to the conventional tools available for running tests in parallel using
multiple threads or processes, CircleCI allows you to run multiple containers with each build. These
containers are strongly isolated from each other using Linux Containers (LXC) which are very similar to Docker containers. Strong isolation eliminate many
common errors that occur in other parallel test runners, for example, unintentional sharing of files and databases.

Many common test runners like `nose` and `RSpec` run automatically and in parallel according to the test commands that  CircleCI infers from your project. In these cases, test runtime data can also be collected to ensure that tests are split up
optimally. You can read about how to ensure tests are auto-balanced in the [Collecting Test Metadata document for CircleCI 1.0]({{site.baseurl}}/1.0/test-metadata/).

### Installing Custom Packages

CircleCI enables you to use `sudo`, `apt-get`, and more. Unlike other CI servers that require you to work with an administrator
to install any custom packages, CircleCI Enterprise allows you to install dependencies 
by using your `circle.yml` file. Find some examples of installing custom software in the CircleCI 1.0 
[Customizing Build Environments document]({{site.baseurl}}/1.0/installing-custom-software/).
