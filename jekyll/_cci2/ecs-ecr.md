---
layout: classic-docs
title: Deploying to AWS ECR/ECS
description: How to deploy to AWS ECR/ECS with CircleCI
---

This document describes
how to deploy to Amazon Elastic Container Service (ECS) from Amazon Elastic Container Registry (ECR)
using CircleCI.

* TOC
{:toc}

## Overview

There are three components of this guide:

- Building and testing a Dockerized web application.
- Pushing the Docker image to ECR.
- Using AWS Fargate to deploy to ECS.

The application is [hosted on GitHub](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)
and is [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

## Prerequisites

### Create AWS Resources

This guide requires several AWS resources.
To create these resources,
CircleCI provides [several Terraform scripts](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup).
To use these scripts,
follow the steps below.

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).

2. [Install Terraform](https://www.terraform.io/).

3. Update [`terraform_setup/terraform.tfvars`](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/terraform_setup/terraform.tfvars) with real values for AWS variables.

4. Run the following commands
to create the AWS resources.

```bash
cd terraform_setup
terraform init
terraform plan  # review the plan
terraform apply  # apply the plan
```

**Note:**
You can destroy most AWS resources
by running `terraform destroy`.
If any resources remain,
check the [AWS Management Console](https://console.aws.amazon.com/),
particularly the **ECS**, **CloudFormation** and **VPC** pages.

### Configure CircleCI Environment Variables

Set the following [project environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project).

Variable                 | Description
-------------------------|------------
AWS_ACCESS_KEY_ID        | Security credentials for AWS.
AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.
AWS_DEFAULT_REGION       | Used by the AWS CLI.
AWS_ACCOUNT_ID           | Required for deployment. [Find your AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId).
AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. Should correspond to the value of `aws_resource_prefix` in `terraform_setup/terraform.tfvars`.
{:class="table table-striped"}

## Steps

## Configuration

```yaml
version: 2
jobs:
  build:
    ...
  test:
    ...
  deploy:
    docker:
      - image: <pick-an-image>
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Install AWS CLI
      - run:
          name: Build Docker image locally
      - run:
          name: Log into AWS ECR
      - run:
          name: Tag and push Docker image to ECR
      - run:
          name: Create task for deploy
      - run:
          name: Register task definition
      - run:
          name: Find revision number
      - run:
          name: Deploy specific revision
```
