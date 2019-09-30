---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) へデプロイする方法を説明します。

- 目次
{:toc}

## 概要

このガイドは、次の 2段階に分かれています。

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

また、アプリケーションの [CircleCI でのビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}についても触れています。

**メモ：**このプロジェクトには、簡単な [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile) が含まれています。

詳細については、「[カスタムイメージの手動作成]({{ site.baseurl }}/ja/2.0/custom-images/#creating-a-custom-image-manually)」を参照してください。

## 前提条件

### Terraform を使用して AWS リソースを作成する

このガイドに沿ってアプリケーションをビルドしてデプロイするには、いくつかの AWS リソースが必要です。 CircleCI では、これらのリソースを作成するために[いくつかの Terraform スクリプト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)を提供しています。 これらのスクリプトを使用するには、以下の手順を行います。

1. [AWS アカウントを作成します](https://aws.amazon.com/jp/premiumsupport/knowledge-center/create-and-activate-aws-account/)。
2. [Terraform をインストールします](https://www.terraform.io/)。
3. [サンプルプロジェクト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)のクローンを作成し、そのルートディレクトリに移動します。
4. AWS 変数の実際の値で `~/terraform_setup/terraform.tfvars` を更新します。 詳細については、以下の「[CircleCI 環境変数を設定する](#configure-circleci-environment-variables)」セクションを参照してください。
5. 以下のコマンドを実行して、AWS リソースを作成します。

```bash
cd terraform_setup
terraform init
terraform plan  # プランをレビュー
terraform apply  # プランを適用して AWS リソースを作成
```

**メモ：**ほとんどの AWS リソースは、`terraform destroy` を実行することで破棄できます。 リソースが残っている場合は、[AWS マネジメントコンソール](https://console.aws.amazon.com/)、特に **ECS**、**CloudFormation**、**VPC** のページを確認してください。 If `apply` fails, check that the user has permissions for EC2, Elastic Load Balancing, and IAM services.

### CircleCI 環境変数を設定する

CircleCI アプリケーションで、以下の[プロジェクト環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)を設定します。

| Variable                   | Description                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | Security credentials for AWS.                                                                                                                              |
| AWS_SECRET_ACCESS_KEY    | Security credentials for AWS.                                                                                                                              |
| AWS_DEFAULT_REGION       | Used by the AWS CLI.                                                                                                                                       |
| AWS_ACCOUNT_ID           | Required for deployment. [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。 |
| AWS_RESOURCE_NAME_PREFIX | Prefix for some required AWS resources. `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。                                         |
{:class="table table-striped"}

## 設定の詳細説明

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

**Note**: The sample project described in this section makes use of the CircleCI AWS-ECR and AWS-ECS orbs, which can be found here:

- [AWS-ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr)
- [AWS-ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs)

### Docker イメージをビルドして AWS ECR にプッシュする

`build_and_push_image` ジョブは、デフォルトの場所 (チェックアウトディレクトリのルート) に Dockerfile から Docker イメージをビルドし、それを指定された ECR リポジトリにプッシュします。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.10
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}
          .amazonaws.com"
          repo: "${AWS_RESOURCE_NAME_PREFIX}"
          region: ${AWS_DEFAULT_REGION}
          tag: "${CIRCLE_SHA1}"
      - ...
```

### 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

aws-ecs Orb の `deploy-service-update` ジョブは、現在のタスク定義に基づきつつ、タスク定義のコンテナ定義で指定された新しい Docker イメージを使用して新しいタスク定義を作成し、この新しいタスク定義を指定された ECS サービスにデプロイします。 CircleCI AWS-ECS Orb の詳細については、https://circleci.com/orbs/registry/orb/circleci/aws-ecs を参照してください。

**メモ：**`deploy-service-update` ジョブは、`requires` キーがあるため、`build_and_push_image` に依存します。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.8
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

### ワークフローを準備する

ワークフローを使用して、`build_and_push_image` ジョブと `deploy-service-update` ジョブをリンクします。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.8
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}
          .amazonaws.com"
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

詳細については、[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows/)を参照してください。

## 完全な設定ファイル

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.10
  aws-ecs: circleci/aws-ecs@0.0.8
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

## 関連項目

- If you would like to review an example that builds, tests and pushes the Docker image to ECR and then uses the `aws-ecs` orb to deploy the update, go to the [AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) demo page.
- If you would also like to review an example that does not use CircleCI orbs, go to the [Non-Orbs AWS ECR-ECS Demo](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) demo page.