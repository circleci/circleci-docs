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

For more detailed information about CircleCI orbs, please refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

### Build Configuration Recipes

The table below lists the different build configuration "recipes" you can perform using CircleCI Orbs.

Build Configuration Recipe | Description 
------------|-----------
Deploying Software Changes to Amazon Elastic Container Service (ECS) | This page describes how you can deploy changes to the Amazon Elastic Container Service (ECS) using a CircleCI-certified ECS orb.
Deploying Software Changes to Google Kubernetes Engine (GKE) | This page describes how you can deploy changes to the Google Kubernetes Engine (GKE) using a CircleCI-certified GKE orb.

## Deploying Software Changes to Amazon ECS

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. Although this documentation enables you to quickly and easily deploy software changes to the Amazon ECS service using CircleCI orbs, if you would like more detailed information about the Amazon ECS service and its components, please refer to the [Amazon ECS]( https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

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

## Updating the Amazon ECS Service

Now that your environment is configured to work with orbs, you should update the Amazon ECS service to ensure you have the latest version of ECS. There are two different ways you can update the Amazon ECS Service, depending on whether you also want to update the existing Amazon Web Services CLI. Both of these approaches are described below.

### Updating the Amazon ECS Sevice Without Updating AWS CLI

If you want to update the Amazon ECS Service without updating the AWS CLI using CircleCI orbs, review the the yaml code sample shown below, which illustrates how you can update the ECS service.

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

### Updating the Amazon Web Services CLI and Amazon ECS

If, however, you would like to update both the AWS CLI and ECS Service at the same time, you can use the orb shown below to simplify the process of updating these services.

```yaml
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.4
  aws-ecs: circleci/aws-ecs@0.0.3
jobs:
  update-tag:
    docker:
      - image: 'circleci/python:3.7.1'
    steps:
      - aws-cli/install
      - aws-cli/configure:
          aws-access-key-id: $AWS_ACCESS_KEY_ID
          aws-region: $AWS_REGION
      - aws-ecs/update-service:
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=stable'
workflows:
  deploy:
    jobs:
      - update-tag
```

Notice in the above example that you instantiate two different orbs, `aws-cli: circleci/aws-cli@0.1.4` and `aws-ecs: circleci/aws-ecs@0.0.3` to perform a number of sequential steps to ensure that the Amazon CLI is installed and configured before updating the Amazon ECS service.

## Verifying the Amazon ECS Service Update

Once you have updated the Amazon ECS service, you should verify that the update was properly applied using the Amazon ECR/ECS orb. This orb example is shown below.

```yaml
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.4
  aws-ecs: circleci/aws-ecs@0.0.3
jobs:
  verify-deployment:
    docker:
      - image: 'circleci/python:3.7.1'
    steps:
      - aws-cli/install
      - aws-cli/configure:
          aws-access-key-id: $AWS_ACCESS_KEY_ID
          aws-region: $AWS_REGION
      - run:
          name: Get last task definition
          command: >
            TASK_DEFINITION_ARN=$(aws ecs describe-task-definition \
                --task-definition ${MY_APP_PREFIX}-service \
                --output text \
                --query 'taskDefinition.taskDefinitionArn')
            echo "export TASK_DEFINITION_ARN='${TASK_DEFINITION_ARN}'" >>
            $BASH_ENV
      - aws-ecs/verify-revision-is-deployed:
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          task-definition-arn: '${TASK_DEFINITION_ARN}'
workflows:
  test-workflow:
    jobs:
      - verify-deployment
```

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the task definition, and then verify the revision has been deployed.

For more detailed information about the CircleCI Amazon ECS/ECR orb, refer to the [CircleCI Orb Registry] (https://circleci.com/orbs/registry/orb/circleci/aws-ecs).

## Deploying Software Changes to Google Kubernetes Engine (GKE)

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly and easily deploy code and application updates to your customers without requiring significant time to deliver these updates. Using the GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE] (https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Prerequisites

#### Setting Environment Variables
The following environment variables need to be set in CircleCI either directly or via a context:

- `GCLOUD_SERVICE_KEY` (required)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

#### Configuring Your Environment for the CircleCI Platform and Orbs

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and enable pipelines.

2) Add the orbs stanza below your version, invoking the following orbs:

```orbs:
    gcloud: circleci/gcp-cli@1.0.6
    gcr: circleci/gcp-gcr@0.0.2
    k8s: circleci/kubernetes@0.1.0
```

### Managing GKE Actions

The CircleCI GKE orb enables you to perform several different actions within the orb while working with a GKE cluster, including:

- installing `gcloud` and `kubectl` if it is not already installed
- initialize the `gcloud` CLI
- update an existing deployment's docker image

The code example below shows how you can perform these actions while also rolling out the docker image to the GKE cluster.

```yaml
version: 2.1
commands:
  install:
    description: "Install `gcloud` and `kubectl` if not already installed."
    steps:
      - gcloud/install
      - k8s/install
  init:
    description: "Initialize the `gcloud` CLI."
    steps:
      - gcloud/initialize
  rollout-image:
    description: "Update a deployment's Docker image."
    parameters:
      deployment:
        description: "The Kubernetes deployment name."
        type: string
      container:
        description: "The Kubernetes container name."
        type: string
      image:
        description: A name for your docker image
        type: string
    steps:
      - run: |
          gcloud container clusters get-credentials <<parameters.deployment>>
          kubectl set image deployment <<parameters.deployment>> <<parameters.container>>=<<parameters.image>>
```

## Publishing and Rolling Out The Image to the GKE Cluster

Now that you have installed (if necessary) and initialized `gcloud` and updated the docker image, you may then publish and roll out this updated image to the GKE cluster for use. 

```yaml
version: 2.1
jobs:
  publish-and-rollout-image:
    description: "Update cluster with new Docker image."
    machine: true
    parameters:
      deployment:
        description: "The Kubernetes deployment name."
        type: string
      container:
        description: "The Kubernetes container name."
        type: string
      gcloud-service-key:
        description: The gcloud service key
        type: env_var_name
        default: GCLOUD_SERVICE_KEY
      google-project-id:
        description: The Google project ID to connect with via the gcloud CLI
        type: env_var_name
        default: GOOGLE_PROJECT_ID
      google-compute-zone:
        description: The Google compute zone to connect with via the gcloud CLI
        type: env_var_name
        default: GOOGLE_COMPUTE_ZONE
      registry-url:
        description: The GCR registry URL from ['', us, eu, asia].gcr.io
        type: string
        default: gcr.io
      image:
        description: A name for your docker image
        type: string
      tag:
        description: A docker image tag
        type: string
        default: "latest"
      path-to-dockerfile:
        description: The relative path to the Dockerfile to use when building image
        type: string
        default: "."
    steps:
      - checkout
      - gcr/gcr-auth:
          google-project-id: <<parameters.google-project-id>>
          google-compute-zone: <<parameters.google-compute-zone>>
      - install
      - gcr/build-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: << parameters.tag >>
          path-to-dockerfile: <<parameters.path-to-dockerfile>>
      - gcr/push-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: <<parameters.tag>>
      - rollout-image:
          deployment: "<<parameters.deployment>>"
          container: "<<parameters.container>>"
          image: "<<parameters.image>>"
```

## Example GKE Orb

The example below illustrates how you can use the CircleCI GKE orb to log into the Google Cloud Platform (GCP), build and publish a docker image, and roll the image out to the GKE cluster.

```yaml
example:
  publish-and-rollout-image:
    description: |
      "The simplest example of using this Orb. Logs into GCP, builds and 
      publishes a Docker image, and then rolls the image out to a GKE cluster."
    usage:
      version: 2.1
      orbs:
        gke: felicianotech/test-gke@dev:testing-3
      workflows:
        main:
          jobs:
            - build
            - gke/publish-and-rollout-image:
                context: gcp-testing
                deployment: orb-badge-server
                image: orb-badge-server
                tag: "2"
```
