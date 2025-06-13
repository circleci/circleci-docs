---
layout: classic-docs
title: AWS ECR/ECS へのデプロイ
description: CircleCI を使用した AWS ECR から ECS へのデプロイ方法
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

ここでは、CircleCI を使用して、Amazon Elastic Container Registry (ECR) から Amazon Elastic Container Service (ECS) にデプロイする方法を説明します。

このページの内容は古い情報です。 CircleCI では、新しく更新されたサンプルプロジェクトを作成しています。 このページの情報は現在も有効ですが、サンプルプロジェクトは置き換えられる予定です。
{: class="alert alert-warning" }

## 概要
{: #overview }

このガイドは、次の 2 つのステップに分かれています。

- Docker イメージをビルドして AWS ECR にプッシュする
- 新しい Docker イメージを既存の AWS ECS サービスにデプロイする<!-- You can also find the application \[building on CircleCI\](https://circleci.com/gh/CircleCI-Public/circleci-demo-aws-ecs-ecr){:rel="nofollow"}. -->このプロジェクトには、簡単な [Dockerfile](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/blob/master/Dockerfile) が含まれています。 詳細については、 [カスタムイメージの手動作成]({{site.baseurl}}/ja/custom-images/#creating-a-custom-image-manually)を参照してください。

## 前提条件
{: #prerequisites }

### 1. Terraform を使用して AWS リソースを作成する
{: #use-terraform-to-create-aws-resources }

このガイドに沿ってアプリケーションをビルドしてデプロイするには、いくつかの AWS リソースが必要です。 CircleCI では、これらのリソースを作成するために[いくつかの Terraform スクリプト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/master/terraform_setup)を提供しています。 これらのスクリプトを使用するには、以下の手順を行います。

1. [AWS アカウントを作成します](https://aws.amazon.com/jp/premiumsupport/knowledge-center/create-and-activate-aws-account/)。
2. [Terraform をインストールします](https://www.terraform.io/)。
3. [>サンプルプロジェクト](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr)のクローンを作成し、そのルートディレクトリに移動します。
4. AWS 変数の実際の値で `~/terraform_setup/terraform.tfvars` を更新します。 詳細については、以下の [CircleCI 環境変数を設定する](#configure-circleci-environment-variables)セクションを参照してください。
5. 以下のコマンドを実行して、AWS リソースを作成します。

```shell
cd terraform_setup
terraform init
terraform plan  # プランをレビューします
terraform apply  # プランを適用して AWS リソースを作成します
```

ほとんどの AWS リソースは、`terraform destroy` を実行することで破棄できます。 リソースが残っている場合は、[AWS マネジメントコンソール](https://console.aws.amazon.com/)で特に **ECS**、**CloudFormation**、**VPC** のページを確認してください。 `apply` が失敗した場合は、ユーザーが EC2、Elastic Load Balancing、IAM のサービスの権限を持っているかどうかを確認してください。
{: class="alert alert-info" }

### 2. CircleCI 環境変数を設定する
{: #configure-circleci-environment-variables }

CircleCI アプリケーションで、以下の [ プロジェクト環境変数]({{ site.baseurl }}/ja/set-environment-variable/#set-an-environment-variable-in-a-project)を設定します。

| 変数                         | 説明                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID        | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_SECRET_ACCESS_KEY    | AWS のセキュリティ認証情報です。                                                                                                                           |
| AWS_REGION                 | AWS CLI によって使用されます。                                                                                                                          |
| AWS_ACCOUNT_ID           | デプロイに必要です。 [AWS アカウント ID はこちらで確認してください](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/console_account-alias.html#FindingYourAWSId)。 |
| AWS_RESOURCE_NAME_PREFIX | 必須の AWS リソースのプレフィックスです。 `terraform_setup/terraform.tfvars` の `aws_resource_prefix` の値に対応する必要があります。                                           |
| AWS_ECR_REGISTRY_ID      | ECR アカウントに関連づけられた 12 桁の AWS ID です。                                                                                                           |
{:class="table table-striped"}

## 設定ファイルの詳細
{: #configuration-walkthrough }

すべての CircleCI プロジェクトには、[`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) という設定ファイルが必要です。 以下の手順に従って、完全な `config.yml` ファイルを作成してください。

**注**: このセクションで説明するサンプルプロジェクトは、以下で提供されている CircleCI の AWS-ECR Orb と AWS-ECS Orb を使用します。
 - [AWS-ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr)
 - [AWS-ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)

Orb ではタグを使用してバージョン指定します (例: `aws-ecr: circleci/aws-ecr@x.y.z`)。 サンプルをコピー & ペーストする場合は、`x.y.z` を特定のバージョンの値に変更する必要があります。 使用可能なバージョンについては、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の各 Orb のページを参照してください。

### 1. Docker イメージをビルドして AWS ECR にプッシュする
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

### 2. 新しい Docker イメージを既存の AWS ECS サービスにデプロイする
{: #deploy-the-new-docker-image-to-an-existing-aws-ecs-service }

aws-ecs Orb の `deploy-service-update` ジョブで、現在のタスク定義に基づきつつ、タスク定義のコンテナ定義で指定された新しい Docker イメージを使用して新しいタスク定義を作成し、この新しいタスク定義を指定された ECS サービスにデプロイします。 CircleCI AWS-ECS Orb の詳細については、https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs を参照してください。

**注**: `deploy-service-update` ジョブは、`requires` キーがあるため、`build-and-push-image` に依存します。

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

ここでは、ワークフローを使用してジョブの実行順や同時実行を定義しています。 詳細については、[ワークフローを使用したジョブのオーケストレーション]({{site.baseurl}}/ja/workflows/)を参照してください。

## 関連項目
{: #see-also }
- Docker イメージをビルドおよびテストして ECR にプッシュした後で、`aws-ecs` Orb を使用して更新をデプロイする例を参照するには、[AWS-ECS-ECR Orbs](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/orbs) のデモ ページにアクセスしてください。
- CircleCI Orbs を使用しない例を参照するには、[Non-Orbs AWS ECR-ECS Demo](https://github.com/CircleCI-Public/circleci-demo-aws-ecs-ecr/tree/without_orbs) のデモ ページにアクセスしてください。
