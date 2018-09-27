---
layout: classic-docs
title: Deploying to AWS ECR/ECS
description: How to deploy to AWS ECR/ECS with CircleCI
---

This document describes
how to use CircleCI
to deploy to Amazon Elastic Container Service (ECS) from Amazon Elastic Container Registry (ECR)

* TOC
{:toc}

## Overview

This guide has three phases:

- Building and testing a Dockerized web application.
- Pushing the Docker image to ECR.
- Using AWS Fargate to deploy to ECS.

The web application is written in Go
and [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr).
You can also find the application [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

## Prerequisites

### Create AWS Resources With Terraform

Several AWS resources are required
to build and deploy the application in this guide.
CircleCI provides [several Terraform scripts](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)
to create these resources.
To use these scripts,
follow the steps below.

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2. [Install Terraform](https://www.terraform.io/).
3. Clone the [sample project](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)
and go to its root directory.
4. Update `~/terraform_setup/terraform.tfvars` with real values for the AWS variables.
For more details,
see the [Configure CircleCI Environment Variables](#configure-circleci-environment-variables) section below.
5. Create the AWS resources
by running the following commands.

```bash
cd terraform_setup
terraform init
terraform plan  # review the plan
terraform apply  # apply the plan and create AWS resources
```

**Note:**
You can destroy most AWS resources
by running `terraform destroy`.
If any resources remain,
check the [AWS Management Console](https://console.aws.amazon.com/),
particularly the **ECS**, **CloudFormation** and **VPC** pages.

### Configure CircleCI Environment Variables

In the CircleCI application,
set the following [project environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project).

Variable                 | Description
-------------------------|------------
AWS_ACCESS_KEY_ID        | Security credentials for AWS.
AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.
AWS_DEFAULT_REGION       | Used by the AWS CLI.
AWS_ACCOUNT_ID           | Required for deployment. [Find your AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId).
AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. Should correspond to the value of `aws_resource_prefix` in `terraform_setup/terraform.tfvars`.
{:class="table table-striped"}

## Configuration Walkthrough

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/).
Follow the steps below to create a complete `config.yml` file.

### Specify a Version

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key.
This key is used
to issue warnings about breaking changes.

```yaml
version: 2
```

### Create a Build Job

A run is comprised of one or more [jobs]({{ site.baseurl }}/2.0/configuration-reference/#jobs).
For this sample application,
there are two jobs:
one for building and testing the application,
and one for deploying the application.
These jobs are called `build` and `job`, respectively.

In the `build` job,
use the `docker` [executor]({{ site.baseurl }}/2.0/executor-types/)
and specify the `circleci/golang:1.8` [convenience image]({{ site.baseurl }}/2.0/circleci-images/).

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/golang:1.8
```

### Build Application

Use the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) step
to check out source code.
Because [`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) is unspecified,
the application is checked out to `~/project`.

Use the [`setup_remote_docker`]({{ site.baseurl }}/2.0/configuration-reference/#setup_remote_docker) step
to create a remote Docker environment.
This is required
to build the Docker image for deployment.

Compile the Go source code
and pack the results into an archive called `demo-app`.

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
        command: |
          go build -o demo-app src/main.go  # 'demo-app' is used in the Dockerfile
```

### Set Environment Variables

For convenience,
set two environment variables:

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
When setting environment variables,
CircleCI does not support interpolation.
Instead, [use `BASH_ENV` to set environment variables]({{ site.baseurl }}/2.0/env-vars/#using-bash_env-to-set-environment-variables).

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
