---
layout: classic-docs
title: "Orb User - Configuration"
short-title: "Orb Platform Configuration"
description: "Configuring your platform to use orbs"
categories: [getting-started]
order: 1
---

## Introduction

Orbs are packages of configuration that you can use to quickly get started with the CircleCI platform. Orbs enable you to share, standardize, and simplify configurations across your projects without much customization and work. You may also want to use orbs as a refererence for configuration best practices. 

Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of available orbs.

## Configure Your Platform to Work With Orbs

Configuring your platform to work with orbs is a very simple process, requiring you to invoke the orb you have chosen to use from the CircleCI Orbs Registry. 

To use an existing orb from the CircleCI Orbs Registry in your 2.1 `circleci/config.yml` file, invoke the orb with the `orbs` key. 

The example below demonstrates how you can invoke the `hello-build` orb in the `circleci` namespace.

``
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**Note:** If your project was added to CircleCI prior to 2.1, you must enable pipelines to use the `orbs` key.

## See Also
{:.no_toc}

- Refer to Orb Introduction ({{site.baseurl}}/2.0/orb-intro/), for a high-level overview of CircleCI orbs.
- Refer to Selecting and Using an Orb ({{site.baseurl}}/2.0/orbs-user-select-orb/), for steps on how to select, and then use, an orb from the CircleCI Orbs Registry. 
