---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
version:
  - Cloud
  - Server v2.x
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) にデプロイする方法を説明します。

* TOC
{:toc}

## 概要
{: #overview }

This guide has two phases:

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

You can also find the application [building on CircleCI](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}.

**Note:** This project includes a simple [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile).

See [Creating a Custom Image Manually]({{ site.baseurl }}/2.0/custom-images/#creating-a-custom-image-manually) for more information.

## 前提条件
{: #prerequisites }

### Use Terraform to create AWS resources
{: #use-terraform-to-create-aws-resources }

Several AWS resources are required to build and deploy the application in this guide. CircleCI provides [several Terraform scripts](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup) to create these resources. To use these scripts, follow the steps below.

1. [AWS アカウントを作成します](https://aws.amazon.com/jp/premiumsupport/knowledge-center/create-and-activate-aws-account/)。
2. [Terraform をインストールします](https://www.terraform.io/)。
3. [サンプル プロジェクト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)のクローンを作成し、そのルート ディレクトリに移動します。
4. AWS 変数の実際の値で `~/terraform_setup/terraform.tfvars` を更新します。 詳細については、以下の「[CircleCI 環境変数を設定する](#circleci-環境変数を設定する)」セクションを参照してください。
5. 以下のコマンドを実行して、AWS リソースを作成します。

```bash
cd terraform_setup
terraform init
terraform plan  # プランをレビューします
terraform apply  # プランを適用して AWS リソースを作成します
```

**Note:** You can destroy most AWS resources by running `terraform destroy`. If any resources remain, check the [AWS Management Console](https://console.aws.amazon.com/), particularly the **ECS**, **CloudFormation** and **VPC** pages. If `apply` fails, check that the user has permissions for EC2, Elastic Load Balancing, and IAM services.

### Configure CircleCI environment variables
{: #configure-circleci-environment-variables }

In the CircleCI application, set the following [project environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project).

| Variable                   | Description                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | Security credentials for AWS.                                                                                                                      |
| AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.                                                                                                                      |
| AWS_DEFAULT_REGION       | Used by the AWS CLI.                                                                                                                               |
| AWS_ACCOUNT_ID           | Required for deployment. [Find your AWS Account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId). |
| AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. Should correspond to the value of `aws_resource_prefix` in `terraform_setup/terraform.tfvars`.             |
| AWS_ECR_ACCOUNT_URL      | Amazon ECR account URL that maps to an AWS account, e.g. {awsAccountNum}.dkr.ecr.us-west-2.amazonaws.com                                           |
{:class="table table-striped"}

## Configuration walkthrough
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/). Follow the steps below to create a complete `config.yml` file.

**Note**: The sample project described in this section makes use of the CircleCI AWS-ECR and AWS-ECS orbs, which can be found here:
 - [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
 - [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Notice the orbs are versioned with tags, for example, `aws-ecr: circleci/aws-ecr@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

### Build and push the Docker image to AWS ECR
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

### 新しい Docker イメージを既存の AWS ECS サービスにデプロイする
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
          cluster-name: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

Note the use of Workflows to define job run order/concurrency. See the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows/) for more information.

## See also
{: #see-also }
- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例を参照するには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモ ページにアクセスしてください。
- CircleCI Orbs を使用しない例を参照するには、[Non-Orbs AWS ECR-ECS](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモ ページにアクセスしてください。
