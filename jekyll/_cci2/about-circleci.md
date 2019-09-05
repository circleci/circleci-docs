---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

This document provides a summary of continuous integration and how CircleCI enables engineering teams with automation. CircleCI automates your software builds, tests, and deployments.

## CircleCI Overview

**CircleCI** - Our mission is to empower technology-driven organizations to do their best work.  
We want to make engineering teams more productive through intelligent automation.

CircleCI provides enterprise-class support and services, with the flexibility of a startup.  
We work where you work: Linux, macOS, Android, and Windows - SaaS or behind your firewall.  

![CircleCI about image]( {{ site.baseurl }}/assets/img/docs/arch.png)

## Benefits of CircleCI

CircleCI runs nearly one million jobs per day in support of 30,000 organizations. Organizations choose CircleCI because jobs run fast and builds can be optimized for speed. CircleCI can be configured to run very complex pipelines efficiently with sophisticated [caching]({{site.baseurl}}/2.0/caching/), [docker layer caching]({{site.baseurl}}/2.0/docker-layer-caching/), [resource classes]({{site.baseurl}}/2.0/optimizations/#resource-class) for running on faster machines, and [performance pricing](https://circleci.com/pricing/usage/). 

As a developer using [circleci.com](https://circleci.com), you can [SSH into any job]({{site.baseurl}}/2.0/ssh-access-jobs/) to debug your build issues, set up [parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs/) in your [.circleci/config.yml]({{site.baseurl}}/2.0/configuration-reference/) file to run jobs faster, and configure [caching]({{site.baseurl}}/2.0/caching/) with two simple keys to reuse data from previous jobs in your [workflow]({{site.baseurl}}/2.0/workflows/).

As an operator or administrator of CircleCI installed on your own servers, CircleCI provides monitoring and insights into your builds and uses Nomad Cluster for scheduling, see the [CircleCI Operations Guide]({{site.baseurl}}/2.0/circleci-ops-guide-v2-17.pdf) for complete documentation.

## Summary

After a software repository on GitHub or Bitbucket is authorized and added as a project to [circleci.com](https://circleci.com), every code change triggers automated tests in a clean container or VM. CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or VM. That is, each time your job runs CircleCI spins up a container or VM to run the job in.

CircleCI then sends an email notification of success or failure after the tests complete. CircleCI also includes integrated Slack and IRC notifications. Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including AWS CodeDeploy, AWS EC2 Container Service (ECS), AWS S3, Google Kubernetes Engine (GKE), Microsoft Azure, and Heroku. Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

## What is Continuous Integration?

**Continuous integration** is a practice that encourages developers to integrate their code into a `master` branch of a shared repository early and often. Instead of building out features in isolation and integrating them at the end of a development cycle, code is integrated with the shared repository by each developer multiple times throughout the day.

**Continuous Integration** is a key step to digital transformation.

**What?**    
Every developer commits daily to a shared mainline.  
Every commit triggers an automated build and test.  
If build and test fails, it’s repaired quickly - within minutes.  

**Why?**    
Improve team productivity, efficiency, happiness.
Find problems and solve them, quickly.
Release higher quality, more stable products.


## Free Trial Options

CircleCI provides a free trial with the following options:

- **Cloud**: See [Signup and Try CircleCI]({{site.baseurl}}/2.0/first-steps/) to get started with the hosted application.
- **Server**: Refer to [CircleCI Trial Installation]({{site.baseurl}}/2.0/single-box/) for the Enterprise Trial instructions.

### Open Source

See [Building Open Source Projects]({{site.baseurl}}/2.0/oss/) for information about free containers for public open source projects. 

## See Also

Any app that runs on Linux, Android, or macOS is supported. Refer to the 
- [Supported Languages]({{site.baseurl}}/2.0/demo-apps/) document for examples and guides.
- [Core Features]({{site.baseurl}}/2.0/features/) for detailed descriptions and links to procedural documentation.

