---
layout: classic-docs
title: Deploy to AWS ECR/ECS
description: How to use CircleCI to deploy to AWS ECS from ECR
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This document describes how to use CircleCI to deploy to Amazon Elastic Container Service (ECS) from Amazon Elastic Container Registry (ECR).

This page is outdated. CircleCI is working on a new updated sample project. The information on this page is still relevant, but the sample project will be replaced.
{: class="alert alert-warning" }

## Overview
{: #overview }

This guide has two phases:

- Building and pushing a Docker image to AWS ECR
- Deploying the new Docker image to an existing AWS ECS service

<!-- You can also find the application [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}. -->

This project includes a simple [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile). Visit the [Creating a custom image manually]({{site.baseurl}}/custom-images/#creating-a-custom-image-manually) page for more information.

## Prerequisites
{: #prerequisites }

### 1. Use Terraform to create AWS resources
{: #use-terraform-to-create-aws-resources }

Several AWS resources are required to build and deploy the application in this guide. CircleCI provides [several Terraform scripts](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup) to create these resources. To use these scripts, follow the steps below.

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2. [Install Terraform](https://www.terraform.io/).
3. Clone the [sample project](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr) and go to its root directory.
4. Update `~/terraform_setup/terraform.tfvars` with real values for the AWS variables. For more details, see the [Configure CircleCI environment variables](#configure-circleci-environment-variables) section below.
5. Create the AWS resources by running the following commands.

```shell
cd terraform_setup
terraform init
terraform plan  # review the plan
terraform apply  # apply the plan and create AWS resources
```

You can destroy most AWS resources by running `terraform destroy`. If any resources remain, check the [AWS Management Console](https://console.aws.amazon.com/), particularly the **ECS**, **CloudFormation** and **VPC** pages. If `apply` fails, check that the user has permissions for EC2, Elastic Load Balancing, and IAM services.
{: class="alert alert-info" }

### 2. Configure CircleCI environment variables
{: #configure-circleci-environment-variables }

In the CircleCI application, set the following [project environment variables]({{ site.baseurl }}/env-vars-set/#set-an-environment-variable-in-a-project).

Variable                 | Description
-------------------------|------------
AWS_ACCESS_KEY_ID        | Security credentials for AWS.
AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.
AWS_REGION               | Used by the AWS CLI.
AWS_ACCOUNT_ID           | Required for deployment. [Find your AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId).
AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. Should correspond to the value of `aws_resource_prefix` in `terraform_setup/terraform.tfvars`.
AWS_ECR_REGISTRY_ID      | The 12 digit AWS id associated with the ECR account.
{:class="table table-striped"}

## Configuration walkthrough
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

**Note**: The sample project described in this section makes use of the CircleCI AWS-ECR and AWS-ECS orbs, which can be found here:
 - [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
 - [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Notice the orbs are versioned with tags, for example, `aws-ecr: circleci/aws-ecr@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

### 1. Build and push the Docker image to AWS ECR
{: #build-and-push-the-docker-image-to-aws-ecr }

The `build-and-push-image` job builds a Docker image from a Dockerfile in the default location (i.e. root of the checkout directory) and pushes it to the specified ECR repository.

```yaml
version: 2.1

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z
  aws-ecs: circleci/aws-ecs@0x.y.z

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          tag: "${CIRCLE_SHA1}"
```

### 2. Deploy the new Docker image to an existing AWS ECS service
{: #deploy-the-new-docker-image-to-an-existing-aws-ecs-service }

The `deploy-service-update` job of the aws-ecs orb creates a new task definition that is based on the current task definition, but with the new Docker image specified in the task definition's container definitions, and deploys the new task definition to the specified ECS service. If you would like more information about the CircleCI AWS-ECS orb, go to: https://circleci.com/developer/orbs/orb/circleci/aws-ecs

**Note** The `deploy-service-update` job depends on `build-and-push-image` because of the `requires` key.

```yaml
version: 2.1

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z
  aws-ecs: circleci/aws-ecs@0x.y.z

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image:
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          tag: "${CIRCLE_SHA1}"
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build-and-push-image # only run this job once aws-ecr/build-and-push-image has completed
          family: "${AWS_RESOURCE_NAME_PREFIX}-service"
          cluster: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

Note the use of Workflows to define job run order/concurrency. See the [Using workflows to schedule jobs]({{site.baseurl}}/workflows/) page for more information.

## See also
{: #see-also }
- If you would like to review an example that builds, tests and pushes the Docker image to ECR and then uses the `aws-ecs` orb to deploy the update, go to the [AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) demo page.
- If you would also like to review an example that does not use CircleCI orbs, go to the [Non-Orbs AWS ECR-ECS Demo](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) demo page.
