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

- Building and pushing a Docker image to AWS ECR.
- Deploying the new Docker image to an existing AWS ECS service.

You can also find the application [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

**Note:**
This project includes a simple [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile).

See [Creating a Custom Image Manually]({{ site.baseurl }}/2.0/custom-images/#creating-a-custom-image-manually) for more information.

## Prerequisites

### Use Terraform to Create AWS Resources

Several AWS resources are required to build and deploy the application in this guide. CircleCI provides [several Terraform scripts](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup) to create these resources. To use these scripts, follow the steps below.

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2. [Install Terraform](https://www.terraform.io/).
3. Clone the [sample project](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr) and go to its root directory.
4. Update `~/terraform_setup/terraform.tfvars` with real values for the AWS variables. For more details, see the [Configure CircleCI Environment Variables](#configure-circleci-environment-variables) section below.
5. Create the AWS resources by running the following commands.

```bash
cd terraform_setup
terraform init
terraform plan  # review the plan
terraform apply  # apply the plan and create AWS resources
```

**Note:**
You can destroy most AWS resources by running `terraform destroy`. If any resources remain, check the [AWS Management Console](https://console.aws.amazon.com/), particularly the **ECS**, **CloudFormation** and **VPC** pages.

### Configure CircleCI Environment Variables

In the CircleCI application, set the following [project environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project).

Variable                 | Description
-------------------------|------------
AWS_ACCESS_KEY_ID        | Security credentials for AWS.
AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.
AWS_DEFAULT_REGION       | Used by the AWS CLI.
AWS_ACCOUNT_ID           | Required for deployment. [Find your AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId).
AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. Should correspond to the value of `aws_resource_prefix` in `terraform_setup/terraform.tfvars`.
{:class="table table-striped"}

## Configuration Walkthrough

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

**Note**: The sample project described in this section makes use of the CircleCI AWS-ECR and AWS-ECS orbs, which can be found here:
 - [AWS-ECR]https://circleci.com/orbs/registry/orb/circleci/aws-ecr
 - [AWS-ECS]https://circleci.com/orbs/registry/orb/circleci/aws-ecs

### Build and Push the Docker image to AWS ECR

The `build_and_push_image` job builds a Docker image from a Dockerfile in the default location (i.e. root of the checkout directory) and pushes it to the specified ECR repository.

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          region: ${AWS_DEFAULT_REGION}
          tag: "${CIRCLE_SHA1}"
      - ...
```

### Deploy the new Docker image to an existing AWS ECS service
The `deploy-service-update` job of the aws-ecs orb creates a new task definition that is based on the current task definition, but with the new Docker image specified in the task definition's container definitions, and deploys the new task definition to the specified ECS service. If you would like more information about the CircleCI AWS-ECS orb, go to: https://circleci.com/orbs/registry/orb/circleci/aws-ecs

**Note** The `deploy-service-update` job depends on `build_and_push_image` because of the `requires` key.

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - ...
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image
          aws-region: ${AWS_DEFAULT_REGION}
          family: "${AWS_RESOURCE_NAME_PREFIX}-service"
          cluster-name: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

### Set Up a Workflow

Use workflows to link the `build_and_push_image` and `deploy-service-update` jobs.

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          region: ${AWS_DEFAULT_REGION}
          tag: "${CIRCLE_SHA1}"
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image
          aws-region: ${AWS_DEFAULT_REGION}
          family: "${AWS_RESOURCE_NAME_PREFIX}-service"
          cluster-name: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

See the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows/) for more information.

## Full Configuration File

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          region: ${AWS_DEFAULT_REGION}
          tag: "${CIRCLE_SHA1}"
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image
          aws-region: ${AWS_DEFAULT_REGION}
          family: "${AWS_RESOURCE_NAME_PREFIX}-service"
          cluster-name: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

## See Also
- If you would like to review an example that builds, tests and pushes the Docker image to ECR and then uses the `aws-ecs` orb to deploy the update, go to the [AWS-ECS-ECR Orbs]https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs demo page.
- If you would also like to review an example that does not use CircleCI orbs, go to the [Non-Orbs AWS ECR-ECS Demo]https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs demo page.
