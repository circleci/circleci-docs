---
layout: classic-docs
title: "About CircleCI"
description: "Starting point for CircleCI docs"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

Our mission is to empower technology-driven organizations to do their best work. We want to make engineering teams more productive with software builds, tests, and deployments through intelligent automation.

We work where you work: Linux, macOS, Android, and Windows - on the cloud or on your server. CircleCI provides enterprise-class support and services, with the flexibility of a startup.

## What is continuous integration?
{: #what-is-continuous-integration }

**Continuous integration** is a practice that encourages developers to integrate their code into a `main` branch of a shared repository early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by each developer multiple times throughout the day.

Continuous integration is a key step to digital transformation.
 
Every developer commits daily to a shared mainline. Every commit triggers an automated build and test. If build and test fails, it is repaired quickly - within minutes.

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

Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

## Benefits of CircleCI
{: #benefits-of-circleci }

CircleCI runs nearly one million jobs per day in support of 30,000 organizations. Organizations choose CircleCI because jobs run fast and builds can be optimized for speed.

CircleCI can be configured to run very complex pipelines efficiently with sophisticated [caching,]({{site.baseurl}}/2.0/caching/) [docker layer caching,]({{site.baseurl}}/2.0/docker-layer-caching/) and [resource classes]({{site.baseurl}}/2.0/optimizations/#resource-class) for running on faster machines.

As a developer using CircleCI you can:
- [SSH into any job]({{site.baseurl}}/2.0/ssh-access-jobs/) to debug your build issues
- Set up [parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs/) in your [.circleci/config.yml]({{site.baseurl}}/2.0/configuration-reference/) file to run jobs faster
- Configure [caching]({{site.baseurl}}/2.0/caching/) with two simple keys to reuse data from previous jobs in your [workflow]({{site.baseurl}}/2.0/workflows/)
- Configure self-hosted [runners]({{site.baseurl}}/2.0/runner-overview/) for unique platform support
- Access [Arm resources]({{site.baseurl}}/2.0/arm-resources/) for the machine executor
- Use [orbs]({{site.baseurl}}/2.0/using-orbs/), reusable packages of configuration, to integrate with third parties
- Use pre-built Docker [images]({{site.baseurl}}/2.0/circleci-images/) in a variety of languages
- Use the [API](https://circleci.com/docs/api/v2/) to retreive information about jobs and workflows
- Use the [CLI]({{site.baseurl}}/2.0/local-cli/) to access advanced tools locally
- Get flaky test detection with [test insights]({{site.baseurl}}/2.0/insights-tests/)

As an operator or administrator of CircleCI installed on your own servers, CircleCI provides monitoring and insights into your builds and uses [Nomad](https://www.nomadproject.io/) for scheduling.

See the [CircleCI Operations Guide]({{site.baseurl}}/2.0/server-3-overview/) for complete server documentation.

## Pricing and trial options
{: #pricing-and-trial-options }

Visit CircleCI's [Pricing page](https://circleci.com/pricing/) to view free and paid options. 

To get started with a free trial, visit the [Sign Up and Try CircleCI]({{site.baseurl}}/2.0/first-steps/) page and get set up with the hosted cloud application.

Organizations on the free plan are given free credits to use on open source projects. Visit [Building Open Source Projects]({{site.baseurl}}/2.0/oss/) for more information about free containers for public open source projects.

## Additional information
{: #additional-information }

Any app that runs on Linux, Android, or macOS is supported. Further references:
- [Supported Languages Guide]({{site.baseurl}}/2.0/demo-apps/) document for examples and guides
- [Core Features]({{site.baseurl}}/2.0/features/) for detailed descriptions and links to procedural documentation

## Learn More
{: #learn-more }
Enroll in the [CI/CD 101 Workshop](https://academy.circleci.com/cicd-basics?access_code=public-2021) with CircleCI academy to learn more.

Read more on our blog:
- [Config best practices: dependency caching](https://circleci.com/blog/config-best-practices-dependency-caching/)
- [Automate and scale your CI/CD with CircleCI orbs](https://circleci.com/blog/automate-and-scale-your-ci-cd-with-circleci-orbs/)
- [How to secure your CI pipeline](https://circleci.com/blog/secure-ci-pipeline/)