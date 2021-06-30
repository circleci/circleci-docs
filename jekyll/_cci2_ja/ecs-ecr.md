---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
version:
  - Cloud
  - Server v2.x
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) にデプロイする方法を説明します。

* 目次
{:toc}

## 概要
このガイドは、次の 2 段階に分かれています。

また、アプリケーションの [CircleCI でのビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}についても取り上げます。

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

**メモ:** このプロジェクトには、簡単な [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile) が含まれています。

詳細については、「[カスタム イメージの手動作成]({{ site.baseurl }}/ja/2.0/custom-images/#カスタム-イメージの手動作成)」を参照してください。

See [Creating a Custom Image Manually]({{ site.baseurl }}/2.0/custom-images/#creating-a-custom-image-manually) for more information.

## 前提条件
{: #prerequisites }

### Terraform を使用して AWS リソースを作成する
CircleCI アプリケーションで、以下の[プロジェクト環境変数]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)を設定します。

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

### CircleCI 環境変数を設定する
{: #configure-circleci-environment-variables }

**メモ:** このセクションで説明するサンプル プロジェクトは、以下で提供されている CircleCI の AWS-ECR Orb と AWS-ECS Orb を使用します。

| 変数                         | 説明                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_SECRET_ACCESS_KEY    | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_DEFAULT_REGION       | AWS CLI によって使用されます。                                                                                                                          |
| AWS_ACCOUNT_ID           | デプロイに必要です。 [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。 |
| AWS_RESOURCE_NAME_PREFIX | 必須の AWS リソースのプレフィックスです。 `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。                                           |
| AWS_ECR_ACCOUNT_URL      | Amazon ECR account URL that maps to an AWS account, e.g. {awsAccountNum}.dkr.ecr.us-west-2.amazonaws.com                                     |
{:class="table table-striped"}

## 設定の詳細説明
**メモ:** `deploy-service-update` ジョブは、`requires` キーがあるため、`build_and_push_image` に依存します。

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

詳細については、[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows/)について参照してください。
 - [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
 - [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Notice the orbs are versioned with tags, for example, `aws-ecr: circleci/aws-ecr@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

### Docker イメージをビルドして AWS ECR にプッシュする
`build_and_push_image` ジョブは、デフォルトの場所 (チェック アウト ディレクトリのルート) に Dockerfile から Docker イメージをビルドし、それを指定された ECR リポジトリにプッシュします。

The `build-and-push-image` job builds a Docker image from a Dockerfile in the default location (i.e. root of the checkout directory) and pushes it to the specified ECR repository.

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
{: #deploy-the-new-docker-image-to-an-existing-aws-ecs-service }
aws-ecs Orb の `deploy-service-update` ジョブは、現在のタスク定義に基づきつつ、タスク定義のコンテナ定義で指定された新しい Docker イメージを使用して新しいタスク定義を作成し、この新しいタスク定義を指定された ECS サービスにデプロイします。 CircleCI AWS-ECS Orb の詳細については、https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs を参照してください。

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

Note the use of Workflows to define job run order/concurrency. See the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/2.0/workflows/) for more information.

## 完全な設定ファイル
{: #see-also }
- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例を参照するには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモ ページにアクセスしてください。
- CircleCI Orbs を使用しない例を参照するには、[Non-Orbs AWS ECR-ECS](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモ ページにアクセスしてください。
