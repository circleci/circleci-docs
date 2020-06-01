---
layout: classic-docs
title: "CircleCI Configuration Cookbook"
short-title: "Configuration Cookbook"
description: "Starting point for Configuration Cookbook"
categories: [getting-started]
order: 1
---

The *CircleCI Configuration Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various configuration tasks using CircleCI resources (including CircleCI and partner-certified Orbs). This guide, and its associated sections, will enable you to quickly and easily perform repeatable tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction

This page, and its associated "recipes," describes how you can perform specific tasks using a set of steps and instructions, including code snippets and examples, to ensure your CircleCI pipeline is properly configured. Each "recipe" in this "cookbook" relates to a single task that you can perform on the CircleCI platform using your own resources in addition to CircleCI resources such as CircleCI orbs. Whenever possible, CircleCI orbs will be used in these recipes since this will simplify the steps required to perform these tasks.

### What Are CircleCI Orbs?

CircleCI orbs are configuration packages that enable you to get started with the CircleCI platform. Orbs enable you to share,  standardize, and simplify configurations across your projects. You may also want to use orbs as a refererence for configuration best practices.

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

#### Configuring Your Environment for the CircleCI Platform and Orbs

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

**NOTE:** {% include snippets/enable-pipelines.md %}

2) Add the orbs stanza below your version, which in turn imports the orb:

```yaml
aws-ecs: circleci/aws-ecs@0.0.10
```

3) Invoke the orbs element (e.g. `aws-ecs elements`) in your existing workflows and jobs.

### Configuration Recipes

The table below lists the different build configuration "recipes" you can perform using CircleCI orbs.

Configuration Recipe | Description
------------|-----------
[Deploying Software Changes to Amazon Elastic Container Service (ECS)](#deploying-software-changes-to-amazon-ecs) | This section describes how you can deploy changes to the Amazon Elastic Container Service (ECS) using a CircleCI-certified ECS orb.
[Deploying Software Changes to Google Kubernetes Engine (GKE)](#deploying-software-changes-to-google-kubernetes-engine-gke) | This section describes how you can deploy changes to the Google Kubernetes Engine (GKE) using a CircleCI-certified GKE orb.
[Using Amazon Elastic Container Service for Kubernetes (Amazon EKS)](#using-amazon-elastic-container-service-for-kubernetes-amazon-eks) | This section describes how you can use the Amazon ECS service for Kubernetes for Kubernetes-related tasks and operations.
[Enabling Custom Slack Notifications in CircleCI Jobs](#enabling-custom-slack-notifications-in-circleci-jobs) | This section describes how you can enable customized Slack notifications in CircleCI jobs.
[Using Logic in Configuration](#using-logic-in-configuration) | This section describes how you can use pipeline values & parameters to select the work to perform.

## Deploying Software Changes to Amazon ECS

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. Although this documentation enables you to quickly and easily deploy software changes to the Amazon ECS service using CircleCI orbs, if you would like more detailed information about the how Amazon ECS service works, and its underlying components and architecture, please refer to the [Amazon ECS]( https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### Prerequisites

Before deploying any software changes to Amazon ECS on the CircleCI platform, you must first perform a series of configuration steps to ensure you have properly set up and configured your environment for the CircleCI platform. Also, because CircleCI has created an "orb" to simplify these steps, you will also need to ensure your CircleCI project has been configured to use CircleCI orbs.

### Updating the Amazon ECS Service

Now that your environment is configured to work with orbs, update the Amazon ECS service to ensure you have the latest version of ECS. There are two different ways you can update the Amazon ECS Service, depending on whether you also want to update the existing Amazon Web Services CLI. Both of these approaches are described below.

#### Updating the Amazon ECS Sevice Without Updating AWS CLI

To update the Amazon ECS Service without updating the AWS CLI using CircleCI orbs, review the the example shown below, which shows you how to update the ECS service.

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.4
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          account-url: '${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
          repo: '${MY_APP_PREFIX}'
          region: '${AWS_REGION}'
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build-and-push-image
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

Notice in this example that you need to instantiate two different AWS ECS orbs: `aws-ecs 0.0.3` and `aws-ecr 0.0.4` to update the ECS service. Once you have instantiated these two orbs, the orb enables the configuration, and then pushes the image, before finally deploying the service update to ECS.

#### Updating the Amazon Web Services CLI and Amazon ECS

To update both the AWS CLI and ECS Service simultaneously, use the orb shown below to simplify the process of updating these services.

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

Notice in this above example that you instantiate two different orbs, `aws-cli: circleci/aws-cli@0.1.4` and `aws-ecs: circleci/aws-ecs@0.0.3` to perform a number of sequential steps to ensure that the Amazon CLI is installed and configured before updating the Amazon ECS service.

#### Verifying the Amazon ECS Service Update

Once you have updated the Amazon ECS service, verify the update was properly applied using the CircleCI Amazon ECR/ECS orb. This orb example is shown below.

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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the task definition, and then verify the revision has been deployed. Refer to the [AWS ECR](https://circleci.com/docs/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to configure and push an image to Amazon ECS.

For more detailed information about the CircleCI Amazon ECS/ECR orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/aws-ecs).

## Deploying Software Changes to Google Kubernetes Engine (GKE)

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly and easily deploy code and application updates to your customers without requiring significant time to deliver these updates. Using the GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Prerequisites

The sections below list the prerequisites that must be met before deploying any software changes to the Google Kubernetes Engine (GKE).

#### Setting Environment Variables
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (required)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

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

**Note:** When running these steps, please note that you should use your cluster name in GKE, in addition to separating the cluster and deployment parameters.

### Publishing and Rolling Out The Image to the GKE Cluster

Now that you have installed (if necessary) and initialized `gcloud` and updated the docker image, you may then publish and roll out this updated image to the GKE cluster for later use.

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

The example below shows how you can use the CircleCI GKE orb to log into the Google Cloud Platform (GCP), build and publish a docker image, and then roll the image out to the GKE cluster.

```yaml
version: 2.1

# Orb Dependencies
orbs:
  gcloud: circleci/gcp-cli@1.0.6
  gcr: circleci/gcp-gcr@0.0.2
  k8s: circleci/kubernetes@0.1.0

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
      cluster:
        description: "The Kubernetes cluster name."
        type: string
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
          gcloud container clusters get-credentials <<parameters.cluster>>
          kubectl set image deployment <<parameters.deployment>> <<parameters.container>>=<<parameters.image>>

jobs:
  publish-and-rollout-image:
    description: "Update cluster with new Docker image."
    machine: true
    parameters:
      cluster:
        description: "The Kubernetes cluster name."
        type: string
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
          cluster: "<<parameters.cluster>>"
          deployment: "<<parameters.deployment>>"
          container: "<<parameters.container>>"
          image: "<<parameters.image>>"

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

## Using Amazon Elastic Container Service for Kubernetes (Amazon EKS)

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Kubernetes Service (EKS) to perform the following tasks:

* Create an EKS cluster
* Create a Kubernetes deployment
* Install Helm charts
* Update a container image

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/orbs/registry/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

### Prerequisites

Before using the AWS EKS orb, make sure you meet the following requirements:

* Set up your project (repo) to build on CircleCI. See our [Getting Started guide]({{ site.baseurl }}/2.0/getting-started) for help with this if required.
* Ensure you use `version: 2.1` config. This is required to use orbs.
* {% include snippets/enable-pipelines.md %}

### Create an EKS Cluster

Once you meet the requirements for using the CircleCI `aws-eks` orb, you can create, teat and teardown an EKS cluster using the code sample shown below.

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z
  kubernetes: circleci/kubernetes@x.y.z

jobs:
  test-cluster:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          Name of the EKS cluster
        type: string
    steps:
      - kubernetes/install
      - aws-eks/update-kubeconfig-with-authenticator:
          cluster-name: << parameters.cluster-name >>
      - run:
          command: |
            kubectl get services
          name: Test cluster


workflows:
  deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: my-eks-demo
      - test-cluster:
          cluster-name: my-eks-demo
          requires:
            - aws-eks/create-cluster
      - aws-eks/delete-cluster:
          cluster-name: my-eks-demo
          requires:
            - test-cluster
```

In this example two orbs are used: built-in jobs and commands from the `aws-eks` orb are used to create, test and then teardown a cluster. The built-in `install` command from the `kubernetes` orb is used to install `kubectl`.

### Create a Kubernetes Deployment

You may wish to create a Kubernetes deployment, which enables you to manage the cluster and perform different actions within the cluster, including the ability to:

* update resources within the cluster
* update the Kubernetes configuration with the authenticator
* update the container image

The code example below illustrates how you can create the Kubernetes deployment.

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z
  kubernetes: circleci/kubernetes@x.y.z

jobs:
  create-deployment:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          Name of the EKS cluster
        type: string
    steps:
      - checkout
      - aws-eks/update-kubeconfig-with-authenticator:
          cluster-name: << parameters.cluster-name >>
          install-kubectl: true
      - kubernetes/create-or-update-resource:
          get-rollout-status: true
          resource-file-path: tests/nginx-deployment/deployment.yaml
          resource-name: deployment/nginx-deployment

workflows:
  deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: eks-demo-deployment
      - create-deployment:
          cluster-name: eks-demo-deployment
          requires:
            - aws-eks/create-cluster
      - aws-eks/update-container-image:
          cluster-name: eks-demo-deployment
          container-image-updates: 'nginx=nginx:1.9.1'
          post-steps:
            - kubernetes/delete-resource:
                resource-names: nginx-deployment
                resource-types: deployment
                wait: true
          record: true
          requires:
            - create-deployment
          resource-name: deployment/nginx-deployment
      - aws-eks/delete-cluster:
          cluster-name: eks-demo-deployment
          requires:
            - aws-eks/update-container-image
```

#### Install a Helm Chart in Your Cluster

Helm is a powerful application package manager that runs on top of a Kubernetes cluster and allows you to describe the application structure by using helm-charts and manage the structure using simple commands. Helm uses a packaging format called charts, which are collections of files that describe a related set of Kubernetes resources. A single chart might be used to deploy something simple, like a memcached pod, or something complex, like a full web app stack with HTTP servers, databases, caches, and so on.

Using the `aws-eks` orb you can install Helm on your Kubernetes cluster, then install a Helm chart just using the orb's built-in jobs. Below is a code example for this, wchich also cleans up by deleting the release and cluster at the end of the process:

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z

workflows:
  deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: my-eks-helm-demo
      - aws-eks/install-helm-on-cluster:
          cluster-name: my-eks-helm-demo
          enable-cluster-wide-admin-access: true
          requires:
            - aws-eks/create-cluster
      - aws-eks/install-helm-chart:
          chart: stable/grafana
          cluster-name: my-eks-helm-demo
          release-name: grafana-release
          requires:
            - aws-eks/install-helm-on-cluster
      - aws-eks/delete-helm-release:
          cluster-name: my-eks-helm-demo
          release-name: grafana-release
          requires:
            - aws-eks/install-helm-chart
      - aws-eks/delete-cluster:
          cluster-name: my-eks-helm-demo
          requires:
            - aws-eks/delete-helm-release
```

## Enabling Custom Slack Notifications in CircleCI Jobs

Slack is a real-time collaboration application where team members can work together to perform routine tasks and projects through custom channels and workspaces. When using the CircleCI platform, you may find it useful to enable custom notifications with the Slack app based on specific team needs and requirements.

### Prerequisites

* Set up your project (repo) to build on CircleCI. See our [Getting Started guide]({{ site.baseurl }}/2.0/getting-started) for help with this if required.
* Ensure you use `version: 2.1` config. This is required to use orbs.
* {% include snippets/enable-pipelines.md %}

### Notifying a Slack Channel of Pending Approval

The [CircleCI Slack orb](https://circleci.com/orbs/registry/orb/circleci/slack) enables you to create different notifications and messages that can be delivered to your desired recipients. One type of notification you can create is an "approval" notification that alerts your recipients that a specific approval is pending. The example below illustrates how you can create this approval notification in a CircleCI job:

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

workflows:
  your-workflow:
    jobs:
      - slack/approval-notification:
          message: Pending approval
          webhook: webhook
```
In the above example, note that you first need to invoke the `circleci/slack@x.y.z` orb before running your workflow, which then enables you to send your notification with its associated `message` and `webhook`.

There are several parameters for you to customize your Slack notifications that aren't shown here. For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).

### Notifying a Slack Channel With Custom Messages

Another type of notification you can create using the CircleCI Slack orb is a notification with a custom message created by you. This type of notification is useful when you want to deliver a detailed message to your recipients that is specific to a workflow, job, or project.

The example shown below details how you can create a custom message that will be delivered in a specific Slack channel for users.

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

jobs:
  build:
    docker:
      - image: <docker-image-name-tag>
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook

workflows:
  your-workflow:
    jobs:
      - build
```

In this example, the Slack orb command `notify` is used, along with the following parameters to create a custom notification:

1. Specify the `color` of the text in the message.
2. Identify the recipients (`mentions`) of the message.
3. Provide the text in the `message` you want delivered.
4. Specify the `webhook` for the message – see this [guide](https://api.slack.com/incoming-webhooks) for more on creating Slack webhooks.

### Sending a Status Alert at the End of a Job Based on Success or Failure

You may also send a status alert at the end of a job to your recipients. Note that this status alert must be the last step in a job.

The example below shows how you can send a status alert at the end of a job.

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - run: exit 0
      - slack/status:
          fail_only: 'true'
          mentions: 'USERID1,USERID2'
          only_for_branch: your-branch-name
          webhook: webhook
```

Notice in the example that the job is run and a Slack status alert is sent to your recipients (USERID1, USERID2) if the job has failed.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).

## Using Logic in Configuration

### Selecting a Workflow With a Pipeline Parameter

If you want to be able to trigger custom workflows manually via the API, but still run a workflow on every push, you can use pipeline parameters to decide which workflows to run.

```yaml
version: 2.1

parameters:
  action:
    type: enum
    enum: [build, report]
    default: build

jobs:
  build:
    machine: true
    steps:
      - checkout
      - run: ./run-tests.sh

  report:
    machine: true
    steps:
      - checkout
      - run: ./create-report.sh

workflows:
  build:
    when:
      equal: [ build, << pipeline.parameters.action >> ]
    jobs:
      - build

  report:
    when:
      equal: [ report, << pipeline.parameters.action >> ]
    jobs:
      - report
```

The `action` parameter will default to `build` on pushes, but you can supply a different value to select a different workflow to run, like `report`.

### Branch-filtering for Job Steps

Branch filtering has previously only been available for workflows, but with compile-time logic statements, you can implement it for job steps as well.

```yaml
version: 2.1

jobs:
  my-job:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - when:
          condition:
            equal: [ master, << pipeline.git.branch >> ]
          steps:
            - run: echo "I am on master"

workflows:
  my-workflow:
    jobs:
      - my-job
```
