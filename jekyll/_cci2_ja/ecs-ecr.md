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

詳細については、「[カスタムイメージの手動作成]({{ site.baseurl }}/ja/2.0/custom-images/#カスタムイメージの手動作成)」を参照してください。

## 前提条件

### Terraform を使用して AWS リソースを作成する

このガイドに沿ってアプリケーションをビルドしてデプロイするには、いくつかの AWS リソースが必要です。 CircleCI では、これらのリソースを作成するために[いくつかの Terraform スクリプト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)を提供しています。 これらのスクリプトを使用するには、以下の手順を行います。

1. [AWS アカウントを作成します](https://aws.amazon.com/jp/premiumsupport/knowledge-center/create-and-activate-aws-account/)。
2. [Terraform をインストールします](https://www.terraform.io/)。
3. [サンプルプロジェクト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)のクローンを作成し、そのルートディレクトリに移動します。
4. AWS 変数の実際の値で `~/terraform_setup/terraform.tfvars` を更新します。 詳細については、以下の「[CircleCI 環境変数を設定する](#circleci-環境変数を設定する)」セクションを参照してください。
5. 以下のコマンドを実行して、AWS リソースを作成します。

```bash
cd terraform_setup
terraform init
terraform plan  # プランをレビュー
terraform apply  # プランを適用して AWS リソースを作成
```

**メモ：**ほとんどの AWS リソースは、`terraform destroy` を実行することで破棄できます。 リソースが残っている場合は、[AWS マネジメントコンソール](https://console.aws.amazon.com/)、特に **ECS**、**CloudFormation**、**VPC** のページを確認してください。

### CircleCI 環境変数を設定する

CircleCI アプリケーションで、以下の[プロジェクト環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)を設定します。

変数 | 説明
-------------------------|------------
AWS_ACCESS_KEY_ID | AWS のセキュリティ認証情報です。
AWS_SECRET_ACCESS_KEY | AWS のセキュリティ認証情報です。
AWS_DEFAULT_REGION | AWS CLI によって使用されます。
AWS_ACCOUNT_ID | デプロイに必要です。 [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。
AWS_RESOURCE_NAME_PREFIX | 必須の AWS リソースのプレフィックスです。 `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。
{:class="table table-striped"}

## 設定の詳細説明

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

**メモ：**このセクションで説明するサンプルプロジェクトは、以下で提供されている CircleCI の AWS-ECR Orb と AWS-ECS Orb を使用します。
- [AWS-ECR](https://circleci.com/orbs/registry/orb/circleci/aws-ecr)
- [AWS-ECS](https://circleci.com/orbs/registry/orb/circleci/aws-ecs)

### Docker イメージをビルドして AWS ECR にプッシュする

`build_and_push_image` ジョブは、デフォルトの場所 (チェックアウトディレクトリのルート) に Dockerfile から Docker イメージをビルドし、それを指定された ECR リポジトリにプッシュします。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
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

### ワークフローを準備する

ワークフローを使用して、`build_and_push_image` ジョブと `deploy-service-update` ジョブをリンクします。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.2
  aws-ecs: circleci/aws-ecs@0.0.3
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

## 関連項目

- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例をレビューするには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモページにアクセスしてください。
- CircleCI Orbs を使用しない例をレビューするには、[Non-Orbs AWS ECR-ECS](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモページにアクセスしてください。
