---
layout: classic-docs
title: "Test"
description: "CircleCI 2.0 test automation setup"
---

Refer to the following video and documents for help with setting up your tests.

## How to Build, Test, and Deploy Video Tutorial

Watch the following video for a detailed tutorial of Docker, iOS, and Android builds.
<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/Qp-BA9e0TnA" frameborder="0" allowfullscreen></iframe>
</div>

## Running, Splitting, and Debugging Tests

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/configuration-reference/#run">Configuring CircleCI: `run` Step section</a> | Write a job to run your tests.
[Browser Testing]({{ site.baseurl }}/2.0/browser-testing/) | Common methods for running and debugging browser tests in CircleCI.
<a href="{{ site.baseurl }}/2.0/collect-test-data/">Collecting Test Metadata</a> | How to set up various common test runners in your CircleCI configuration.
<a href="{{ site.baseurl }}/2.0/testing-ios/">Testing iOS Applications on macOS</a> | How to set up and customize testing for an iOS application with CircleCI.
[Running Tests in Parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) | How to glob and split tests inside a job.
<a href="{{ site.baseurl }}/2.0/postgres-config/">Database Configuration Examples</a> | Example configuration files for PostgreSQL and MySQL. 
[Configuring Databases]({{ site.baseurl }}/2.0/databases/) | Overview of using service images and basic steps for configuring database tests in CircleCI 2.0.
**Code Signing** |
<a href="{{ site.baseurl }}/2.0/ios-codesigning/">Setting Up Code Signing for iOS Projects</a> | Describes the guidelines for setting up code signing for your iOS or Mac project on CircleCI 2.0.
{: class="table table-striped"}

## Deploy

Refer to the following document for information and examples of deployment targets and tools.

Document | Description
----|----------
<a href="{{ site.baseurl }}/2.0/deployment-integrations/">Deployment</a> | Configure automated deployment to AWS, Azure, Firebase, Google Cloud, Heroku, NPM, or virtually any other service.
<a href="{{ site.baseurl }}/2.0/artifactory/">Artifactory</a> | Configure automated uploads to Artifactory with the Jfrog CLI.
<a href="{{ site.baseurl }}/2.0/packagecloud/">packagecloud</a> | Publish packages to packagecloud.
{: class="table table-striped"}

We’re thrilled to have you here. Happy building!

_The CircleCI Team_
