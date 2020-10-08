---
layout: classic-docs
title: "CircleCI 構成クックブック"
short-title: "構成クックブック"
description: "構成クックブック入門編"
categories:
  - getting-started
order: 1
---

*CircleCI 構成クックブック*は、CircleCI のリソース (CircleCI やパートナーの承認済み Orbs など) を使用してさまざまな構成タスクを行うための詳しい手順について、ユースケースごとにまとめた「レシピ集」です。 このクックブックと関連セクションを参照することで、CircleCI プラットフォームで繰り返し行われるタスクをすばやく簡単に実行できるようになります。

* 目次
{:toc}

## はじめに

このページおよび関連する「レシピ」では、CircleCI パイプラインを適切に構成できるよう、コード スニペットやサンプルを引用しながら一連のステップと手順を実施することで具体的なタスクを実行する方法を説明します。 この「クックブック」の「レシピ」はそれぞれ 1 つのタスクに対応します。これらのタスクは、CircleCI Orb などの CircleCI リソースに加えて、ユーザー独自のリソースを使用して CircleCI プラットフォームで実行できます。 CircleCI Orb を使用するとタスクの実行に必要なステップが簡略化されるため、レシピでは可能な限り CircleCI Orb を使用しています。

### CircleCI Orb とは

CircleCI Orb は、CircleCI プラットフォームを効率的に使用するための構成パッケージです。 Orb を使用すると、複数のプロジェクトで構成を共有、標準化、簡略化することができます。 構成のベスト プラクティスの参考として Orb を使用することも可能です。

現在提供されている Orb の一覧は、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs)にて確認してください。

既存の Orb を 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/#orbs-version-21-が必須) ファイルで使用するには、`orbs` キーを使用して呼び出します。 以下の例では、`circleci` 名前空間で [`hello-build` Orb](https://circleci.com/developer/orbs/orb/circleci/hello-build) を呼び出します。

```yaml
version: 2.1

orbs:
  hello: circleci/hello-build@0.0.5

workflows:
  "Hello Workflow":
    jobs:
      - hello/hello-build
```

CircleCI Orb の詳細については、「[Orb の概要]({{ site.baseurl }}/ja/2.0/orb-intro/)」を参照してください。

#### CircleCI プラットフォームおよび Orb を使用するための環境構成

1) `.circleci/config.yml` ファイルの先頭で CircleCI のバージョンを 2.1 に設定します。

`version: 2.1`

**メモ:** {% include snippets/enable-pipelines.md %}

2) バージョンの下に Orb スタンザを追加します。これで、Orb がインポートされます。

```yaml
aws-ecs: circleci/aws-ecs@0.0.10
```

3) 既存のワークフローやジョブで Orb エレメントを呼び出します (`aws-ecs elements` など)。

### 構成レシピ

下表に、CircleCI Orb を使用して実行できるさまざまなビルド構成の「レシピ」を示します。

| 構成レシピ                                                                          | 説明                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [ソフトウェアの変更を Amazon Elastic Container Service (ECS) にデプロイする](#header1)          | CircleCI 承認済み ECS Orb を使用して Amazon Elastic Container Service (ECS) に変更をデプロイする方法を説明します。 |
| [ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする](#header2)                  | CircleCI 承認済み GKE Orb を使用して Google Kubernetes Engine (GKE) に変更をデプロイする方法を説明します。         |
| [Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する](#header3) | Kubernetes 向けの Amazon ECS サービスを Kubernetes 関連のタスクと操作に使用する方法を説明します。                     |
| [アプリケーションを Heroku にデプロイする](#header4)                                           | CircleCI Heroku Orb を使用して Heroku プラットフォームにアプリケーションをデプロイする方法を説明します。                     |
| [CircleCI ジョブでカスタム Slack 通知を利用する](#header5)                                    | カスタマイズした Slack 通知を CircleCI ジョブで利用する方法を説明します。                                          |

## ソフトウェアの変更を Amazon ECS にデプロイする {#header1}

Amazon Elastic Container Service (ECS) は、スケーラブルなコンテナ オーケストレーション サービスです。Docker コンテナをサポートし、コンテナ化されたアプリケーションを AWS で実行およびスケールできます。 Amazon ECS を使用することで、独自のコンテナ オーケストレーション ソフトウェアをインストール・構成せずに済むため、デプロイの複雑性を軽減し、CircleCI プラットフォームでコンテナをシンプルかつ最適にデプロイすることができます。 このセクションでは、CircleCI Orb を使用してソフトウェアの変更を Amazon ECS サービスにすばやく簡単にデプロイする方法を取り上げますが、Amazon ECS サービスの機能や基本的なコンポーネントとアーキテクチャについての詳細情報を確認したい場合は、[Amazon ECS のドキュメント](https://https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html)を参照してください。

### 前提条件

CircleCI プラットフォームで Amazon ECS にソフトウェアの変更をデプロイする前に、一連の構成ステップを実行して、お使いの環境が CircleCI プラットフォームに合わせて適切にセットアップおよび構成されていることを確認する必要があります。 また、上記のステップを簡略化するための「Orb」が CircleCI によって既に作成されているため、CircleCI プロジェクトが CircleCI Orb を使用できるように構成されていることも必要です。

### Amazon ECS サービスを更新する

Orb を使用できる環境が整ったら、Amazon ECS サービスを最新バージョンに更新します。 Amazon ECS サービスの更新には、既存の Amazon Web Services CLI も更新するかどうかに応じて、2 つの方法があります。 両方のアプローチについて以下に説明します。

#### AWS CLI を更新せずに Amazon ECS サービスを更新する

CircleCI Orb を使用して、AWS CLI を更新せずに Amazon ECS サービスを更新するには、ECS サービスの更新方法を示す以下の例を参照してください。

```yaml
version: 2.1
orbs:
  aws-ecr: circleci/aws-ecr@0.0.4
  aws-ecs: circleci/aws-ecs@0.0.3
workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build_and_push_image:
          account-url: '${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
          repo: '${MY_APP_PREFIX}'
          region: '${AWS_REGION}'
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update:
          requires:
            - aws-ecr/build_and_push_image
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

この例では、ECS サービスを更新するために、2 つの AWS ECS Orb (`aws-ecs 0.0.3` と `aws-ecs 0.0.4`) をインスタンス化する必要があることがわかります。 この 2 つの Orb をインスタンス化したら、Orb は構成を有効にし、イメージをプッシュしてから、最終的にサービス更新を ECS にデプロイします。

#### Amazon Web Services CLI と Amazon ECS を更新する

AWS CLI と ECS サービスを同時に更新するときは、以下の Orb を使用すると、更新プロセスを簡略化できます。

```yaml
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.4
  aws-ecs: circleci/aws-ecs@0.0.3
jobs:
  update-tag:
    docker:
      - image: 'circleci/python:3.7.1'
    steps:
      - aws-cli/install
      - aws-cli/configure:
          aws-access-key-id: $AWS_ACCESS_KEY_ID
          aws-region: $AWS_REGION
      - aws-ecs/update-service:
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=stable'
workflows:
  deploy:
    jobs:
      - update-tag
```

上の例では、2 つの Orb (`aws-cli: circleci/aws-cli@0.1.4` と `aws-ecs: circleci/aws-ecs@0.0.3`) をインスタンス化し、いくつかの連続したステップを実行して、Amazon CLI をインストール・構成してから、Amazon ECS サービスを更新しています。

#### Amazon ECS サービスの更新を検証する

Amazon ECS サービスを更新したら、CircleCI Amazon ECR/ECS Orb を使用して、更新が適切に適用されたかどうかを検証します。 その Orb の例を以下に示します。

```yaml
version: 2.1
orbs:
  aws-cli: circleci/aws-cli@0.1.4
  aws-ecs: circleci/aws-ecs@0.0.3
jobs:
  verify-deployment:
    docker:
      - image: 'circleci/python:3.7.1'
    steps:
      - aws-cli/install
      - aws-cli/configure:
          aws-access-key-id: $AWS_ACCESS_KEY_ID
          aws-region: $AWS_REGION
      - run:
          name: 最後のタスク定義の取得
          command: >
            TASK_DEFINITION_ARN=$(aws ecs describe-task-definition \
                --task-definition ${MY_APP_PREFIX}-service \
                --output text \
                --query 'taskDefinition.taskDefinitionArn')
            echo "export TASK_DEFINITION_ARN='${TASK_DEFINITION_ARN}'" >>
            $BASH_ENV
      - aws-ecs/verify-revision-is-deployed:
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          task-definition-arn: '${TASK_DEFINITION_ARN}'
workflows:
  test-workflow:
    jobs:
      - verify-deployment
```

この例は、Orb を使用して AWS CLI をインストール・構成し、タスク定義を取得してから、このリビジョンがデプロイされたかどうかを検証する方法を示しています。 イメージを構成して Amazon ECS にプッシュする方法の詳細については、[AWS ECR Orb のサンプル](https://circleci.com/ja/docs/2.0/deployment-integrations/#aws-ecr-と-aws-ecs-の-orb-のサンプル)を参照してください。

CircleCI Amazon ECS/ECR Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)を参照してください。

## ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする {#header2}

Google Kubernetes Engine (GKE) を利用すると、CI/CD 戦略を自動化して、コードやアプリケーションの更新を顧客にすばやく簡単にデプロイできます。更新の配信に長い時間はかかりません。 CircleCI は、GKE 固有の CircleCI Orb を開発すると共に、GKE のテクノロジーを活用して、特定のジョブで GKE を操作できるようにしました。 GKE を使用する前に、[Google Kubernetes Engine のドキュメント](https://cloud.google.com/kubernetes-engine/docs/)をご一読ください。

### 前提条件

Google Kubernetes Engine (GKE) にソフトウェアの変更をデプロイする前に以下の要件を満たしている必要があります。

#### 環境変数を設定する
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

- `GCLOUD_SERVICE_KEY` (必須)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

これらの環境変数の設定方法の詳細については、[環境変数に関するドキュメント](https://circleci.com/ja/docs/2.0/env-vars/)を参照してください。

### GKE アクションを管理する

CircleCI GKE Orb では、GKE クラスタを使用しながら、Orb 内で以下のような複数のアクションを実行できます。

- `gcloud` と `kubectl` のインストール (まだインストールされていない場合)
- `gcloud` CLI の初期化
- 既存のデプロイの Docker イメージの更新

Docker イメージを GKE クラスタにロールアウトしながら、これらのアクションを実行するコードの例を以下に示します。

```yaml
version: 2.1
commands:
  install:
    description: "`gcloud` と `kubectl` がまだインストールされていない場合はインストールします"
    steps:
      - gcloud/install
      - k8s/install
  init:
    description: "`gcloud` CLI を初期化します"
    steps:
      - gcloud/initialize
  rollout-image:
    description: "デプロイの Docker イメージを更新します"
    parameters:
      deployment:
        description: "Kubernetes デプロイ名"
        type: string
      container:
        description: "Kubernetes コンテナ名"
        type: string
      image:
        description: Docker イメージの名前
        type: string
    steps:
      - run: |
          gcloud container clusters get-credentials <<parameters.deployment>>
          kubectl set image deployment <<parameters.deployment>> <<parameters.container>>=<<parameters.image>>
```

### GKE クラスタにイメージをパブリッシュおよびロールアウトする

`gcloud` のインストール (必要な場合) および初期化と、Docker イメージの更新を完了したら、この更新したイメージを後から使用できるように GKE クラスタにパブリッシュおよびロールアウトできます。

```yaml
version: 2.1
jobs:
  publish-and-rollout-image:
    description: "新しい Docker イメージでクラスタを更新します"
    machine: true
    parameters:
      deployment:
        description: "Kubernetes デプロイ名"
        type: string
      container:
        description: "Kubernetes コンテナ名"
        type: string
      gcloud-service-key:
        description: gcloud サービス キー
        type: env_var_name
        default: GCLOUD_SERVICE_KEY
      google-project-id:
        description: gcloud CLI から接続する Google プロジェクト ID
        type: env_var_name
        default: GOOGLE_PROJECT_ID
      google-compute-zone:
        description: gcloud CLI から接続する Google コンピュート ゾーン
        type: env_var_name
        default: GOOGLE_COMPUTE_ZONE
      registry-url:
        description: ['', us, eu, asia].gcr.io からの GCR レジストリ URL
        type: string
        default: gcr.io
      image:
        description: Docker イメージの名前
        type: string
      tag:
        description: Docker イメージ タグ
        type: string
        default: "latest"
      path-to-dockerfile:
        description: イメージのビルド時に使用する Dockerfile の相対パス
        type: string
        default: "."
    steps:
      - checkout
      - gcr/gcr-auth:
          google-project-id: <<parameters.google-project-id>>
          google-compute-zone: <<parameters.google-compute-zone>>
      - install
      - gcr/build-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: << parameters.tag >>
          path-to-dockerfile: <<parameters.path-to-dockerfile>>
      - gcr/push-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: <<parameters.tag>>
      - rollout-image:
          deployment: "<<parameters.deployment>>"
          container: "<<parameters.container>>"
          image: "<<parameters.image>>"
```

### GKE Orb の例

CircleCI GKE Orb を使用して Google Cloud Platform (GCP) にログインし、Docker イメージをビルドおよびパブリッシュして、そのイメージを GKE クラスタにロールアウトする例を示します。

```yaml
version: 2.1

# Orb の依存関係
orbs:
  gcloud: circleci/gcp-cli@1.0.6
  gcr: circleci/gcp-gcr@0.0.2
  k8s: circleci/kubernetes@0.1.0

commands:
  install:
    description: "`gcloud` と `kubectl` がまだインストールされていない場合はインストールします"
    steps:
      - gcloud/install
      - k8s/install
  init:
    description: "`gcloud` CLI を初期化します"
    steps:
      - gcloud/initialize
  rollout-image:
    description: "デプロイの Docker イメージを更新します"
    parameters:
      cluster:
        description: "Kubernetes クラスタ名"
        type: string
      deployment:
        description: "Kubernetes デプロイ名"
        type: string
      container:
        description: "Kubernetes コンテナ名"
        type: string
      image:
        description: Docker イメージの名前
        type: string
    steps:
      - run: |
          gcloud container clusters get-credentials <<parameters.cluster>>
          kubectl set image deployment <<parameters.deployment>> <<parameters.container>>=<<parameters.image>>

jobs:
  publish-and-rollout-image:
    description: "新しい Docker イメージでクラスタを更新します"
    machine: true
    parameters:
      cluster:
        description: "Kubernetes クラスタ名"
        type: string
      deployment:
        description: "Kubernetes デプロイ名"
        type: string
      container:
        description: "Kubernetes コンテナ名"
        type: string
      gcloud-service-key:
        description: gcloud サービス キー
        type: env_var_name
        default: GCLOUD_SERVICE_KEY
      google-project-id:
        description: gcloud CLI から接続する Google プロジェクト ID
        type: env_var_name
        default: GOOGLE_PROJECT_ID
      google-compute-zone:
        description: gcloud CLI から接続する Google コンピュート ゾーン
        type: env_var_name
        default: GOOGLE_COMPUTE_ZONE
      registry-url:
        description: ['', us, eu, asia].gcr.io からの GCR レジストリ URL
        type: string
        default: gcr.io
      image:
        description: Docker イメージの名前
        type: string
      tag:
        description: Docker イメージ タグ
        type: string
        default: "latest"
      path-to-dockerfile:
        description: イメージのビルド時に使用する Dockerfile の相対パス
        type: string
        default: "."
    steps:
      - checkout
      - gcr/gcr-auth:
          google-project-id: <<parameters.google-project-id>>
          google-compute-zone: <<parameters.google-compute-zone>>
      - install
      - gcr/build-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: << parameters.tag >>
          path-to-dockerfile: <<parameters.path-to-dockerfile>>
      - gcr/push-image:
          registry-url: <<parameters.registry-url>>
          google-project-id: <<parameters.google-project-id>>
          image: <<parameters.image>>
          tag: <<parameters.tag>>
      - rollout-image:
          cluster: "<<parameters.cluster>>"
          deployment: "<<parameters.deployment>>"
          container: "<<parameters.container>>"
          image: "<<parameters.image>>"

example:
  publish-and-rollout-image:
    description: |
      "この Orb を使用する最もシンプルな例。 GCP にログインして Docker イメージを
      ビルドおよびパブリッシュしてから、GKE クラスタにロールアウトします"
    usage:
      version: 2.1
      orbs:
        gke: felicianotech/test-gke@dev:testing-3
      workflows:
        main:
          jobs:
            - build
            - gke/publish-and-rollout-image:
                context: gcp-testing
                deployment: orb-badge-server
                image: orb-badge-server
                tag: "2"
```

## Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する {#header3}

CircleCI が開発した Kubernetes Orb は、Amazon Elastic Container Service (ECS) と組み合わせて以下のタスクに使用できます。

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

CircleCI AWS-EKS Orb を使用する前に、CircleCI Orb レジストリで [AWS-EKS Orb の仕様](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start)を確認してください。

### 前提条件

Amazon EKS サービスを使用する前に、以下の要件を満たしていることを確認してください。

* CircleCI プラットフォームと CircleCI Orb を使用するように環境が構成されている
* `eksctl` ツールがインストールされている
* `AWS-CLI` と `AWS-IAM Authenticator for Kubernetes` がインストールされている

#### CircleCI プラットフォームおよび Orb を使用するように環境を構成する

以下のステップを実行して、CircleCI と Orb を使用できるように環境を構成します。

1) `.circleci/config.yml` ファイルの先頭で CircleCI のバージョンを 2.1 に設定します。

`version: 2.1`

2) {% include snippets/enable-pipelines.md %}

バージョンの下に Orb スタンザを追加し、Orb を呼び出します。

`orbs: aws-eks: circleci/aws-eks@0.2.1`

3) 既存のワークフローやジョブで `aws-eks` エレメントを使用します。

#### Amazon `eksctl` ツールをインストールする

まだ Amazon `eksctl` ツールがインストールされていない場合は、`eksctl` をインストールし、これらのツールを使用して EKS (Amazon EC2 用マネージド Kubernetes サービス) でクラスタを管理できるようにします。

CircleCI Orb を使用して環境に 'eksctl' ツールをインストールするコードの例を以下に示します。

```yaml
version: 2.1
description:
要件: curl、amd64 アーキテクチャ
steps:
  - run:
      command: >
        if which eksctl > /dev/null; then
          echo "eksctl is already installed"
          exit 0
        fi

        mkdir -p eksctl_download

        curl --silent --location --retry 5
        "https://github.com/weaveworks/eksctl/releases/download/latest_release/eksctl_$(uname
        -s)_amd64.tar.gz" \
          | tar xz -C eksctl_download
        chmod +x eksctl_download/eksctl

        SUDO=""

        if [ $(id -u) -ne 0 ] && which sudo > /dev/null ; then
          SUDO="sudo"
        fi

        $SUDO mv eksctl_download/eksctl /usr/local/bin/

        rmdir eksctl_download
      name: eksctl ツールのインストール
```

#### AWS-CLI と AWS-IAM for Kubernetes をインストールする

CircleCI では、`AWS-CLI` および `AWS-IAM` 認証ツールを使用して、AWS クラスタでコマンドライン ツールを実行できます。 `AWS-CLI` を使用してこれらのコマンドライン ツールを実行できる場所では、`AWS-IAM` によって既存の Kubernetes クラスタを認証できます。 AWS IAM Authenticator for Kubernetes を使用すれば、Kubernetes にアクセスするために別の認証情報を管理する必要がなくなります。 これらのツールをインストールおよび使用する方法の詳細については、[GitHub の AWS-IAM ページ](https://github.com/kubernetes-sigs/aws-iam-authenticator)を参照してください。

AWS IAM Authenticator for Kubernetes をインストールするコードの例は以下のとおりです。

```yaml
version: 2.1
要件: curl、amd64 アーキテクチャ
parameters:
  release-tag:
    default: ''
    description: >
      これを使用して、https://github.com/kubernetes-sigs/aws-iam-authenticator/releases に記載されている 
      AWS IAM Authenticator のうち、インストールするパブリッシュ済みリリースを選択するためのタグを指定します。 値が指定されない場合は、最新のリリースがインストールされます。

      メモ: v0.3.0 より前のリリース バージョンは指定できません。 また、プレリリースやアルファリリースも指定不可です。
    type: string
steps:
  - run:
      command: >
        if which aws-iam-authenticator > /dev/null; then
          echo "AWS IAM Authenticator for Kubernetes is already installed"
          exit 0
        fi
        PLATFORM="linux"
        if [ -n "$(uname | grep "Darwin")" ]; then
          PLATFORM="darwin"
        fi
        RELEASE_TAG="<< parameters.release-tag >>
        RELEASE_URL="https://api.github.com/repos/kubernetes-sigs/aws-iam-authenticator/releases/latest"
        if [ -n "${RELEASE_TAG}" ]; then
          RELEASE_URL="https://api.github.com/repos/kubernetes-sigs/aws-iam-authenticator/releases/tags/${RELEASE_TAG}"
        fi
        DOWNLOAD_URL=$(curl -s --retry 5 "${RELEASE_URL}" \
            | grep "${PLATFORM}" | awk '/browser_download_url/ {print $2}' | sed 's/"//g')
        curl -L -o aws-iam-authenticator "$DOWNLOAD_URL"
        chmod +x ./aws-iam-authenticator
        SUDO=""
        if [ $(id -u) -ne 0 ] && which sudo > /dev/null ; then
          SUDO="sudo"
        fi
        $SUDO mv ./aws-iam-authenticator /usr/local/bin/aws-iam-authenticator
      name: AWS IAM Authenticator for Kubernetes のインストール
```

**メモ:** curl が有効で、amd64 アーキテクチャが使用されていることを確認してください。

### EKS クラスタを作成する

CircleCI AWS-EKS Orb を使用するための要件を満たしていることが確認できたら、以下のコード例を使用して EKS クラスタを作成できます。

```yaml
version: 2.1
jobs:
  test-cluster:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          EKS クラスタの名前
        type: string
    steps:
      - kubernetes/install
      - aws-eks/update-kubeconfig-with-authenticator:
          cluster-name: << parameters.cluster-name >>
      - run:
          command: |
            kubectl get services
          name: クラスタのテスト
orbs:
aws-eks: circleci/aws-eks@0.1.0
kubernetes: circleci/kubernetes@0.3.0
version: 2.1
workflows:
deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: my-eks-demo
      - test-cluster:
          cluster-name: my-eks-demo
          requires:
            - aws-eks/create-cluster
      - aws-eks/delete-cluster:
          cluster-name: my-eks-demo
          requires:
            - test-cluster
```

この例では、CircleCI AWS-EKS Orb を使用して、1 つのジョブで Kubernetes をインストールし、Authenticator で Kubernetes 構成を更新し、Kubernetes サービスを取得できます。

### Kubernetes デプロイを作成する

Kubernetes クラスタを作成したら、Kubernetes デプロイを作成します。これにより、クラスタの管理など、以下のようなさまざまなアクションをクラスタ内で実行できるようになります。

* クラスタ内のリソースの更新
* Authenticator を使用した Kubernetes 構成の更新
* コンテナ イメージの更新

Kubernetes デプロイを作成するコードの例を示します。

```yaml
version: 2.1
jobs:
  create-deployment:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          EKS クラスタの名前
        type: string
    steps:
      - checkout
      - aws-eks/update-kubeconfig-with-authenticator:
          cluster-name: << parameters.cluster-name >>
          install-kubectl: true
      - kubernetes/create-or-update-resource:
          get-rollout-status: true
          resource-file-path: tests/nginx-deployment/deployment.yaml
          resource-name: deployment/nginx-deployment
orbs:
  aws-eks: circleci/aws-eks@0.1.0
  kubernetes: circleci/kubernetes@0.3.0
version: 2.1
workflows:
  deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: eks-demo-deployment
      - create-deployment:
          cluster-name: eks-demo-deployment
          requires:
            - aws-eks/create-cluster
      - aws-eks/update-container-image:
          cluster-name: eks-demo-deployment
          container-image-updates: 'nginx=nginx:1.9.1'
          post-steps:
            - kubernetes/delete-resource:
                resource-names: nginx-deployment
                resource-types: deployment
                wait: true
          record: true
          requires:
            - create-deployment
          resource-name: deployment/nginx-deployment
      - aws-eks/delete-cluster:
          cluster-name: eks-demo-deployment
          requires:
            - aws-eks/update-container-image
```

### クラスタに Helm をインストールする

以下のように、クラスタへの Helm のインストールを簡略化できます。

```yaml
version: 2.1
description: |
  EKS クラスタに Helm をインストールします。
  メモ: tiller 構成にセキュリティ構成を適用するために
  tiller-tls などのパラメーターを設定する必要があります。
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      使用する AWS プロファイル。 指定されない場合は、AWS CLI インストールに
      構成されているデフォルトのプロファイルが使用されます。
    type: string
  aws-region:
    default: ''
    description: |
      この EKS クラスタが属する AWS リージョン
    type: string
  cluster-name:
    description: |
      EKS クラスタの名前
    type: string
  enable-cluster-wide-admin-access:
    default: false
    description: |
      tiller に EKS クラスタ全体の管理者アクセス権を付与します。
      そのために、cluster-admin ロールとのロール バインディングと、
      service-account パラメーターで指定された名前またはデフォルトの
      名前 "tiller" のサービス アカウントを作成します。
      メモ: これは便利なオプションですが、通常、セキュリティ上の理由から、
      本番クラスタでの使用はお勧めできません。
    type: boolean
  executor:
    default: python3
    description: |
      このジョブに使用する Executor
    type: executor
  service-account:
    default: ''
    description: |
      使用する Tiller のサービス アカウントの名前。
      メモ: enable-cluster-wide-admin-access を true に
      設定しない場合は、ロールを指定するロール バインディングと、
      指定した名前のサービス アカウントを
      事前に作成しておく必要があります。
    type: string
  tiller-ca-cert:
    default: ''
    description: |
      CA ルート証明書のパス
    type: string
  tiller-namespace:
    default: ''
    description: |
      Tiller の名前空間を指定します
    type: string
  tiller-tls:
    default: false
    description: |
      TLS を有効にして Tiller をインストールします
    type: boolean
  tiller-tls-cert:
    default: ''
    description: |
      Tiller と共にインストールする TLS 証明書ファイルのパス
    type: string
  tiller-tls-hostname:
    default: ''
    description: |
      Tiller から返された証明書のホスト名を検証するために
      使用されるサーバー名
    type: string
  tiller-tls-key:
    default: ''
    description: |
      Tiller と共にインストールする TLS キー ファイルのパス
    type: string
  tiller-tls-verify:
    default: false
    description: |
      TLS を有効にして Tiller をインストールし、リモート証明書を検証します
    type: boolean
  wait:
    default: true
    description: |
      Tiller が実行され、リクエストの受信を開始するまでブロックします
    type: boolean
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - helm/install-helm-on-cluster:
      enable-cluster-wide-admin-access: << parameters.enable-cluster-wide-admin-access >>
      service-account: << parameters.service-account >>
      tiller-ca-cert: << parameters.tiller-ca-cert >>
      tiller-namespace: << parameters.tiller-namespace >>
      tiller-tls: << parameters.tiller-tls >>
      tiller-tls-cert: << parameters.tiller-tls-cert >>
      tiller-tls-hostname: << parameters.tiller-tls-hostname >>
      tiller-tls-key: << parameters.tiller-tls-key >>
      tiller-tls-verify: << parameters.tiller-tls-verify >>
      wait: << parameters.wait >>
```

#### クラスタに Helm Chart をインストールする

Helm は、Kubernetes クラスタ上で実行される強力なアプリケーション パッケージ マネージャーです。Helm Chart を使用することで、アプリケーション構造を記述し、シンプルなコマンドによってその構造を管理できます。 Helm では、関連する Kubernetes リソース一式を記述するファイルが、チャートと呼ばれるパッケージ形式に集約されます。 1 つのチャートを使用して、memcached ポッドのような単純なアプリケーションから、HTTP サーバー、データベース、キャッシュなどから成る完全な Web アプリ スタックのような複雑なアプリケーションまで、幅広くデプロイできます。

Kubernetes クラスタに Helm をインストールしたら、以下のコード例を使用して Helm Chart をインストールできます。

```yaml
version: 2.1
description: |
  EKS クラスタに Helm Chart をインストールします。
  要件: クラスタに Helm がインストールされている必要があります。
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      使用する AWS プロファイル。 指定されない場合は、AWS CLI インストールに
      構成されているデフォルトのプロファイルが使用されます。
    type: string
  aws-region:
    default: ''
    description: |
      この EKS クラスタが属する AWS リージョン
    type: string
  chart:
    description: |
      インストール対象として、チャート リファレンス (stable/mariadb など)、
      パッケージ化されたチャートのパス (./nginx-1.2.3.tgz など)、
      アンパッケージ化されたチャート ディレクトリのパス (./nginx など)、
      または絶対 URL (https://example.com/charts/nginx-1.2.3.tgz など) を指定します。
    type: string
  cluster-name:
    description: |
      EKS クラスタの名前
    type: string
  executor:
    default: python3
    description: |
      このジョブに使用する Executor
    type: executor
  namespace:
    default: ''
    description: |
      使用する Kubernetes の名前空間
    type: string
  release-name:
    default: ''
    description: |
      リリースの名前を指定します
    type: string
  tiller-namespace:
    default: ''
    description: |
      Tiller の名前空間を指定します
    type: string
  tls:
    default: false
    description: |
      リクエストに対し TLS を有効にします
    type: boolean
  tls-ca-cert:
    default: ''
    description: |
      TLS CA 証明書ファイルのパス
    type: string
  tls-cert:
    default: ''
    description: |
      TLS 証明書ファイルのパス
    type: string
  tls-hostname:
    default: ''
    description: |
      サーバーから返された証明書のホスト名を検証するために
      使用されるサーバー名
    type: string
  tls-key:
    default: ''
    description: |
      TLS キー ファイルのパス
    type: string
  tls-verify:
    default: false
    description: |
      リクエストに対し TLS を有効にし、リモートを検証します
    type: boolean
  values-to-override:
    default: ''
    description: |
      Helm インストール コマンドの --set フラグを使用して
      チャート内の値をオーバーライドします。 形式: key1=val1,key2=val2
    type: string
  wait:
    default: true
    description: |
      インストールの完了を待つかどうか
    type: boolean
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - helm/install-helm-chart:
      chart: << parameters.chart >>
      namespace: << parameters.namespace >>
      release-name: << parameters.release-name >>
      tiller-namespace: << parameters.tiller-namespace >>
      tls: << parameters.tls >>
      tls-ca-cert: << parameters.tls-ca-cert >>
      tls-cert: << parameters.tls-cert >>
      tls-hostname: << parameters.tls-hostname >>
      tls-key: << parameters.tls-key >>
      tls-verify: << parameters.tls-verify >>
      values-to-override: << parameters.values-to-override >>
      wait: << parameters.wait >>
```

### コンテナ イメージを更新する

場合によっては、Kubernetes クラスタ内のリソースのコンテナ イメージの更新が必要になることがあります。 CircleCI AWS-EKS Orb を使用すると、このイメージをすばやく簡単に更新できます。それには、まず IAM Authenticator を使用して Kubernetes 構成を更新し、次に Kubernetes 構成内にある対象のイメージを更新します。

この Orb を使用して Kubernetes クラスタ内の既存のコンテナ イメージを更新するコードの例を以下に示します。

```yaml
version: 2.1
description: |
  EKS 上のリソースのコンテナ イメージを更新します
executor: << parameters.executor >>
parameters:
  aws-profile:
    default: ''
    description: |
      使用する AWS プロファイル。 指定されない場合は、AWS CLI インストールに
      構成されているデフォルトのプロファイルが使用されます。
    type: string
  aws-region:
    default: ''
    description: |
      この EKS クラスタが属する AWS リージョン
    type: string
  cluster-name:
    description: |
      EKS クラスタの名前
    type: string
  container-image-updates:
    description: |
      `kubectl set image` によってリソースに適用する
      コンテナ イメージの更新をリストします。
      形式は、CONTAINER_NAME_1=CONTAINER_IMAGE_1 ... CONTAINER_NAME_N=CONTAINER_IMAGE_N
      のようなスペース区切りの名前・値ペアです。
      例: "busybox=busybox nginx=nginx:1.9.1"
    type: string
  executor:
    default: python3
    description: |
      このジョブに使用する Executor
    type: executor
  get-rollout-status:
    default: false
    description: |
      ロールアウトのステータスを取得します。
      これは、`kubectl rollout` サブコマンドの使用が有効な
      リソース タイプにのみ使用できます。
    type: boolean
  namespace:
    default: ''
    description: |
      使用する Kubernetes の名前空間
    type: string
  pinned-revision-to-watch:
    default: ''
    description: |
      監視するリビジョンを固定します。別のリビジョンによってロールオーバーされた場合は、
      監視を中止します。
      get-rollout-status が true に設定された場合にのみ有効です。
    type: string
  record:
    default: false
    description: |
      更新を記録するかどうか
    type: boolean
  resource-name:
    default: ''
    description: |
      TYPE/NAME 形式のリソース名 (例: deployment/nginx-deployment)。
      resource-file-path と resource-name のいずれかを指定する必要があります。
      get-rollout-status が true に設定された場合は必須です。
    type: string
  show-kubectl-command:
    default: false
    description: |
      使用された kubectl コマンドを表示するかどうか
    type: boolean
  watch-rollout-status:
    default: true
    description: |
      直近のロールアウトのステータスをその終了まで監視するかどうか
      get-rollout-status が true に設定された場合にのみ有効です。
    type: boolean
  watch-timeout:
    default: ''
    description: >
      監視を終了するまで待つ時間。0 が指定されると監視を終了しません。
      その他の値を指定する場合は、1s、2m、3h などのように、時間の単位を付ける
      必要があります。
      get-rollout-status が true に設定された場合にのみ有効です。
    type: string
steps:
  - update-kubeconfig-with-authenticator:
      aws-profile: << parameters.aws-profile >>
      aws-region: << parameters.aws-region >>
      cluster-name: << parameters.cluster-name >>
      install-kubectl: true
  - kubernetes/update-container-image:
      container-image-updates: << parameters.container-image-updates >>
      get-rollout-status: << parameters.get-rollout-status >>
      namespace: << parameters.namespace >>
      pinned-revision-to-watch: << parameters.pinned-revision-to-watch >>
      record: << parameters.record >>
      resource-name: << parameters.resource-name >>
      show-kubectl-command: << parameters.show-kubectl-command >>
      watch-rollout-status: << parameters.watch-rollout-status >>
      watch-timeout: << parameters.watch-timeout >>
```

## アプリケーションを Heroku にデプロイする {#header4}

Heroku プラットフォームは、完全にスケーラブルなクラウドベースのプラットフォームです。アプリケーションをすばやく簡単に配信およびデプロイすることができます。 CircleCI のビルドと Orb を使用して、いくつかのシンプルなステップを実施することで、デプロイ プロセスを簡略化できます。そのステップについて以下のセクションで説明します。

### 前提条件

アプリケーションを Heroku プラットフォームにデプロイする前に、以下の要件を満たしていることを確認してください。

* CircleCI プラットフォームと CircleCI Orb を使用するように環境が構成されている
* Heroku CLI がインストールされている

#### Heroku CLI をインストールする

まだ Heroku CLI がインストールされていない場合は、Heroku CLI をインストールし、Heroku プラットフォームにアプリケーションをデプロイできるようにします。 以下の手順で Heroku CLI をインストールします。

```yaml
version: 2.1
commands:
  install:
    steps:
      - run:
          name: "Heroku CLI のインストール (必要時)"
          command: |
            if [[ $(command -v heroku) == "" ]]; then
              curl https://cli-assets.heroku.com/install.sh | sh
            else
              echo "Heroku is already installed. No operation was performed."
            fi
```

### Git を使用して Heroku プラットフォームにアプリケーションをデプロイする

CircleCI プラットフォームと Orb を使用できるように環境を構成し、(必要に応じて) Heroku CLI のインストールも完了したので、次は Git を使用して Heroku プラットフォームにアプリケーションをデプロイします。 Git を使用することで、デプロイ プロセスが簡略化され、わずか 1 つのステップを実行するだけでアプリケーションをすばやく簡単に Heroku プラットフォームにデプロイできます。

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@0.0.10
workflows:
  heroku_deploy:
    jobs:
      - heroku/deploy-via-git
```

上の例のように、CircleCI Heroku Orb (`circleci/heroku@0.0.10`) が呼び出されると、`heroku-deploy` ワークフローが開始され、`deploy-via-git` ジョブを実行できるようになります。

CircleCI Heroku Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/heroku)を参照してください。

## CircleCI ジョブでカスタム Slack 通知を利用する {#header5}

Slack は、リアルタイム コラボレーション アプリケーションです。チーム メンバーは、カスタムのチャンネルやワークスペースを通じて、定型業務やプロジェクトに協力して取り組むことができます。 CircleCI プラットフォームを使用するときには、チームのニーズと要件に基づいて Slack アプリのカスタム通知を有効にしておくと便利です。

### 前提条件

CircleCI プラットフォームを使用しながら Slack のカスタム通知を有効にする前に、環境が CircleCI プラットフォームおよび Orb を活用できるように適切に構成されていることを確認してください。

### Slack チャンネルに承認待ちを通知する

CircleCI Slack Orb を使用すると、さまざまな通知やメッセージを作成して必要な受信者に配信できます。 その 1 つである「承認」通知を作成すると、承認が保留中であることを受信者に通知できるようになります。 CircleCI ジョブでこの承認通知を作成する例を以下に示します。

```yaml
version: 2.1
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
workflows:
  your-workflow:
    jobs:
      - slack/approval-notification:
          message: Pending approval
          webhook: webhook
```
上の例では、ワークフローを実行する前に、まず `circleci/slack@1.0.0` Orb を呼び出す必要があることに注意してください。これで、`message` や `webhook` を関連付けて通知を送信できるようになります。

この Orb とその機能の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/slack)の Slack Orb を参照してください。

### カスタム メッセージを付けて Slack チャンネルに通知する

CircleCI Slack Orb では、カスタム メッセージを含む通知も作成できます。 この種類の通知は、ワークフロー、ジョブ、またはプロジェクトに固有の詳細なメッセージを受信者に配信したいときに便利です。

カスタム メッセージを作成して特定の Slack チャンネルでユーザーに配信する例を以下に示します。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
workflows:
  your-workflow:
    jobs:
      - build
```

Docker イメージをビルドしたら、以下のステップを実行してカスタム通知を作成します。

1. メッセージ テキストの `color` を指定します。
2. メッセージの受信者 (`mentions`) を指定します。
3. 配信したいテキストを `message` に入力します。
4. メッセージの `webhook` を指定します。Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

上記のステップを実行してから、CircleCI Slack Orb (`circleci/slack@1.0.0`) を呼び出すと、ワークフローが開始されて通知が配信されます。

### ジョブの終了時に成功または失敗のステータス アラートを送信する

ジョブの終了時に受信者にステータス アラートを送信することも可能です。 このステータス アラートの送信は、ジョブの最後のステップにする必要があります。

ジョブの終了時にステータス アラートを送信する例を以下に示します。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: <docker image>
    steps:
      - run: exit 0
      - slack/status:
          fail_only: 'true'
          mentions: 'USERID1,USERID2'
          only_for_branch: only_for_branch
          webhook: webhook
orbs:
  slack: circleci/slack@1.0.0
version: 2.1
```
上の例では、ジョブが実行されて失敗した場合に、Slack ステータス アラートが受信者 (USERID1、USERID2) に送信されます。

この Orb とその機能の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/slack)の Slack Orb を参照してください。
