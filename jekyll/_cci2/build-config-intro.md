---
layout: classic-docs
title: "Build Configuration Cookbook Introduction"
short-title: "Build Config Introduction"
description: "Starting point for Build Configuration Cookbook"
categories: [getting-started]
order: 1
---

The *CircleCI Build Configuration Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various build configuration tasks using CircleCI resources (including CircleCI and partner-certified Orbs). This guide, and its associated pages, will enable you to quickly and easily perform repeatable build tasks on the CircleCI platform.

## Introduction

This page, and its associated "recipes" on subsequent pages, describes how you can perform specific tasks using a set of steps and instructions, including code snippets and examples, to ensure your CircleCI build is properly configured. Each "recipe" in this "cookbook" relates to a single task that you can perform on the CircleCI platform using your own resources in addition to CircleCI resources such as CircleCI orbs. Whenever possible, CircleCI orbs will be used in these recipes since this will simplify the steps required to perform these tasks.

### What Are CircleCI Orbs?

Orbs are packages of config that you can use to quickly get started with the CircleCI platform. Orbs enable you to share,  standardize, and simplify config across your projects. You may also want to use orbs as a refererence for config best practices. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of available orbs.

To use an existing orb in your 2.1 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) file, invoke it with the `orbs` key. The following example invokes the [`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) in the `circleci` namespace.

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**Note:** If your project was added to CircleCI prior to 2.1, you must enable [Build Processing]({{ site.baseurl }}/2.0/build-processing/) to use the `orbs` key.

For more detailed information about CircleCI orbs, please refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orbs-intro/) page.

### Build Configuration Recipes

The table below lists the different build configuration "recipes" you can perform using CircleCI Orbs.

Build Configuration Recipe | Description 
------------|-----------
Deploying Software Changes to Amazon Elastic Container Service (ECS) | This page describes how you can deploy changes to the Amazon Elastic Container Service (ECS) using a CircleCI-certified ECS orb.
Deploying Software Changes to Google Kubernetes Engine (GKE) | This page describes how you can deploy changes to the Google Kubernetes Engine (GKE) using a CircleCI-certified GKE orb.

## Deploying Software Changes to Amazon ECS

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform.

### Prerequisites

Before you can deploy any software changes to Amazon ECS on the CircleCI platform, you must first perform a series of configuration steps to ensure that you have properly set up your environment for the CircleCI platform. Also, because CircleCI has created an "orb" to simplify these steps, you will also need to ensure your instance has been configured for using CircleCI orbs.

### Configuring Your Environment for the CircleCI Platform and Orbs

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and enable pipelines.

2) Add the orbs stanza below your version, invoking the orb:

```orbs:
  aws-ecs: circleci/aws-ecs@0.0.6
```

3) Use `aws-ecs elements` in your existing workflows and jobs.

### Updating the Amazon ECS Service

Now that your environment is configured to work with orbs, you will need to update the Amazon ECS service to ensure you have the latest version of ECS. The yaml code sample below illustrates how you can update the ECS service.

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.4
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: '${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
          repo: '${MY_APP_PREFIX}'
          region: '${AWS_REGION}'
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

Notice in this example that you need to instantiate two different AWS ECR orbs: `aws-ecr 0.0.3` and `aws-ecr 0.0.4` to update the ECS service. Once you have instantiated these two orbs, the orb workflows in the orb first build and push the image, and then deploy the service update to ECS.
