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
[Deploying Software Changes to Amazon Elastic Container Service (ECS)](#header1) | This section describes how you can deploy changes to the Amazon Elastic Container Service (ECS) using a CircleCI-certified ECS orb.
[Deploying Software Changes to Google Kubernetes Engine (GKE)](#header2) | This section describes how you can deploy changes to the Google Kubernetes Engine (GKE) using a CircleCI-certified GKE orb.
[Using Amazon Elastic Container Service for Kubernetes (Amazon EKS)](#header3) | This section describes how you can use the Amazon ECS service for Kubernetes for Kubernetes-related tasks and operations.
[Deploying Applications to Heroku](#header4) | This section describes how you can deploy application to the Heroku platform using the CircleCI Heroku orb.
[Enabling Custom Slack Notifications in CircleCI Jobs](#header5) | This section describes how you can enable customized Slack notifications in CircleCI jobs.

## Deploying Software Changes to Amazon ECS {#header1}

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

Notice in this example that you need to instantiate two different AWS ECS orbs: `aws-ecs 0.0.3` and `aws-ecs 0.0.4` to update the ECS service. Once you have instantiated these two orbs, the orb enables the configuration, and then pushes the image, before finally deploying the service update to ECS.

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

## Deploying Software Changes to Google Kubernetes Engine (GKE) {#header2}

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

## Using Amazon Elastic Container Service for Kubernetes (Amazon EKS) {#header3}

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Container Service (ECS) to perform the following tasks:

* Create an EKS cluster
* Create a Kubernetes deployment
* Install Helm charts
* Update a container image

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/orbs/registry/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

### Prerequisites

Before using the Amazon EKS service, make sure you meet the following requirements:

* Your environment is configured to use the CircleCI platform and Orbs.
* You have installed the `eksctl` tool.
* You have installed `AWS-CLI` and `AWS-IAM Authenticator for Kubernetes`.

#### Configuring Your Environment to Use the CircleCI Platform and Orbs

To configure your environment to use CircleCI and orbs, perform the following steps:

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

2) {% include snippets/enable-pipelines.md %}

Add the orbs stanza below your version, invoking the orb:

`orbs: aws-eks: circleci/aws-eks@0.2.1`

3) Use `aws-eks` elements in your existing workflows and jobs.

#### Installing the Amazon `eksctl` tool

If the Amazon `eksctl` tool is not already installed, install `eksctl` so you can use these tools to manage a cluster on EKS - Amazon's managed Kubernetes service for EC2.

The code sample shown below illustrates how you can install the 'eksctl' tool in your environment using the CircleCI orb.

```yaml
version: 2.1
description:
Requirements: curl, amd64 architecture
steps:
  - run:
      command: >
        if which eksctl > /dev/null; then
          echo "eksctl is already installed"
          exit 0
        fi

        mkdir -p eksctl_download

        curl --silent --location --retry 5
        "https://github.com/weaveworks/eksctl/releases/download/latest_release/eksctl_$(uname
        -s)_amd64.tar.gz" \
          | tar xz -C eksctl_download
        chmod +x eksctl_download/eksctl

        SUDO=""

        if [ $(id -u) -ne 0 ] && which sudo > /dev/null ; then
          SUDO="sudo"
        fi

        $SUDO mv eksctl_download/eksctl /usr/local/bin/

        rmdir eksctl_download
      name: Install the eksctl tool
```

#### Install AWS-CLI and AWS-IAM for Kubernetes

CircleCI enables you to use the `AWS-CLI` and `AWS-IAM` authentication tool to run command-line tools in an AWS cluster. Where `AWS-CLI` allows you to run these command-line tools, `AWS-IAM` provides you with the capability to authenticate an existing Kubernetes cluster. By using the AWS IAM Authenticator for Kubernetes, you will not have to manage a separate credential for the Kubernetes access. If you would like more detailed information about how to install and use these tools, refer to the [AWS-IAM GitHub](https://github.com/kubernetes-sigs/aws-iam-authenticator) page.

To install the AWS IAM Authenticator for Kubernetes, see the code sample shown below.

```yaml
version: 2.1
Requirements: curl, amd64 architecture
parameters:
  release-tag:
    default: ''
    description: >
      Use this to specify a tag to select which published release of the AWS IAM Authenticator, as listed on 
      https://github.com/kubernetes-sigs/aws-iam-authenticator/releases, to install. If no value is specified, the latest
      release will be installed.

      Note: Release versions earlier than v0.3.0 cannot be specified. Also, pre or alpha releases cannot be specified.
    type: string
steps:
  - run:
      command: >
        if which aws-iam-authenticator > /dev/null; then
          echo "AWS IAM Authenticator for Kubernetes is already installed"
          exit 0
        fi
        PLATFORM="linux"
        if [ -n "$(uname | grep "Darwin")" ]; then
          PLATFORM="darwin"
        fi
        RELEASE_TAG="<< parameters.release-tag >>
        RELEASE_URL="https://api.github.com/repos/kubernetes-sigs/aws-iam-authenticator/releases/latest"
        if [ -n "${RELEASE_TAG}" ]; then
          RELEASE_URL="https://api.github.com/repos/kubernetes-sigs/aws-iam-authenticator/releases/tags/${RELEASE_TAG}"
        fi
        DOWNLOAD_URL=$(curl -s --retry 5 "${RELEASE_URL}" \
            | grep "${PLATFORM}" | awk '/browser_download_url/ {print $2}' | sed 's/"//g')
        curl -L -o aws-iam-authenticator "$DOWNLOAD_URL"
        chmod +x ./aws-iam-authenticator
        SUDO=""
        if [ $(id -u) -ne 0 ] && which sudo > /dev/null ; then
          SUDO="sudo"
        fi
        $SUDO mv ./aws-iam-authenticator /usr/local/bin/aws-iam-authenticator
      name: Install the AWS IAM Authenticator for Kubernetes
```

**Note:** Make sure curl in enabled, and you are using the amd64 architecture.

### Create an EKS Cluster

Once you meet the requirements for using the CircleCI AWS-EKS orb, you may create an EKS cluster using the code sample shown below.

```yaml
version: 2.1
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
orbs:
aws-eks: circleci/aws-eks@0.1.0
kubernetes: circleci/kubernetes@0.3.0
version: 2.1
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

In this example, when you use the CircleCI AWS-EKS orb, you can install Kubernetes, update the Kubernetes configuration with the authenticator, and then retrieve Kubernetes services in one single job.

### Create a Kubernetes Deployment

After creating a Kubernetes cluster, you may wish to create a Kubernetes deployment, which enables you to manage the cluster and perform different actions within the cluster, including the ability to:

* update resources within the cluster
* update the Kubernetes configuration with the authenticator
* update the container image

The code example below illustrates how you can create the Kubernetes deployment.

```yaml
version: 2.1
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
orbs:
  aws-eks: circleci/aws-eks@0.1.0
  kubernetes: circleci/kubernetes@0.3.0
version: 2.1
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

### Install Helm On Your Cluster

To simplify the Helm installation on your cluster,

```yaml
version: 2.1
description: |
  Installs helm onto the EKS cluster.
  Note: Parameters like tiller-tls need to be set to
  apply security configurations to the tiller configuration.
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      The AWS profile to be used. If not specified, the configured default
      profile for your AWS CLI installation will be used.
    type: string
  aws-region:
    default: ''
    description: |
      AWS region that the EKS cluster is in.
    type: string
  cluster-name:
    description: |
      The name of the EKS cluster.
    type: string
  enable-cluster-wide-admin-access:
    default: false
    description: |
      Allow tiller to have admin access to the entire EKS cluster
      by creating a role binding with a cluster-admin role
      and a service account with name as specified by the service-account
      parameter or defaulting to "tiller".
      Note: This is a convenience option but is typically not advisable
      in a production cluster for security reasons.
    type: boolean
  executor:
    default: python3
    description: |
      Executor to use for this job.
    type: executor
  service-account:
    default: ''
    description: |
      Name of service account to Tiller to use.
      Note: A role binding which specifies a role
      and a service account with the specified name, must
      be created in advance, unless
      enable-cluster-wide-admin-access is set to true.
    type: string
  tiller-ca-cert:
    default: ''
    description: |
      The path to CA root certificate
    type: string
  tiller-namespace:
    default: ''
    description: |
      Specify the namespace of Tiller
    type: string
  tiller-tls:
    default: false
    description: |
      Install Tiller with TLS enabled
    type: boolean
  tiller-tls-cert:
    default: ''
    description: |
      The path to TLS certificate file to install with Tiller
    type: string
  tiller-tls-hostname:
    default: ''
    description: |
      The server name used to verify the hostname on the returned
      certificates from Tiller
    type: string
  tiller-tls-key:
    default: ''
    description: |
      The path to TLS key file to install with Tiller
    type: string
  tiller-tls-verify:
    default: false
    description: |
      Install Tiller with TLS enabled and to verify remote certificates
    type: boolean
  wait:
    default: true
    description: |
      Block until Tiller is running and ready to receive requests
    type: boolean
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - helm/install-helm-on-cluster:
      enable-cluster-wide-admin-access: << parameters.enable-cluster-wide-admin-access >>
      service-account: << parameters.service-account >>
      tiller-ca-cert: << parameters.tiller-ca-cert >>
      tiller-namespace: << parameters.tiller-namespace >>
      tiller-tls: << parameters.tiller-tls >>
      tiller-tls-cert: << parameters.tiller-tls-cert >>
      tiller-tls-hostname: << parameters.tiller-tls-hostname >>
      tiller-tls-key: << parameters.tiller-tls-key >>
      tiller-tls-verify: << parameters.tiller-tls-verify >>
      wait: << parameters.wait >>
```

#### Install a Helm Chart in Your Cluster

Helm is a powerful application package manager that runs on top of a Kubernetes cluster and allows you to describe the application structure by using helm-charts and manage the structure using simple commands. Helm uses a packaging format called charts, which is a collection of files that describe a related set of Kubernetes resources. A single chart might be used to deploy something simple, like a memcached pod, or something complex, like a full web app stack with HTTP servers, databases, caches, and so on.

Once Helm is installed in your Kubernetes cluster, you can then install Helm charts using the code example shown below.

```yaml
version: 2.1
description: |
  Installs a helm chart into the EKS cluster.
  Requirements: helm should be installed on the cluster.
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      The AWS profile to be used. If not specified, the configured default
      profile for your AWS CLI installation will be used.
    type: string
  aws-region:
    default: ''
    description: |
      AWS region that the EKS cluster is in.
    type: string
  chart:
    description: |
      Specify for installation a chart reference (e.g. stable/mariadb),
      or a path to a packaged chart (e.g. ./nginx-1.2.3.tgz),
      or a path to an unpacked chart directory (e.g. ./nginx)
      or an absolute URL (e.g. https://example.com/charts/nginx-1.2.3.tgz)
    type: string
  cluster-name:
    description: |
      The name of the EKS cluster.
    type: string
  executor:
    default: python3
    description: |
      Executor to use for this job.
    type: executor
  namespace:
    default: ''
    description: |
      The kubernetes namespace that should be used.
    type: string
  release-name:
    default: ''
    description: |
      Specify a name for the release.
    type: string
  tiller-namespace:
    default: ''
    description: |
      Specify the namespace of Tiller
    type: string
  tls:
    default: false
    description: |
      Enable TLS for the request
    type: boolean
  tls-ca-cert:
    default: ''
    description: |
      Path to TLS CA certificate file
    type: string
  tls-cert:
    default: ''
    description: |
      Path to TLS certificate file
    type: string
  tls-hostname:
    default: ''
    description: |
      The server name used to verify the hostname on the returned
      certificates from the server
    type: string
  tls-key:
    default: ''
    description: |
      Path to TLS key file
    type: string
  tls-verify:
    default: false
    description: |
      Enable TLS for request and verify remote
    type: boolean
  values-to-override:
    default: ''
    description: |
      Override values in a chart using the --set flag of the helm install
      command. Format: key1=val1,key2=val2
    type: string
  wait:
    default: true
    description: |
      Whether to wait for the installation to be complete
    type: boolean
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - helm/install-helm-chart:
      chart: << parameters.chart >>
      namespace: << parameters.namespace >>
      release-name: << parameters.release-name >>
      tiller-namespace: << parameters.tiller-namespace >>
      tls: << parameters.tls >>
      tls-ca-cert: << parameters.tls-ca-cert >>
      tls-cert: << parameters.tls-cert >>
      tls-hostname: << parameters.tls-hostname >>
      tls-key: << parameters.tls-key >>
      tls-verify: << parameters.tls-verify >>
      values-to-override: << parameters.values-to-override >>
      wait: << parameters.wait >>
```

### Update a Container Image

Occasionally, you may find it necessary to update the container image of a resource in your Kubernetes cluster. The CircleCI AWS-EKS orb enables you to update this image quickly and easily by first updating the Kubernetes configuration with the IAM authenticator, and then updating the specific image in the Kubernetes configuration.

The code example below illustrates how this orb updates an existing container image in the Kubernetes cluster.

```yaml
version: 2.1
description: |
  Updates the container image(s) of a resource on EKS.
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      The AWS profile to be used. If not specified, the configured default
      profile for your AWS CLI installation will be used.
    type: string
  aws-region:
    default: ''
    description: |
      AWS region that the EKS cluster is in.
    type: string
  cluster-name:
    description: |
      The name of the EKS cluster.
    type: string
  container-image-updates:
    description: |
      Specify a list of container image updates
      (space-delimited name value pairs in the form
      CONTAINER_NAME_1=CONTAINER_IMAGE_1 ... CONTAINER_NAME_N=CONTAINER_IMAGE_N)
      to be applied to the resource via `kubectl set image`.
      e.g. "busybox=busybox nginx=nginx:1.9.1"
    type: string
  executor:
    default: python3
    description: |
      Executor to use for this job.
    type: executor
  get-rollout-status:
    default: false
    description: |
      Get the status of the rollout.
      This can only be used for resource types that are valid
      for usage with `kubectl rollout` subcommands.
    type: boolean
  namespace:
    default: ''
    description: |
      The kubernetes namespace that should be used.
    type: string
  pinned-revision-to-watch:
    default: ''
    description: |
      Pin a specific revision to be watched and abort watching if it is rolled
      over by another revision.
      Only effective if get-rollout-status is set to true.
    type: string
  record:
    default: false
    description: |
      Whether to record the update
    type: boolean
  resource-name:
    default: ''
    description: |
      Resource name in the format TYPE/NAME e.g. deployment/nginx-deployment
      Either resource-file-path or resource-name need to be specified.
      This is required if get-rollout-status is set to true.
    type: string
  show-kubectl-command:
    default: false
    description: |
      Whether to show the kubectl command used.
    type: boolean
  watch-rollout-status:
    default: true
    description: |
      Whether to watch the status of the latest rollout until it's done.
      Only effective if get-rollout-status is set to true.
    type: boolean
  watch-timeout:
    default: ''
    description: >
      The length of time to wait before ending the watch, zero means never.
      Any other values should contain a corresponding time unit (e.g. 1s, 2m,
      3h).
      Only effective if get-rollout-status is set to true.
    type: string
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - kubernetes/update-container-image:
      container-image-updates: << parameters.container-image-updates >>
      get-rollout-status: << parameters.get-rollout-status >>
      namespace: << parameters.namespace >>
      pinned-revision-to-watch: << parameters.pinned-revision-to-watch >>
      record: << parameters.record >>
      resource-name: << parameters.resource-name >>
      show-kubectl-command: << parameters.show-kubectl-command >>
      watch-rollout-status: << parameters.watch-rollout-status >>
      watch-timeout: << parameters.watch-timeout >>
```

## Deploying Applications to Heroku {#header4}

The Heroku platform is a cloud-based, fully-scalable platform that enables you to quickly and easily deliver and deploy applications. Using CircleCI builds and orbs, you can simplify the deployment process in a few simple steps by following the steps described in the sections below.

### Prerequisites

Before you can deploy an applications to the Heroku platform, make sure the following requirements are met:

* Your environment is configured to use the CircleCI platform and CircleCI orbs.
* You have installed the Heroku CLI.

#### Installing the Heroku CLI

If the Heroku CLI is not already installed, install the Heroku CLI so you can deploy your application to the Heroku platform. To install the Heroku CLI, run the following installation step:

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

Now that you have configured your environment to work with the CircleCI platform and orbs, and installed the Heroku CLI (if necessary), deploy your application to the Heroku platform using git. By using git, you can simplify the deployment process, ensuring that you can quickly and easily deploy applications to the Heroku platform by only performing a single step.

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@0.0.10
workflows:
  heroku_deploy:
    jobs:
      - heroku/deploy-via-git
```

Notice in the above example, when the CircleCI Heroku orb (`circleci/heroku@0.0.10`) is invoked, the `heroku-deploy` workflow is initiated, enabling the `deploy-via-git` job to run.

For more detailed information about the CircleCI Heroku orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/heroku).

## Enabling Custom Slack Notifications in CircleCI Jobs {#header5}

Slack is a real-time collaboration application where team members can work together to perform routine tasks and projects through custom channels and workspaces. When using the CircleCI platform, you may find it useful to enable custom notifications with the Slack app based on specific team needs and requirements.

### Prerequisites

Before enabling custom notifications in Slack while using the CircleCI platform, ensure your environment is properly configured and setup to leverage the CircleCI platform and orbs.

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
In the above example, note that you first need to invoke the `circleci/slack@1.0.0` orb before running your workflow, which then enables you to send your notification with its associated `message` and `webhook`.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).

### Notifying a Slack Channel With Custom Messages

Another type of notification you can create using the CircleCI Slack orb is a notification with a custom message created by you. This type of notification is useful when you want to deliver a detailed message to your recipients that is specific to a workflow, job, or project.

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

1. Specify the `color` of the text in the message.
2. Identify the recipients (`mentions`) of the message.
3. Provide the text in the `message` you want delivered.
4. Specify the `webhook` for the message – see this [guide](https://api.slack.com/incoming-webhooks) for more on creating Slack webhooks.

Once you have performed these steps, invoke the CircleCI Slack orb (`circleci/slack@1.0.0`) to initiate the workflow to deliver your notification.

### Sending a Status Alert at the End of a Job Based on Success or Failure

You may also send a status alert at the end of a job to your recipients. Note that this status alert must be the last step in a job.

The example below shows how you can send a status alert at the end of a job.

```yaml
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
