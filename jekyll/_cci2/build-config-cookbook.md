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

CircleCI Orbs are configuration packages that you can use to get started with the CircleCI platform. Orbs enable you to share,  standardize, and simplify configurations across your projects. You may also want to use orbs as a refererence for configuration best practices. 

Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of available orbs.

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

For more detailed information about CircleCI orbs, please refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

### Build Configuration Recipes

The table below lists the different build configuration "recipes" you can perform using CircleCI Orbs.

Build Configuration Recipe | Description 
------------|-----------
Deploying Software Changes to Amazon Elastic Container Service (ECS) | This section describes how you can deploy changes to the Amazon Elastic Container Service (ECS) using a CircleCI-certified ECS orb.
Deploying Software Changes to Google Kubernetes Engine (GKE) | This section describes how you can deploy changes to the Google Kubernetes Engine (GKE) using a CircleCI-certified GKE orb.
Deploying Applications to Heroku | This section describes how you can deploy application to Heroku using the CircleCI Heroku orb.
Enabling Custom Slack Notifications in CircleCI Jobs | This section describes how you can enable customized Slack notifications in CircleCI jobs.

## Deploying Software Changes to Amazon ECS

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. Although this documentation enables you to quickly and easily deploy software changes to the Amazon ECS service using CircleCI orbs, if you would like more detailed information about the Amazon ECS service and its components, please refer to the [Amazon ECS]( https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### Prerequisites

Before you can deploy any software changes to Amazon ECS on the CircleCI platform, you must first perform a series of configuration steps to ensure that you have properly set up your environment for the CircleCI platform. Also, because CircleCI has created an "orb" to simplify these steps, you will also need to ensure your CircleCI project has been configured for using CircleCI orbs.

#### Configuring Your Environment for the CircleCI Platform and Orbs

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**Note:** If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and enable them.

2) Add the orbs stanza below your version, which in turn invokes the orb:

```yaml
aws-ecs: circleci/aws-ecs@0.0.6
```

3) Use `aws-ecs elements` in your existing workflows and jobs.

### Updating the Amazon ECS Service

Now that your environment is configured to work with orbs, you should update the Amazon ECS service to ensure you have the latest version of ECS. There are two different ways you can update the Amazon ECS Service, depending on whether you also want to update the existing Amazon Web Services CLI. Both of these approaches are described below.

#### Updating the Amazon ECS Sevice Without Updating AWS CLI

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

Notice in this example that you need to instantiate two different AWS ECS orbs: `aws-ecs 0.0.3` and `aws-ecs 0.0.4` to update the ECS service. Once you have instantiated these two orbs, the orb workflows in the orb first build and push the image, and then deploy the service update to ECS.

#### Updating the Amazon Web Services CLI and Amazon ECS

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

#### Verifying the Amazon ECS Service Update

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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the task definition, and then verify the revision has been deployed. Refer to the [AWS ECR](https://circleci.com/docs/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to build and push an image to Amazon ECS.

For more detailed information about the CircleCI Amazon ECS/ECR orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/aws-ecs).

## Deploying Software Changes to Google Kubernetes Engine (GKE)

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly and easily deploy code and application updates to your customers without requiring significant time to deliver these updates. Using the GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Prerequisites

The sections below list the different prerequisites that should be met before deploying any software changes to the Google Kubernetes Engine (GKE).

#### Setting Environment Variables
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (required)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

#### Configuring Your Environment for the CircleCI Platform and Orbs

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**Note:** If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and enable them.

2) Add the orbs stanza below your version, invoking the following orbs:

```orbs:
    gcr: circleci/gcp-gke@0.0.2
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

### Publishing and Rolling Out The Image to the GKE Cluster

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

### Example GKE Orb

The example below illustrates how you can use the CircleCI GKE orb to log into the Google Cloud Platform (GCP), build and publish a docker image, and roll the image out to the GKE cluster.

```yaml
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

## Deploying Applications to Heroku

The Heroku platform is a cloud-based, fully-scalable platform that enables you to quickly and easily deliver and deploy applications. Using CircleCI builds and orbs, you can simplify the deployment process in a few simple steps by following the steps described in the sections below.

### Prerequisites

Before you can deploy an applications to the Heroku platform, make sure the following requirements are met:

* Your environment is configured to use the CircleCI platform and CircleCI orbs.
* The Heroku CLI is installed. 

#### Configuring Your Environment To Use the CircleCI Platform and Orbs

To configure your environment to use the CircleCI platform and associated orbs, perform the steps listed below.

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**Note:** If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** to enable them.

2) Add the orbs stanza below your version (`2.1`), thereby invoking the CircleCI Heroku orb:

```orbs:
  heroku: circleci/heroku@0.0.6
```

3) Use `heroku` elements in your existing workflows and jobs.

#### Installing the Heroku CLI

If the Heroku CLI is not already installed, you will need to install the Heroku CLI before you can deploy your application to the Heroku platform. To install the Heroku CLI, run the following installation step:

```yaml
version: 2.1
commands:
  install:
    steps:
      - run:
          name: "Install Heroku CLI, if necessary"
          command: |
            if [[ $(command -v heroku) == "" ]]; then
              curl https://cli-assets.heroku.com/install.sh | sh
            else
              echo "Heroku is already installed. No operation was performed."
            fi
```

### Deploying Application to Heroku Platform Using Git

Now that you have configured your environment to work with the CircleCI platform and orbs, and installed the Heroku CLI (if necessary), you can then deploy your application to the Heroku platform using git. By using git, you can simplify the deployment process, ensuring that you can quickly and easily deploy applications to the Heroku platform by only performing a single step.

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@1.0.0
workflows:
  heroku_deploy:
    jobs:
      - heroku/deploy-via-git
```

Notice in the above example, when the CircleCI Heroku orb (`circleci/heroku@1.0.0`) is invoked, the `heroku-deploy` workflow is initiated, enabling the `deploy-via-git` job to run.

For more detailed information about the CircleCI Heroku orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/heroku).

## Enabling Custom Slack Notifications in CircleCI Jobs

Slack is a real-time collaboration application where team members can work together to perform routine tasks and projects through custom channels and workspaces. When using the CircleCI platform, you may find it useful to enable custom notifications with the Slack app based on specific team needs and requirements. 

### Prerequisites

Before you can enable custom notifications in Slack while using the CircleCI platform, you must ensure your environment is properly configured and setup to leverage the CircleCI platform and orbs.

### Configuring Your Environment To Use the CircleCI Platform and Orbs

To configure your environment to use the CircleCI platform and associated orbs, perform the steps listed below.

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**Note:** If you do not already have pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** and enable them.

2) Add the orbs stanza below your version, invoking the orb:

```orbs:
  slack: circleci/slack@2.2.0
```

3) Use `slack` elements in your existing workflows and jobs.

### Notifying a Slack Channel of Pending Approval

The CircleCI Slack orb enables you to create different notifications and messages that can be delivered to your desired recipients. One type of notification you can create is an "approval" notification that alerts your recipients that a specific approval is pending. The example below illustrates how you can create this approval notification in a CircleCI job:

```yaml
version: 2.1
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
workflows:
  your-workflow:
    jobs:
      - slack/approval-notification:
          message: Pending approval
          webhook: webhook
```
Notice in the above example that you first need to invoke the `circleci/slack@1.0.0` orb before running your workflow, which then enables you to send your notification with its associated `message` and `webhook`.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).

### Notifying a Slack Channel With Custom Messages

Another type of notification you can create using the CircleCI Slack orb is a notification with a custom message created by you. This type of notification is useful when you want to deliver a detailed message to your recipients that is specific to a workflow, job, or project. You may also create a custom notification in a Slack channel to 

The example shown below details how you can create a custom message that will be delivered in a specific Slack channel for users.

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

After building a Docker image, perform the following steps to create your custom notification:

1) Specify the `color` of the text in the message.
2) Identify the recipients (`mentions`) of the message.
3) Provide the text in the `message` you want delivered.
4) Specify the `webhook` for the message.

Once you have performed these steps, invoke the CircleCI Slack orb (`circleci/slack@1.0.0`) to initiate the workflow to deliver your notification.

### Sending a Status Alert at the End of a Job Based on Success or Failure

You may also send a status alert at the end of a job to your recipients. Note that this status alert must be the last step in a job.

The example below shows how you can send a status alert at the end of a job.

```
yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - run: exit 0
      - slack/status:
          fail_only: 'true'
          mentions: 'USERID1,USERID2'
          only_for_branch: only_for_branch
          webhook: webhook
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
```
Notice in the example that the job is run and a Slack status alert is sent to your recipients (USERID1, USERID2) if the job has failed.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).
