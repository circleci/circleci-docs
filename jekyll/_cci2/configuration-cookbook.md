---
layout: classic-docs
title: "CircleCI Configuration Cookbook"
short-title: "Configuration Cookbook"
description: "Starting point for Configuration Cookbook"
categories: [getting-started]
order: 1
version:
- Cloud
---

The *CircleCI Configuration Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various configuration tasks using CircleCI resources including orbs. This guide, and its associated sections, will enable you to quickly perform repeatable tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction

This page, and its associated recipes, describes how you can perform specific configuration tasks. Recipes include code snippets and examples for you to customize to fit your projects. Each recipe in this cookbook relates to a single task that you can perform on the CircleCI platform using your own resources in addition to CircleCI resources such as CircleCI orbs. 

### What Are CircleCI Orbs?
{:.no_toc}

CircleCI orbs are configuration packages that enable you to get started with the CircleCI platform. Orbs enable you to share, standardize, and simplify configurations across your projects. You may also want to use orbs as a reference for configuration best practices.

Refer to the [CircleCI Orbs Registry](https://circleci.com/developer/orbs/) for the complete list of available orbs.

To use an existing orb in your 2.1 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) file, invoke it with the `orbs` key. The following example invokes the [`hello-build` orb](https://circleci.com/developer/orbs/orb/circleci/hello-build) in the `circleci` namespace.

```yaml
version: 2.1

orbs:
  hello: circleci/hello-build@x.y.z

workflows:
  "Hello Workflow":
    jobs:
      - hello/hello-build
```

For more detailed information about CircleCI orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

## Configure Your Environment for CircleCI Pipelines and Orbs
{:.no_toc}

Most recipes in this cookbook call for version 2.1 configuration, pipelines and often, orbs. Before using the examples provided, you should check that you are set up for these features. The following notes and steps will get you where you need to be.

* In order to use pipelines features and orbs you must use `version 2.1` config. 
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using a self-hosted installation of CircleCI Server, these recipes are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/developer/orbs/) to see how the individual jobs and commands are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs/).
* Any items that appear within `< >` should be replaced with your own parameters.

## Deploy changes to Amazon ECS

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. This recipe shows you how to quickly deploy software changes to Amazon ECS using CircleCI orbs, but if you would like more detailed information about the how Amazon ECS service works, and its underlying components and architecture, please refer to the [Amazon ECS]( https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### Setting Environment Variables
The following environment variables need to be set in CircleCI either directly or through a context:

* `AWS_ECR_ACCOUNT_URL` 
* `MY_APP_PREFIX` 
* `AWS_REGION` 
* `AWS_ACCESS_KEY_ID`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

**Note:** the `CIRCLE_SHA1` variable used in this example is built-in, so it is always available.

### Build, Push and Deploy a Service Update

To configure an [AWS service update](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html) to deploy a newly built image from AWS ECR, you can use orbs to keep your configuration as simple as possible: the `aws-ecr` orb to build and push an updated image to ECR, and the `aws-ecs` orb to deploy you service update.

The following example shows building and pushing an image to AWS ECR and pushing that image as a service update to AWS ECS:
 
```yml
version: 2.1 # 2.1 config required to use orbs

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # invoke the AWS ECR orb
  aws-ecs: circleci/aws-ecs@x.y.z # invoke the AWS ECS orb

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image: # orb built-in job
          repo: '${MY_APP_PREFIX}'
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update: # orb built-in job
          requires:
            - aws-ecr/build-and-push-image
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

For a full list of usage options and orb elements see the [AWS-ECS orb page](https://circleci.com/developer/orbs/orb/circleci/aws-ecs) in the CircleCI Orbs Registry.

### Verify the Amazon ECS Service Update

Once you have updated the Amazon ECS service, you can verify the update was correctly applied. To keep your config as simple as possible, use the AWS CLI and ECS orbs. This time, rather than using an orb's built-in job to perform the required process, commands from the orbs are used as steps in the definition of the job named `verify-deployment`. 

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@x.y.z
  aws-ecs: circleci/aws-ecs@x.y.z

jobs:
  verify-deployment:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the [task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) that was previously deployed, and then _verify_ the revision has been deployed using the `verify-revision-is-deployed` command from the `AWS-ECS` orb. Refer to the [AWS ECR](https://circleci.com/docs/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to configure and push an image to Amazon ECS.

Find more detailed information in the CircleCI Orb Registry for the CircleCI [AWS ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs) and [AWS ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr) orbs.

## Interact with Google Kubernetes Engine (GKE)

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly deploy code and application updates to your customers without requiring significant time to deliver these updates. Using GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Set Environment Variables
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (required)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

### Creating and Deleting Clusters
Using the CircleCI GKE orb, you can perform complex actions with minimal configuration required. For example, once you have set the environment variable mentioned in the previous section, you can create a new GKE cluster using the following snippet:

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  main:
    jobs:
      - gke/create-cluster:
          cluster: gcp-testing
```

To delete a cluster, all you need is:

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  main:
    jobs:
      - gke/delete-cluster:
          cluster: gcp-testing
```

### Publishing and Rolling Out The Image to the GKE Cluster

Using the CircleCI GKE orb makes publishing and rolling out a docker image to your GKE cluster very simple, as shown in the example below. All you need is the orbs built-in command `publish-and-rollout-image`, along with definitions for a few required parameters. For a full list of of parameters available for this job, check the [GKE page](https://circleci.com/developer/orbs/orb/circleci/gcp-gke?version=1.0.4#jobs-publish-and-rollout-image) in the CircleCI Orbs Registry.

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  my-workflow:
    jobs:
      - gke/publish-and-rollout-image:
          cluster: <my-cluster-name>
          container: <my-kubernetes-container-name>
          deployment: <my-kubernetes-deployment-name>
          image: <my-docker-image-name>
```

## Using Amazon Elastic Container Service for Kubernetes (Amazon EKS)

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Kubernetes Service (EKS) to perform the following tasks:

* Create an EKS cluster
* Create a Kubernetes deployment
* Install Helm charts
* Update a container image

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

### Create an EKS Cluster

Using the CircleCI `aws-eks` orb, you can create, test and teardown an EKS cluster using the code sample shown below.

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

### Install a Helm Chart in Your Cluster

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

### Notifying a Slack Channel of Pending Approval

The [CircleCI Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) enables you to create different notifications and messages that can be delivered to your desired recipients. One type of notification you can create is an "approval" notification that alerts your recipients that a specific approval is pending. The example below illustrates how you can create this approval notification in a CircleCI job:

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

There are several parameters for you to customize your Slack notifications that aren't shown here. For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/developer/orbs/orb/circleci/slack).

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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: exit 0
      - slack/status:
          fail_only: 'true'
          mentions: 'USERID1,USERID2'
          only_for_branch: your-branch-name
          webhook: webhook
```

Notice in the example that the job is run and a Slack status alert is sent to your recipients (USERID1, USERID2) if the job has failed.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/developer/orbs/orb/circleci/slack).

## Selecting a Workflow to Run Using Pipeline Parameters

You might find that you want to be able to trigger a specific workflow to run, manually, using the API, but still run a workflow on every push to your project. To achieve this, use [pipeline parameters]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to decide which workflow(s) to run. 

The following example defaults to running the `build` workflow, but allows control of which other workflow to run using the API:

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

The `action` parameter will default to `build` on pushes to the project. Below is an example of supplying a different value to `action` using the API v2 [Trigger a New Pipeline]({{ site.baseurl }}/api/v2/#operation/triggerPipeline) endpoint to select a different workflow to run, in this example, the workflow named `report` would run. Remember to substitute [`project-slug`]({{ site.baseurl }}/2.0/api-developers-guide/#getting-started-with-the-api) with your values.

```sh
curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Circle-Token: API_KEY' \
  -d '{ "parameters": { "action": report } }'
```

For more information on using API v2 endpoints, see the [API Reference Documentation]({{ site.baseurl }}/api/v2/) and the [API Developers Guide Worked Example]({{ site.baseurl }}/2.0/api-developers-guide/#example-end-to-end-api-request).

## Branch-filtering for Job Steps

Branch filtering has previously only been available for workflows, but with compile-time logic statements, you can also implement branch filtering for job steps. 

The following example shows using the [pipeline value]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values) `pipeline.git.branch` to control `when` a step should run. In this case the step `run: echo "I am on master"` only runs when the commit is on the master branch:

```yaml
version: 2.1

jobs:
  my-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

## Use Matrix Jobs to Run Multiple OS Tests

Using matrix jobs is a good way to run a job multiple times with different arguments, using parameters. There are many uses for this, including testing on multiple operating systems and against different language/library versions.

In the following example the `test` job is run across Linux, Windows and macOS environments, using two different versions of node. On each run of the `test` job different parameters are passed to set both the OS and the node version:

```yaml
version: 2.1

orbs:
  node: circleci/node@4.0.0
  win: circleci/windows@2.2.0 

executors:
  linux: # linux executor using the node base image
    docker:
      - image: cimg/node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  windows: win/default # windows executor - uses the default executor from the windows orb
  macos: # macos executor using xcode 11.6
    macos:
      xcode: 11.6

jobs:
  test:
    parameters:
      os:
        type: executor
      node-version:
        type: string
    executor: << parameters.os >>
    steps:
      - checkout
      - node/install:
          node-version: << parameters.node-version >>
          install-yarn: true
      - run: yarn test

workflows:
  all-tests:
    jobs:
      - test:
          matrix:
            parameters:
              os: [linux, windows, macos]
              node-version: ["13.13.0", "14.0.0"]
```

The expanded version of this matrix runs the following list of jobs under the `all-tests` workflow:

```
    - test-13.13.0-linux
    - test-14.0.0-linux
    - test-13.13.0-windows
    - test-14.0.0-windows
    - test-13.13.0-macos
    - test-14.0.0-macos
```

For full details of the matrix jobs specification, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#matrix-requires-version-21).
