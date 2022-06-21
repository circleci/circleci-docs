---
layout: classic-docs
title: "CircleCI Configuration Cookbook"
short-title: "Configuration Cookbook"
description: "Starting point for Configuration Cookbook"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
- Server v2.x
---

The *CircleCI Configuration Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various configuration tasks using CircleCI resources including orbs. This guide, and its associated sections, will enable you to quickly perform repeatable tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction
{: #introduction }

This page, and its associated recipes, describes how you can perform specific configuration tasks. Recipes include code snippets and examples for you to customize to fit your projects. Each recipe in this cookbook relates to a single task that you can perform on the CircleCI platform using your own resources in addition to CircleCI resources such as CircleCI orbs.

### What are CircleCI orbs?
{: #what-are-circleci-orbs }
{:.no_toc}

CircleCI orbs are configuration packages that enable you to get started with the CircleCI platform. Orbs enable you to share, standardize, and simplify configurations across your projects. You may also want to use orbs as a reference for configuration best practices.

Refer to the [CircleCI Orbs Registry](https://circleci.com/developer/orbs) for the complete list of available orbs.

To use an existing orb in your 2.1 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) file, invoke it with the `orbs` key. The following example invokes the [`node` orb](https://circleci.com/developer/orbs/orb/circleci/node) in the `circleci` namespace.

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #orb version

workflows:
  test_my_app:
    jobs:
      - node/test:
          version: <node-version>
```

For more detailed information about CircleCI orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

## Configure your environment for CircleCi pipelines and orbs
{: #configure-your-environment-for-circleci-pipelines-and-orbs }
{:.no_toc}

Most recipes in this cookbook call for version 2.1 configuration, pipelines and often, orbs. Before using the examples provided, you should check that you are set up for these features. The following notes and steps will get you where you need to be.

* In order to use pipelines features and orbs you must use `version 2.1` config.
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using CircleCI server v2.x, these recipes are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/developer/orbs) to see how the individual jobs and commands are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).
* Any items that appear within `< >` should be replaced with your own parameters.

## Deploy changes to Amazon ECS
{: #deploy-changes-to-amazon-ecs }

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. This recipe shows you how to quickly deploy software changes to Amazon ECS using CircleCI orbs, but if you would like more detailed information about the how Amazon ECS service works, and its underlying components and architecture, please refer to the [Amazon ECS]( https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### Setting environment variables
{: #setting-environment-variables }
The following environment variables need to be set in CircleCI either directly or through a context:

* `AWS_ECR_ACCOUNT_URL`
* `MY_APP_PREFIX`
* `AWS_REGION`
* `AWS_ACCESS_KEY_ID`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables]({{site.baseurl}}/2.0/env-vars/) page in the CircleCI documentation.

**Note:** the `CIRCLE_SHA1` variable used in this example is built-in, so it is always available.

### Build, push and deploy a service update
{: #build-push-and-deploy-a-service-update }

To configure an [AWS service update](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html) to deploy a newly built image from AWS ECR, you can use orbs to keep your configuration as simple as possible: the `aws-ecr` orb to build and push an updated image to ECR, and the `aws-ecs` orb to deploy you service update.

The following example shows building and pushing an image to AWS ECR and pushing that image as a service update to AWS ECS:

```yaml
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

### Verify the AWS ECS service update
{: #verify-the-aws-ecs-service-update }

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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the [task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) that was previously deployed, and then _verify_ the revision has been deployed using the `verify-revision-is-deployed` command from the `AWS-ECS` orb. Refer to the [AWS ECR]({{site.baseurl}}/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to configure and push an image to Amazon ECS.

Find more detailed information in the CircleCI Orb Registry for the CircleCI [AWS ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs) and [AWS ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr) orbs.

## Interact with Google Kubernetes Engine (GKE)
{: #interact-with-google-kubernetes-engine-gke }

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly deploy code and application updates to your customers without requiring significant time to deliver these updates. Using GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Set environment variables
{: #set-environment-variables }
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (required)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables]({{site.baseurl}}/2.0/env-vars/) page in the CircleCI documentation.

### Creating and deleting clusters
{: #creating-and-deleting-clusters }
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

### Publishing and rolling out the image to the GKE cluster
{: #publishing-and-rolling-out-the-image-to-the-gke-cluster }

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
{: #using-amazon-elastic-container-service-for-kubernetes-amazon-eks }

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Kubernetes Service (EKS) to perform the following tasks:

* Create an EKS cluster
* Create a Kubernetes deployment
* Install Helm charts
* Update a container image

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

### Create an EKS Cluster
{: #create-an-eks-cluster }

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

### Create a Kubernetes deployment
{: #create-a-kubernetes-deployment }

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

### Install a Helm chart in your cluster
{: #install-a-helm-chart-in-your-cluster }

Helm is a powerful application package manager that runs on top of a Kubernetes cluster and allows you to describe the application structure by using helm-charts and manage the structure using simple commands. Helm uses a packaging format called charts, which are collections of files that describe a related set of Kubernetes resources. A single chart might be used to deploy something simple, like a memcached pod, or something complex, like a full web app stack with HTTP servers, databases, caches, and so on.

Using the `aws-eks` orb you can install Helm on your Kubernetes cluster, then install a Helm chart just using the orb's built-in jobs. Below is a code example for this, which also cleans up by deleting the release and cluster at the end of the process:

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

## Enabling custom Slack notifications in CircleCI jobs
{: #enabling-custom-slack-notifications-in-circleci-jobs }

Slack is a real-time collaboration application where team members can work together to perform routine tasks and projects through custom channels and workspaces. When using the CircleCI platform, you may find it useful to enable custom notifications with the Slack app based on specific team needs and requirements.

### Notifying a Slack channel of pending approval
{: #notifying-a-slack-channel-of-pending-approval }

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

### Notifying a Slack channel with custom messages
{: #notifying-a-slack-channel-with-custom-messages }

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

### Sending a status alert at the end of a job based on success or failure
{: #sending-a-status-alert-at-the-end-of-a-job-based-on-success-or-failure }

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

## Selecting a workflow to run using pipeline parameters
{: #selecting-a-workflow-to-run-using-pipeline-parameters }

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

```shell
curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Circle-Token: API_KEY' \
  -d '{ "parameters": { "action": report } }'
```

For more information on using API v2 endpoints, see the [API Reference Documentation]({{ site.baseurl }}/api/v2/) and the [API Developers Guide Worked Example]({{ site.baseurl }}/2.0/api-developers-guide/#example-end-to-end-api-request).

## Branch-filtering for job steps
{: #branch-filtering-for-job-steps }

Branch filtering has previously only been available for workflows, but with compile-time logic statements, you can also implement branch filtering for job steps.

The following example shows using the [pipeline value]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values) `pipeline.git.branch` to control `when` a step should run. In this case the step `run: echo "I am on main"` only runs when the commit is on the main branch:

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
            equal: [ main, << pipeline.git.branch >> ]
          steps:
            - run: echo "I am on main"

workflows:
  my-workflow:
    jobs:
      - my-job
```

## Dynamic Configuration
{: #dynamic-configuration }

This section assumes you have already read the [dynamic configuration]({{ site.baseurl }}/2.0/dynamic-config) section and
have followed the steps outlined in the [Getting started]({{ site.baseurl }}/2.0/dynamic-config#getting-started-with-dynamic-config-in-circleci) guide.

The following examples of dynamic configuration usage are provided below:

- [A basic example]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
- [Execute specific `workflows` or `steps` based on which files are modified]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)

### A basic example
{: #a-basic-example }

The following is a basic example using CircleCI's dynamic configuration feature. In this example, we assume that a
`generate-config` script already exists. The script outputs a new configuration YAML based on some type
of work it performs. It could potentially inspect `git` history, pipeline values that get passed to it, or anything
else you might do from inside a [`job`]({{ site.baseurl }}/2.0/configuration-reference/#jobs).

```yaml
version: 2.1

# this allows you to use CircleCI's dynamic configuration feature
setup: true

# the continuation orb is required in order to use dynamic configuration
orbs:
  continuation: circleci/continuation@0.1.2

# our defined job, and its steps
jobs:
  setup:
    executor: continuation/default
    steps:
      - checkout # checkout code
      - run: # run a command
          name: Generate config
          command: |
            ./generate-config > generated_config.yml
      - continuation/continue:
          configuration_path: generated_config.yml # use newly generated config to continue

# our single workflow, that triggers the setup job defined above
workflows:
  setup:
    jobs:
      - setup
```

In the above configuration, we:

- Add the line `setup: true` to the top-level of our config, to designate it for use of CircleCI's dynamic configuration feature
- Invoke the `continuation` orb so we can use it.
- Define a job called `setup` that uses the `continuation` orb as an [`executor`]({{ site.baseurl }}/2.0/executor-intro/). This job:
    - Calls the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step to checkout code from the configured repository.
    - Calls the [`run`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step to execute the existing `generate-config` script, so we can pass its output to the `continue` job of the `continuation` orb.
    - Continues running the pipeline based on what configuration is provided to the required `configuration_path`.
- Lastly, we call the `setup` job defined above as a part of our `workflow`

**Note:** You can only use one workflow per `config.yml` when using CircleCI's dynamic configuration feature
You can only run a single workflow as part of the pipeline's setup stage. This setup-workflow has access to a one-time-use token to create more workflows. The setup process does not cascade, so subsequent workflows in the pipeline cannot launch their own continuations.

For a more in-depth explanation of what the `continuation` orb does, review the orb's source code in the
[CircleCI Developer Hub](https://circleci.com/developer/orbs/orb/circleci/continuation?version=0.1.2) or review the
[Dynamic configuration FAQ]({{ site.baseurl }}/2.0/dynamic-config#dynamic-config-faqs).

### Execute specific `workflows` or `steps` based on which files are modified
{: #execute-specific-workflows-or-steps-based-on-which-files-are-modified }

You may find that you would like to conditionally run a `workflow` or `step` based upon changes made to a specific fileset.
This would be beneficial in the case of your code/microservices being stored in a monorepo, or a single repository.

To achieve this, CircleCI has provided the [`path-filtering`](https://circleci.com/developer/orbs/orb/circleci/path-filtering)
orb, which allows a pipeline to continue execution based upon the specific paths of updated files.

For example, consider a monorepo structure like the example shown below:

```shell
.
├── .circleci
│   ├── config.yml
│   └── continue_config.yml
├── service1
│   ├── Service1.java
├── service2
│   ├── Service2.java
├── tests
│   ├── IntegrationTests.java
```

An example implementation of CircleCI's dynamic configuration for the above use case can be found in the following `config.yml` and `continue_config.yml`:

#### config.yml
{: #configyml }

```yaml
version: 2.1

# this allows you to use CircleCI's dynamic configuration feature
setup: true

# the path-filtering orb is required to continue a pipeline based on
# the path of an updated fileset
orbs:
  path-filtering: circleci/path-filtering@0.1.1

workflows:
  # the always-run workflow is always triggered, regardless of the pipeline parameters.
  always-run:
    jobs:
      # the path-filtering/filter job determines which pipeline
      # parameters to update.
      - path-filtering/filter:
          name: check-updated-files
          # 3-column, whitespace-delimited mapping. One mapping per
          # line:
          # <regex path-to-test> <parameter-to-set> <value-of-pipeline-parameter>
          mapping: |
            service1/.* run-build-service-1-job true
            service2/.* run-build-service-2-job true
          base-revision: main
          # this is the path of the configuration we should trigger once
          # path filtering and pipeline parameter value updates are
          # complete. In this case, we are using the parent dynamic
          # configuration itself.
          config-path: .circleci/continue_config.yml
```

#### continue_config.yml
{: #continueconfigyml }

```yaml
version: 2.1

orbs:
  maven: circleci/maven@1.2.0

# the default pipeline parameters, which will be updated according to
# the results of the path-filtering orb
parameters:
  run-build-service-1-job:
    type: boolean
    default: false
  run-build-service-2-job:
    type: boolean
    default: false

# here we specify our workflows, most of which are conditionally
# executed based upon pipeline parameter values. Each workflow calls a
# specific job defined above, in the jobs section.
workflows:
  # when pipeline parameter, run-build-service-1-job is true, the
  # build-service-1 job is triggered.
  service-1:
    when: << pipeline.parameters.run-build-service-1-job >>
    jobs:
      - maven/test:
          name: build-service-1
          command: 'install -DskipTests'
          app_src_directory: 'service1'
  # when pipeline parameter, run-build-service-2-job is true, the
  # build-service-2 job is triggered.
  service-2:
    when: << pipeline.parameters.run-build-service-2-job >>
    jobs:
      - maven/test:
          name: build-service-2
          command: 'install -DskipTests'
          app_src_directory: 'service2'
  # when pipeline parameter, run-build-service-1-job OR
  # run-build-service-2-job is true, run-integration-tests job is
  # triggered. see:
  # https://circleci.com/docs/2.0/configuration-reference/#logic-statements
  # for more information.
  run-integration-tests:
    when:
      or: [<< pipeline.parameters.run-build-service-1-job >>, << pipeline.parameters.run-build-service-2-job >>]
    jobs:
      - maven/test:
          name: run-integration-tests
          command: '-X verify'
          app_src_directory: 'tests'
```

In the above configuration, we:

- Add the line `setup: true` to the top-level of our config, to designate it for use of CircleCI's dynamic configuration feature.
- Invoke the `path-filtering` and `maven` orbs so we can use them.
- Define two boolean pipeline parameters, `run-build-service-1-job` and `run-build-service-2-job`
- Define four jobs: `check-updated-files`, `build-service-1`, `build-service-2`, and `run-integration-tests`:
  - The `check-updated-files` job will use the `path-filtering` orb to determine which files have changed, according to
    the file-path provided. It will also set the designated pipeline parameters to their specified values (in this case, different maven commands will be triggered based on which files changed).
  - The `build-service-1` job uses the `maven` orb to compile/install the service1 code, but skips any tests
  - The `build-service-2` job uses the `maven` orb to compile/install the service2 code, but skips any tests
  - The `run-integration-tests` job uses the `maven` orb to run any integration tests
- Define four workflows, three of which are conditionally executed:
  - The `service-1` workflow triggers the `build-service-1` job when the pipeline parameter value mapped to run-build-service-1-job is set to `true`
  - The `service-2` workflow triggers the `build-service-2` job when the pipeline parameter value mapped to run-build-service-2-job is set to `true`
  - The `run-integration-tests` workflow will run if the `run-build-service-1-job` or `run-build-service-2-job` pipeline parameters have been updated to `true` based on the results of the `path-filtering` orb
  - The `check-updated-files` workflow will always run any time this pipeline is triggered

See the `path-filtering` [orb documentation](https://circleci.com/developer/orbs/orb/circleci/path-filtering) for more
information on available elements and required parameters.

## Use matrix jobs to run multiple OS tests
{: #use-matrix-jobs-to-run-multiple-os-tests }

Using matrix jobs is a good way to run a job multiple times with different arguments, using parameters. There are many uses for this, including testing on multiple operating systems and against different language/library versions.

In the following example the `test` job is run across a Linux container, Linux VM, and macOS environments, using two different versions of Node.js. On each run of the `test` job different parameters are passed to set both the OS and the Node.js version:

```yaml
version: 2.1

orbs:
  node: circleci/node@4.7

executors:
  docker: # Docker using the Base Convenience Image
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  linux: # a Linux VM running Ubuntu 20.04
    machine:
      image: ubuntu-2004:202107-02
  macos: # macos executor running Xcode
    macos:
      xcode: 12.5.1

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

workflows:
  all-tests:
    jobs:
      - test:
          matrix:
            parameters:
              os: [docker, linux, macos]
              node-version: ["14.17.6", "16.9.0"]
```

The expanded version of this matrix runs the following list of jobs under the `all-tests` workflow:

```
    - test-14.17.6-docker
    - test-16.9.0-docker
    - test-14.17.6-linux
    - test-16.9.0-linux
    - test-14.17.6-macos
    - test-16.9.0-macos
```

For full details of the matrix jobs specification, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#matrix-requires-version-21).
