---
layout: classic-docs
title: "Overview"
short-title: "Overview"
description: "Starting point for CircleCI 2.0 docs"
categories: [getting-started]
order: 1
---

This document provides a summary of continuous integration and how CircleCI enables engineering teams with automation.

## CircleCI Overview

**CircleCI** - Our mission is to empower technology-driven organizations to do their best work.  
We want to make engineering teams more productive through intelligent automation.

CircleCI provides enterprise-class support and services, with the flexibility of a startup.  
We work where you work: Linux, macOS, Android - SaaS or behind your firewall.  

![CircleCI about image]( {{ site.baseurl }}/assets/img/docs/arch.png)

## Summary

After a software repository on GitHub or Bitbucket is authorized and added as a project to [circleci.com](https://circleci.com), every code change triggers automated tests in a clean container or VM. CircleCI then sends an email notification of success or failure after the tests complete. CircleCI also includes integrated Slack, HipChat, Campfire, Flowdock, and IRC notifications. Code test coverage results are available from the details page for any project for which a reporting library is added.

CircleCI may be configured to deploy code to various environments, including AWS CodeDeploy, AWS EC2 Container Service (ECS), AWS S3, Google Container Engine (GKE), and Heroku. Other cloud service deployments are easily scripted using SSH or by installing the API client of the service with your job configuration.

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
[Supported Languages]({{site.baseurl}}/2.0/demo-apps/) document for examples and guides.

