---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) にデプロイする方法を説明します。

* 目次
{:toc}

## 概要
{: #overview }

このガイドは、次の 2 段階に分かれています。

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする

また、アプリケーションの [CircleCI でのビルド](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}についても取り上げます。

**メモ**: このプロジェクトには、簡単な [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile) が含まれています。

See [Creating a Custom Image Manually]({{ site.baseurl }}/custom-images/#creating-a-custom-image-manually) for more information.

## 前提条件
{: #prerequisites }

### Terraform を使用して AWS リソースを作成する
{: #use-terraform-to-create-aws-resources }

このガイドに沿ってアプリケーションをビルドしてデプロイするには、いくつかの AWS リソースが必要です。 CircleCI では、これらのリソースを作成するために[いくつかの Terraform スクリプト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)を提供しています。 これらのスクリプトを使用するには、以下の手順を行います。

1. [AWS アカウントを作成します](https://aws.amazon.com/jp/premiumsupport/knowledge-center/create-and-activate-aws-account/)。
2. [Terraform をインストールします](https://www.terraform.io/)。
3. [>サンプル プロジェクト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)のクローンを作成し、そのルート ディレクトリに移動します。
4. AWS 変数の実際の値で `~/terraform_setup/terraform.tfvars` を更新します。 詳細については、以下の「[CircleCI 環境変数を設定する](#configure-circleci-environment-variables)」セクションを参照してください。
5. 以下のコマンドを実行して、AWS リソースを作成します。

```shell
cd terraform_setup
terraform init
terraform plan  # プランをレビューします
terraform apply  # プランを適用して AWS リソースを作成します
```

**メモ:** ほとんどの AWS リソースは、`terraform destroy` を実行することで破棄できます。 リソースが残っている場合は、[AWS マネジメント コンソール](https://console.aws.amazon.com/)で特に **ECS**、**CloudFormation**、**VPC** のページを確認してください。 `apply` が失敗した場合は、ユーザーが EC2、Elastic Load Balancing、IAM のサービスの権限を持っているかどうかを確認してください。

### CircleCI 環境変数を設定する
{: #configure-circleci-environment-variables }

In the CircleCI application, set the following [project environment variables]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-project).

| 変数                         | 説明                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_SECRET_ACCESS_KEY    | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_REGION                 | AWS CLI によって使用されます。                                                                                                                          |
| AWS_ACCOUNT_ID           | デプロイに必要です。 [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。 |
| AWS_RESOURCE_NAME_PREFIX | 必須の AWS リソースのプレフィックスです。 `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。                                           |
| AWS_ECR_REGISTRY_ID      | The 12 digit AWS id associated with the ECR account.                                                                                         |
{:class="table table-striped"}

## 設定ファイルの詳細
{: #configuration-walkthrough }

Every CircleCI project requires a configuration file called [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/). 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

**メモ**: このセクションで説明するサンプル プロジェクトは、以下で提供されている CircleCI の AWS-ECR Orb と AWS-ECS Orb を使用します。
 - [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
 - [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Orb ではタグを使用してバージョン指定します (例: `aws-ecr: circleci/aws-ecr@x.y.z`)。 サンプルをコピー & ペーストする場合は、`x.y.z` を特定のバージョンの値に変更する必要があります。 使用可能なバージョンについては、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の各 Orb のページを参照してください。

### Docker イメージをビルドして AWS ECR にプッシュする
{: #build-and-push-the-docker-image-to-aws-ecr }

`build-and-push-image` ジョブで、デフォルトの場所 (チェックアウト ディレクトリのルート) に Dockerfile から Docker イメージをビルドし、それを指定された ECR リポジトリにプッシュします。

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
aws-ecs Orb の `deploy-service-update` ジョブで、現在のタスク定義に基づきつつ、タスク定義のコンテナ定義で指定された新しい Docker イメージを使用して新しいタスク定義を作成し、この新しいタスク定義を指定された ECS サービスにデプロイします。 CircleCI AWS-ECS Orb の詳細については、https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs を参照してください。

**メモ** `deploy-service-update` ジョブは、`requires` キーがあるため、`build-and-push-image` に依存します。

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
            - aws-ecr/build-and-push-image # このジョブは aws-ecr/build-and-push-image が成功した場合のみ実行されます
          family: "${AWS_RESOURCE_NAME_PREFIX}-service"
          cluster-name: "${AWS_RESOURCE_NAME_PREFIX}-cluster"
          container-image-name-updates: "container=${AWS_RESOURCE_NAME_PREFIX}-service,tag=${CIRCLE_SHA1}"
```

ここでは、ワークフローを使用してジョブの実行順や同時実行を定義しています。 See the [Using Workflows to Schedule Jobs]({{ site.baseurl }}/workflows/) for more information.

## 関連項目
{: #see-also }
- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例を参照するには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモ ページにアクセスしてください。
- CircleCI Orbs を使用しない例を参照するには、[Non-Orbs AWS ECR-ECS Demo](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモ ページにアクセスしてください。
