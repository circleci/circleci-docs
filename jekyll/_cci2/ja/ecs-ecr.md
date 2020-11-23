---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
version:
  - Cloud
  - Server v2.x
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) にデプロイする方法を説明します。

- 目次
{:toc}

## 概要

このガイドは、次の 2 段階に分かれています。

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

また、アプリケーションの [CircleCI でのビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}についても取り上げます。

**メモ:** このプロジェクトには、簡単な [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile) が含まれています。

詳細については、「[カスタム イメージの手動作成]({{ site.baseurl }}/2.0/custom-images/#カスタム-イメージの手動作成)」を参照してください。

## 前提条件

### Use Terraform to create AWS resources

このガイドに沿ってアプリケーションをビルドしてデプロイするには、いくつかの AWS リソースが必要です。 CircleCI では、これらのリソースを作成するために[いくつかの Terraform スクリプト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)を提供しています。 これらのスクリプトを使用するには、以下の手順を行います。

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

**メモ:** ほとんどの AWS リソースは、`terraform destroy` を実行することで破棄できます。 リソースが残っている場合は、[AWS マネジメント コンソール](https://console.aws.amazon.com/)、特に **ECS**、**CloudFormation**、**VPC** のページを確認してください。 `apply` が失敗した場合は、ユーザーが EC2、Elastic Load Balancing、IAM のサービスの権限を持っているかどうかを確認してください。

### Configure CircleCI environment variables

CircleCI アプリケーションで、以下の[プロジェクト環境変数]({{ site.baseurl }}/2.0/env-vars/#プロジェクト内で環境変数を設定する)を設定します。

| 変数                         | 説明                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_SECRET_ACCESS_KEY    | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_DEFAULT_REGION       | AWS CLI によって使用されます。                                                                                                                          |
| AWS_ACCOUNT_ID           | デプロイに必要です。 [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。 |
| AWS_RESOURCE_NAME_PREFIX | 必須の AWS リソースのプレフィックスです。 `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。                                           |
| AWS_ECR_ACCOUNT_URL      | Amazon ECR account URL that maps to an AWS account, e.g. {awsAccountNum}.dkr.ecr.us-west-2.amazonaws.com                                     |
{:class="table table-striped"}

## Configuration walkthrough

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

**メモ:** このセクションで説明するサンプル プロジェクトは、以下で提供されている CircleCI の AWS-ECR Orb と AWS-ECS Orb を使用します。

- [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
- [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Notice the orbs are versioned with tags, for example, `aws-ecr: circleci/aws-ecr@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

### Build and push the Docker image to AWS ECR

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

- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例を参照するには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモ ページにアクセスしてください。
- CircleCI Orbs を使用しない例を参照するには、[Non-Orbs AWS ECR-ECS](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモ ページにアクセスしてください。