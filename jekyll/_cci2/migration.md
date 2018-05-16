---
layout: classic-docs
title: "Migration"
description: "Migration"
---

Migrate an existing 1.0 project to CircleCI 2.0.

Document | Description
----|----------
[Getting Started]({{ site.baseurl }}/2.0/) | CircleCI 2.0 is very different from 1.0, use the Getting Started doc to get a green 2.0 run with your desired executor (docker, macos, or machine) first and a single job named `build`. Then, add jobs for discreet parts of your run, orchestrate them with a workflow, and share data between jobs with workspaces.
[Hello World]({{ site.baseurl }}/2.0/hello-world) | If you already have a repo and some experience with 1.0, use the Hello World document for a quick start to 2.0 jobs with the `docker` executor and pre-built CircleCI container images.
[Migrating from 1.0 to 2.0]({{ site.baseurl }}/2.0/migrating-from-1-2/) | Migrating a 1.0 Linux project to a CircleCI 2.0 configuration if you prefer to replace existing 1.0 keys with their 2.0 equivalents to get started and migrate your configuration in smaller chunks.
[iOS Migration]({{ site.baseurl }}/2.0/ios-migrating-from-1-2/) | Migrating a 1.0 iOS project to a CircleCI 2.0 configuration.
[Using the 1.0-to-2.0 config-translation Endpoint]({{ site.baseurl }}/2.0/config-translation/) | Instructions for using the `config-translation` endpoint to generate an initial CircleCI 2.0 configuration from your existing CircleCI 1.0 project for a limited set of languages: Ruby, PHP, Node.js, iOS (partial: 1.0 code signing is not supported - use Fastlane instead), Java (partial).
[CircleCI Configuration Generator](https://github.com/CircleCI-Public/circleci-config-generator) | Use this script to extend the 1.0-to-2.0 config-translation endpoint by creating a 2.0 test branch for your project. Then, it will generate a  `config.yml` file on that branch and push a commit and run on CircleCI 2.0.
[Find projects building on CircleCI 1.0](https://github.com/CircleCI-Public/find-circle-yml) | Use this command-line tool to find which repositories in your GitHub organization or Bitbucket team have 1.0 `circle.yml` configuration files.
{: class="table table-striped"}

## Concepts 

Conceptually, 2.0 is very different, read the following documents to get answers to common 2.0 questions and to begin to let go of the 1.0 mindset.

Document | Description
---------|----------
[Concepts]({{ site.baseurl }}/2.0/concepts/) | A high-level overview of CircleCI 2.0 Steps, Image, Jobs, and Workflows concepts and the configuration hierarchy.
[Workflows]({{ site.baseurl }}/2.0/workflows/) | How to configure Workflows to increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.
[FAQ]({{ site.baseurl }}/2.0/faq/) | Frequently asked questions about CircleCI 2.0.
{: class="table table-striped"}
