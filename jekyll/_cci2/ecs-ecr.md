---
layout: classic-docs
title: Deploying to AWS ECR/ECS
description: How to use CircleCI to deploy to AWS ECS from ECR
---

This document describes how to use CircleCI to deploy to Amazon Elastic Container Service (ECS) from Amazon Elastic Container Registry (ECR).

* TOC
{:toc}

## Overview

This guide has two phases:

- Building and testing a Dockerized web application.
- Pushing the Docker image to ECR and using AWS Fargate to deploy to ECS.

The web application is written in Go and [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr).
You can also find the application [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

**Note:**
This project includes a simple [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile). See [Creating a Custom Image Manually]({{ site.baseurl }}/2.0/custom-images/#creating-a-custom-image-manually) for more information.

## Deploy to AWS ECS from ECR via CircleCI 2.0 using Orbs (Example Project)
The instructions below provide an example of how to use CircleCI orbs to conveniently build a Docker image on [CircleCI](https://circleci.com), push the Docker image to an Amazon Elastic Container Registry (ECR), and then deploy to Amazon Elastic Container Service (ECS) using AWS Fargate.

### Prerequisites

#### Set up required AWS resources
Builds of this project rely on AWS resources to be present in order to succeed. For convenience, the prerequisite AWS resources may be created using the terraform scripts procided in the `terraform_setup` directory.
1. Ensure [terraform](https://www.terraform.io/) is installed on your system.
2. Edit `terraform_setup/terraform.tfvars` to fill in the necessary variable values (an Amazon account with sufficient privileges to create resources like an IAM account, VPC, EC2 instances, Elastic Load Balancer, etc is required). (It is not advisable to commit this file to a public repository after it has been populated with your AWS credentials)
3. Use terraform to create the AWS resources
    ```
    cd terraform_setup
    terraform init
    # Review the plan
    terraform plan
    # Apply the plan to create the AWS resources
    terraform apply
    ```
4. You can run `terraform destroy` to destroy most of the created AWS resources but in case of lingering undeleted resources, it is recommended to check the [AWS Management Console](https://console.aws.amazon.com/) to see if there are any remaining undeleted resources to avoid unwanted costs. In particular, please check the ECS, CloudFormation and VPC pages.

#### Configure environment variables on CircleCI
The following [environment variables](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project) must be set for the project on CircleCI via the project settings page, before the project can be built successfully.

| Variable                       | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`            | Used by the AWS CLI                                       |
| `AWS_SECRET_ACCESS_KEY `       | Used by the AWS CLI                                       |
| `AWS_DEFAULT_REGION`           | Used by the AWS CLI. Example value: "us-east-1" (Please make sure the specified region is supported by the Fargate launch type)                          |
| `AWS_ACCOUNT_ID`               | AWS account id. This information is required for deployment.|
| `AWS_RESOURCE_NAME_PREFIX`     | Prefix that some of the required AWS resources are assumed to have in their names. The value should correspond to the `aws_resource_prefix` variable value in `terraform_setup/terraform.tfvars`.|

#### References
- https://github.com/CircleCI-Public/aws-ecs-orb
- https://github.com/awslabs/aws-cloudformation-templates
- https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_GetStarted.html

## Configuration Walkthrough

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

### Specify a Version

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key. This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

### Create a Build Job

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs). For this sample application,
there are two jobs: one for building and testing the application, and one for deploying the application. These jobs are called `build` and `deploy`, respectively.

In the `build` job, use the `docker` [executor]({{ site.baseurl }}/2.0/executor-types/) and specify the `circleci/golang:1.8` [convenience image]({{ site.baseurl }}/2.0/circleci-images/).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/golang:1.8
```

#### Build the Application

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step to check out source code. Because [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) is unspecified, the application is checked out to `~/project`.

Use the [`setup_remote_docker`]({{ site.baseurl }}/2.0/configuration-reference/#setup_remote_docker) step to create a remote Docker environment. This is required to build the Docker image for deployment.

Compile the Go source code and pack the results into an archive called `demo-app`.

```yaml
version: 2
jobs:
  build:
    # ...
  steps:
    - checkout
    - setup_remote_docker
    - run:
        name: Create executable
        command: go build -o demo-app src/main.go  # 'demo-app' is used in the Dockerfile
```

#### Set Environment Variables

For convenience, set two environment variables:

- the name of your ECR repository
- the full name of the Docker image

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - run:
          name: Set convenience environment variables
          command: |
            echo 'export ECR_REPOSITORY_NAME="${AWS_RESOURCE_NAME_PREFIX}"' >> $BASH_ENV
            echo 'export FULL_IMAGE_NAME="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:${CIRCLE_SHA1}"' >> $BASH_ENV
```

**Note:**
When setting environment variables, CircleCI does not support interpolation. Instead, [use `BASH_ENV` to set environment variables]({{ site.baseurl }}/2.0/env-vars/#using-bash_env-to-set-environment-variables).

#### Build, Test, and Archive Image

Add three steps to set up the Docker image:

- [Build the Docker image](https://docs.docker.com/engine/reference/commandline/build/) from the Dockerfile.
- Test the Docker image by [publishing its port to the host](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose).
- [Archive the image](https://docs.docker.com/engine/reference/commandline/save/).

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - run:
          name: Build image
          command: docker build -t $FULL_IMAGE_NAME .
      - run:
          name: Test image
          command: |
            docker run -d -p 8080:8080 --name built-image $FULL_IMAGE_NAME
            sleep 10
            docker run --network container:built-image appropriate/curl --retry
      - run:
          name: Save image to an archive
          command: |
            mkdir docker-image
            docker save -o docker-image/image.tar $FULL_IMAGE_NAME
```

#### Save Image for the Deploy Phase

Use [`persist_to_workspace`]({{ site.baseurl }}/2.0/configuration-reference/#persist_to_workspace) to save the image for use in the [`deploy` job](#create-a-deploy-job).

```yaml
version: 2
jobs:
  build:
    # ...
    steps:
      # ...
      - persist_to_workspace:
          root: .
          paths:
            - docker-image
```

### Create a Deploy Job

Create a separate job to deploy the image you created in the `build` job. For convenience, create an environment variable
to set the default format of AWS output.

```yaml
version: 2
jobs:
  build:
    # ...
  deploy:
    docker:
      - image: circleci/python:3.6.1
    environment:
      AWS_DEFAULT_OUTPUT: json
```

#### Add Setup Steps and Attach Workspace

[As in the `build` job](#build-the-application), add the `checkout` and `setup_remote_docker` steps.

Use [`attach_workspace`]({{ site.baseurl }}/2.0/configuration-reference/#attach_workspace) to attach the [workspace from the `build` job](#save-image-for-the-deploy-phase) to this container.

```yaml
version: 2
jobs:
  build:
    # ...
  deploy:
    # ...
    steps:
      - checkout
      - setup_remote_docker
      - attach_workspace:
          at: workspace
```

#### Install the AWS CLI

Install the AWS CLI. In this project, the AWS CLI is specified in [`requirements.txt`](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/requirements.txt).

```yaml
version: 2
jobs:
  # ...
  deploy:
    # ...
    steps:
      # ...
      - run:
          name: Install the AWS CLI
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
```

#### Set Up Caching Steps

Use [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) and [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) to cache the installation of the AWS CLI.

{% raw %}

```yaml
version: 2
jobs:
  # ...
  deploy:
    # ...
    steps:
      # ...
      - restore_cache:
          key: v1-{{ checksum "requirements.txt" }}
      - run:
          name: Install the AWS CLI
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache:
          key: v1-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```

{% endraw %}

See the [Caching Dependencies document]({{ site.baseurl }}/2.0/caching/) for more information.

#### Load Docker Image and Set Environment Variables

[Load the Docker image](https://docs.docker.com/engine/reference/commandline/load/) from the workspace, then set the following environment variables for convenience:

- the name of the ECR repository
- the name of the ECS cluster
- the name of the ECS service

```yaml
version: 2
jobs:
  # ...
  deploy:
    # ...
    steps:
      # ...
      - run:
          name: Load image
          command: |
            docker load --input workspace/docker-image/image.tar
      - run:
          name: Setup common environment variables
          command: |
            echo 'export ECR_REPOSITORY_NAME="${AWS_RESOURCE_NAME_PREFIX}"' >> $BASH_ENV
            echo 'export ECS_CLUSTER_NAME="${AWS_RESOURCE_NAME_PREFIX}-cluster"' >> $BASH_ENV
            echo 'export ECS_SERVICE_NAME="${AWS_RESOURCE_NAME_PREFIX}-service"' >> $BASH_ENV
```

**Note:**
Recall that you must [use `BASH_ENV`](#set-environment-variables) to set interpolated environment variables.

#### Deploy Service Updates To ECS

CircleCI and its partners have developed several orbs that enable you to quickly and easily deploy service updates to an existing ECS service. To update an ECS service, use the orb shown below.

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

You may also use the AWS CLI and a CircleCI orb to update the service using the orb example shown below.

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

#### Verify Successful Deployment of Service Update to ECS

Once you have deployed the service update to the ECS service, you should verify that the update was successful. The orb shown below enables you to cerify that your update was made to the ECS revision.

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

### Set Up a Workflow

Use workflows to link the `build` and `deploy` jobs.

```yaml
version: 2
jobs:
  # ...
workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```

See the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows/) for more information.

## Full Configuration File

{% raw %}

```yaml
version: 2
jobs:
  build:  
    docker:
      - image: circleci/golang:1.8
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Make the executable
          command: |
            go build -o demo-app src/main.go
      - run:
          name: Setup common environment variables
          command: |
            echo 'export ECR_REPOSITORY_NAME="${AWS_RESOURCE_NAME_PREFIX}"' >> $BASH_ENV
            echo 'export FULL_IMAGE_NAME="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:${CIRCLE_SHA1}"' >> $BASH_ENV
      - run:
          name: Build image
          command: |
            docker build -t $FULL_IMAGE_NAME .
      - run:
          name: Test image
          command: |
            docker run -d -p 8080:8080 --name built-image $FULL_IMAGE_NAME
            sleep 10
            docker run --network container:built-image appropriate/curl --retry 10 --retry-connrefused http://localhost:8080 | grep "Hello World!"
      - run:
          name: Save image to an archive
          command: |
            mkdir docker-image
            docker save -o docker-image/image.tar $FULL_IMAGE_NAME
      - persist_to_workspace:
          root: .
          paths:
            - docker-image
  deploy:  
    docker:
      - image: circleci/python:3.6.1
    environment:
      AWS_DEFAULT_OUTPUT: json
    steps:
      - checkout
      - setup_remote_docker
      - attach_workspace:
          at: workspace
      - restore_cache:
          key: v1-{{ checksum "requirements.txt" }}
      - run:
          name: Install awscli
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache:
          key: v1-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
      - run:
          name: Load image
          command: |
            docker load --input workspace/docker-image/image.tar
      - run:
          name: Setup common environment variables
          command: |
            echo 'export ECR_REPOSITORY_NAME="${AWS_RESOURCE_NAME_PREFIX}"' >> $BASH_ENV
            echo 'export ECS_CLUSTER_NAME="${AWS_RESOURCE_NAME_PREFIX}-cluster"' >> $BASH_ENV
            echo 'export ECS_SERVICE_NAME="${AWS_RESOURCE_NAME_PREFIX}-service"' >> $BASH_ENV
      - run:
          name: Push image
          command: |
            . venv/bin/activate
            eval $(aws ecr get-login --region $AWS_DEFAULT_REGION --no-include-email)
            docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:$CIRCLE_SHA1
      - run:
          name: Deploy
          command: |
            . venv/bin/activate
            export ECS_TASK_FAMILY_NAME="${AWS_RESOURCE_NAME_PREFIX}-service"
            export ECS_CONTAINER_DEFINITION_NAME="${AWS_RESOURCE_NAME_PREFIX}-service"
            export EXECUTION_ROLE_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:role/${AWS_RESOURCE_NAME_PREFIX}-ecs-execution-role"
            ./deploy.sh
      - run:
          name: Test deployment (Please manually tear down AWS resources after use, if desired)
          command: |
            . venv/bin/activate
            TARGET_GROUP_ARN=$(aws ecs describe-services --cluster $ECS_CLUSTER_NAME --services $ECS_SERVICE_NAME | jq -r '.services[0].loadBalancers[0].targetGroupArn')
            ELB_ARN=$(aws elbv2 describe-target-groups --target-group-arns $TARGET_GROUP_ARN | jq -r '.TargetGroups[0].LoadBalancerArns[0]')
            ELB_DNS_NAME=$(aws elbv2 describe-load-balancers --load-balancer-arns $ELB_ARN | jq -r '.LoadBalancers[0].DNSName')
            curl http://$ELB_DNS_NAME | grep "Hello World!"
workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```

{% endraw %}
