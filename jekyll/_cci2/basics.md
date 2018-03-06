---
layout: classic-docs
title: "Basics"
description: "Basics"
---
![header]( {{ site.baseurl }}/assets/img/docs/new_header.png)

Get started by learning about the basic concepts used in CircleCI.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/about-circleci/">Overview</a> | Overview of Continuous Integration (CI) with links to CircleCI case studies.
[Using Containers]({{ site.baseurl }}/2.0/containers/) | An overview of containers and how to use them to increase build speed and prevent queuing.
<a href="{{ site.baseurl }}/2.0/jobs-steps/">Jobs and Steps</a> | How Jobs and Steps are used in a CircleCI 2.0 configuration.
<a href="{{ site.baseurl }}/2.0/workflows/">Workflows</a> | How to configure Workflows to increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.
<a href="{{ site.baseurl }}/2.0/faq/">FAQ</a> | Frequently asked questions about CircleCI 2.0.
{: class="table table-striped"}

## Migration

Migrate an existing 1.0 project to CircleCI 2.0.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/migrating-from-1-2/">Migrating from 1.0 to 2.0</a> | Migrating a 1.0 Linux project to a CircleCI 2.0 configuration.
<a href="{{ site.baseurl }}/2.0/ios-migrating-from-1-2/">iOS Migration</a> | Migrating a 1.0 iOS project to a CircleCI 2.0 configuration.
<a href="{{ site.baseurl }}/2.0/config-translation/">Using the 1.0 to 2.0 config-translation Endpoint</a> |  Instructions for using the `config-translation` endpoint to generate an initial CircleCI 2.0 configuration from your existing CircleCI 1.0 project for a limited set of languages: Ruby, PHP, Node.js, iOS (partial: 1.0 code signing is not supported - use Fastlane instead), Java (partial).
{: class="table table-striped"}

## Features

Learn to use the basic features of CircleCI.

Document | Description
----|----------
[Skipping a Build]({{ site.baseurl }}/2.0/skip-build/) | How to prevent CircleCI from automatically building changes.
[Using Environment Variables]({{ site.baseurl }}/2.0/env-vars/) | How to use environment variables in the CircleCI app and in the `config.yml` file.
[Using Contexts]({{ site.baseurl }}/2.0/contexts/) | How to use Contexts to set global environment variables.
[Using Insights]({{ site.baseurl }}/2.0/insights/) | How to view status for your repos and build performance data.
[Enabling Notifications]({{ site.baseurl }}/2.0/notifications/) | How to set or modify Slack, chat, and email notifications in the CircleCI app.
[Embedding Build Status Badges]({{ site.baseurl }}/2.0/status-badges/) | How to display the status of your builds on a web page or document.
[Storing Artifacts]({{ site.baseurl }}/2.0/artifacts/) | How to store build artifacts in the `config.yml` syntax and finding links to them in the CircleCI app.
[Using the API to Trigger Jobs]({{ site.baseurl }}/2.0/api-job-trigger/) | How to trigger Jobs with the API.
[Debugging with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs/) | How to use SSH to debug build problems.
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
