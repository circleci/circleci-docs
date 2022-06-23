---
layout: classic-docs
title: "About CircleCI"
description: "This document is a summary of continuous integration and how CircleCI enables engineering teams with automation. CircleCI automates your software builds, tests, and deployments."
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

Software teams want to move faster, but often lack the confidence to accelerate quickly. Our mission is to manage change so software teams can innovate faster. We want to empower technology-driven organizations to do their best work -- and make engineering teams more productive and innovative by managing change. Build, test, and deploy by using intelligent automation.

We work where you work: Linux, macOS, Android, and Windows - in the cloud or on your servers. CircleCI provides enterprise-class support and services, with the flexibility of a startup.

## What is continuous integration?
{: #what-is-continuous-integration }

**Continuous integration** is a practice that encourages developers to integrate their code into a `main` branch of a shared repository early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by each developer multiple times throughout the day.

Continuous integration is a key step to digital transformation.

Every developer commits daily to a shared mainline. Every commit triggers automated tests and builds. If these fail, they can be repaired quickly - within minutes.

**Why?** Continuous integration improves team productivity, efficiency, confidence, and happiness. Find problems and solve them quickly. Release higher quality, more stable products.

![CircleCI about image]( {{ site.baseurl }}/assets/img/docs/arch.png)

## CircleCI in your workflow
{: #circleci-in-your-workflow}

A software repository on a supported version control system needs to be authorized and added as a project on [circleci.com](https://circleci.com). Every code change then triggers automated tests in a clean container or virtual machine. CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or [virtual machine](https://circleci.com/developer/images?imageType=machine).

CircleCI then sends an email notification of success or failure after the tests complete. CircleCI also includes integrated [Slack and IRC notifications]({{site.baseurl}}/2.0/notifications). Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including:
- AWS CodeDeploy
- AWS EC2 Container Service (ECS)
- AWS S3, Google Kubernetes Engine (GKE)
- Microsoft Azure
- Heroku

The [orbs registry](https://circleci.com/developer/orbs) contains packages of reusable configuration that can be used for common deployment targets. Orbs simplify and streamline your configuration.

Other cloud service deployments can be scripted using SSH, or by installing the API client of the service with your job configuration.

## Benefits of CircleCI
{: #benefits-of-circleci }

CircleCI runs nearly one million jobs per day in support of 30,000 organizations. Organizations choose CircleCI because jobs run fast and builds can be optimized for speed.

CircleCI can be configured to run very complex pipelines efficiently with sophisticated [caching,]({{site.baseurl}}/2.0/caching/) [docker layer caching,]({{site.baseurl}}/2.0/docker-layer-caching/) and [resource classes]({{site.baseurl}}/2.0/optimizations/#resource-class) for running on faster machines.

As a developer using CircleCI you can:
- [SSH into any job]({{site.baseurl}}/2.0/ssh-access-jobs/) to debug your build issues.
- Set up [parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs/) in your [.circleci/config.yml]({{site.baseurl}}/2.0/configuration-reference/) file to run jobs faster.
- Configure [caching]({{site.baseurl}}/2.0/caching/) with two simple keys to reuse data from previous jobs in your [workflow]({{site.baseurl}}/2.0/workflows/).
- Configure self-hosted [runners]({{site.baseurl}}/2.0/runner-overview/) for unique platform support.
- Access [Arm resources]({{site.baseurl}}/2.0/arm-resources/) for the machine executor.
- Use [orbs]({{site.baseurl}}/2.0/orb-intro/), reusable packages of configuration, to integrate with third parties.
- Use pre-built Docker [images]({{site.baseurl}}/2.0/circleci-images/) in a variety of languages.
- Use the [API](https://circleci.com/docs/api/v2/) to retrieve information about jobs and workflows.
- Use the [CLI]({{site.baseurl}}/2.0/local-cli/) to access advanced tools locally.
- Get flaky test detection with [test insights]({{site.baseurl}}/2.0/insights-tests/).

As an operator or administrator of CircleCI installed on your own servers, CircleCI provides monitoring and insights into your builds and uses [Nomad](https://www.nomadproject.io/) for scheduling.

See the [CircleCI Operations and Installation Guides]({{site.baseurl}}/2.0/server-3-overview/) for complete server documentation.

## Pricing options
{: #pricing-options }

Visit CircleCI's [Pricing page](https://circleci.com/pricing/) to view free and paid options.

You can [sign up](https://circleci.com/signup/) for free to get access to unlimited projects on CircleCI's fully-hosted cloud platform.

Organizations on the free plan are given free credits to use on open source projects. Visit [Building Open Source Projects]({{site.baseurl}}/2.0/oss/) for more information about free containers for public open source projects.

## Learn More
{: #learn-more }

### In the Docs:
{: #in-the-docs }
{:.no_toc}
- [Concepts]({{site.baseurl}}/2.0/concepts/) for basic concepts of CI/CD pipeline management
- [Examples and Guides Overview]({{site.baseurl}}/2.0/examples-and-guides-overview/) for platform-specific setup guides

### On CircleCI Academy:
{: #on-circleci-academy }
{:.no_toc}
- [CI/CD 101 Workshop](https://academy.circleci.com/cicd-basics?access_code=public-2021)
- [General Developer Training](https://academy.circleci.com/general-developer-training?access_code=public-2021)

### On our blog:
{: #on-our-blog }
{:.no_toc}
- [Config best practices: dependency caching](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [Automate and scale your CI/CD with CircleCI orbs](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [How to secure your CI pipeline](https://circleci.com/blog/secure-ci-pipeline/)
