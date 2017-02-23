---
layout: enterprise
section: enterprise
title: "User Quick Start"
category: [documentation]
order: 1
description: "A light overview on how to get started with CircleCI Enterprise."
---

This guide is for developers using existing installations of CircleCI Enterprise.
Instructions for installing and setting up Enterprise can be found [here]({{site.baseurl}}/enterprise/overview/).
For developers testing and deploying their code with CircleCI Enterprise, the
experience extremely similar to using circleci.com, so much of the information in the
[docs](https://circleci.com/docs/) and [support forum](https://discuss.circleci.com)
for circleci.com are applicable. There are a few potentially
confusing differences between CircleCI Enterpise and circleci.com though, so this guide
provides a starting point specifically for users of Enterprise.

Let's quickly cover a few of the first things you might want to try on CircleCI Enterprise. If you
are curious about the differences between your CircleCI Enterprise installation and public circleci.com,
you can skip to the [differences from circleci.com]({{site.baseurl}}/enterprise/differences/).

<ul><li><b>Add your first project:</b> Setting projects up to build on CircleCI Enterprise is really easy.
Just:
<ol>
    <li>Sign up for an account on your CircleCI Enterprise instance (make sure you have a GitHub Enterprise account first)</li>
    <li>Select the GitHub user or organization of the project you want to build</li>
    <li>Find your project in the list of projects and click "Build project" (or "Watch project" if it is already being built on CircleCI)</li>
</ol>
<p>That's it! If the inferred steps don't do quite what you want, try adding a `circle.yml` file as described below. You
can add more projects at any time by clicking the "Add Projects" link on the left sidebar from the CircleCI Enterprise app.
You can also check out a video walkthrough here:</p>
<iframe width="560" height="315" src="https://www.youtube.com/embed/LwEdbdSqcZI" frameborder="0" allowfullscreen></iframe>
<br>
</li></ul>

<ul><li><p><b><code>circle.yml</code> file:</b> Unlike conventional CI servers that store all the project configuration
on the CI server itself, CircleCI stores the configuration as code in the <code>circle.yml</code>
file. CircleCI doesn't require a <code>circle.yml</code> file to build your project. If no config file is found,
only CircleCI's inferred steps will run based on the structure of your project. However you can use
a <code>circle.yml</code> file to override or add to the inferred commands.
You can find extensive documentation about the structure of this file and available
options in the <a href="https://circleci.com/docs/configuration">circleci.com configuration documentation</a>.
If you are coming to CircleCI from Jenkins, you may also find the
<a href="https://circleci.com/docs/migrating-from-jenkins">Jenkins migration guide</a> helpful. Storing
configuration in code is a great way of both tracking configuration versions and keeping
everything durably backed up independently of the CI server itself. Here's another video that
covers the basics of adding a <code>circle.yml</code> file:</p>
<iframe width="560" height="315" src="https://www.youtube.com/embed/X6TOyHL_RXs" frameborder="0" allowfullscreen></iframe>
<br>
</li></ul>


- **SSH debugging:** CircleCI makes it easy for any developer to SSH into builds for their projects.
You can find instructions for this in the [SSH build documentation]({{site.baseurl}}/1.0/ssh-build/).
Note that in CircleCI Enterprise, SSH access to builds may require connecting to a VPN, using a bastion
host, or following other special instructions specific to your installation. Consult your CircleCI
administrator if you are unable to access builds via SSH.

- **Parallelism:** In addition to the conventional tools available for running tests in parallel using
multiple threads or processes, CircleCI allows you to run multiple containers with each build. These
containers are strongly isolated from each other using LXC (very similar to Docker), eliminating many
common errors that occur in other parallel test runners like unintentional sharing of files and databases.
Many common test runners like nose and RSpec can be automatically run in parallel with CircleCI's inferred
test commands. In these cases, test run time data can also be collected to ensure that tests are split up
optimally. You can read about how to ensure tests are auto-balanced [here]({{site.baseurl}}/1.0/test-metadata/).

- **`sudo`, `apt-get`, and more:** Unlike other CI servers that require you to work with an administrator
to install any custom packages, CircleCI Enterprise let's you install almost anything you need
right from your `circle.yml` file. You can find some examples of installing custom software this way
[here]({{site.baseurl}}/1.0/installing-custom-software/).
