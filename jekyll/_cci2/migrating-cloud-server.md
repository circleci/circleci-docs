---
layout: classic-docs
title: "Migrating from Cloud to Server"
short-title: "Migrating from Cloud to Server"
description: "Migrating 2.0 Cloud projects to a 2.0 server installation"
categories: [getting-started]
order: 1
---

There is no formal process or toolset to migrate between CircleCI Cloud (SaaS) to an installed CircleCI Server setup.
The process is to perform a fresh install of CircleCI 2.0, using AWS and Terraform—see [Installation]({{ site.baseurl }}/2.0/aws) for instructions.

Next, you will need to manually copy over all of your project settings including Contexts, environment variables, and API tokens.

**Note:** It is not possible to bring your projects' build histories from SaaS; you will have to re-add all of your projects to your Server installation.

Your 2.0 `config.yml` files should work as-is on Server, assuming they are working on SaaS. There are small differences between the 1.0 build environments that may result in some 1.0 configs not translating 100% from SaaS to Server. 

Custom `machine` executor AMIs and configurable instance types are defined in a specific way, so consider how your teams may be using [configurable resources](https://circleci.com/docs/2.0/configuration-reference/#resource_class) (`resource_class`) on SaaS when defining your Server build cluster.

## Limitations 

- Currently the `macos` executor is not supported on Server.
- Bitbucket is not supported on Server; GitHub/GitHub Enterprise is the only supported VCS.
