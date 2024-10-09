---
layout: classic-docs
title: "CircleCI 設定クックブック"
short-title: "設定クックブック"
description: "設定クックブック入門編"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

*CircleCI 設定クックブック*は、 Orb のような CircleCI のリソースを使用してさまざまな設定タスクを行うための詳しい手順について、ユースケースごとにまとめた「レシピ集」です。 このクックブックと関連セクションを参照することで、CircleCI プラットフォームで繰り返し行われるタスクをすばやく簡単に実行できるようになります。

* 目次
{:toc}

## はじめに
{: #introduction }

本ガイドおよび関連レシピでは、具体的な設定タスクを実行する方法を説明します。 レシピにはプロジェクトに合わせてカスタマイズできるよう、コードスニペットや設定例も記載されています。 このクックブックの各レシピは、それぞれ 1 つのタスクについて記載されています。 これらのタスクは、CircleCI Orb などの CircleCI リソースに加えて、ユーザー独自のリソースを使用して CircleCI プラットフォームで実行できます。

### CircleCI Orb とは
{: #what-are-circleci-orbs }
{:.no_toc}

CircleCI Orb は、CircleCI プラットフォームを効率的に使用するための設定パッケージです。 Orb を使用すると、複数のプロジェクトで設定を共有、標準化、簡略化することができます。 設定のベスト プラクティスの参考として Orb を使用することも可能です。

現在提供されている Orb の一覧は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)にて確認してください。

既存の Orb を 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/#orbs-version-21-が必須) ファイルで使用するには、`orbs` キーを使用して呼び出します。 以下の例では、`circleci` 名前空間で [`node` Orb](https://circleci.com/developer/orbs/orb/circleci/node) を呼び出します。

```yaml
version: 2.1

orbs:
  node: circleci/node@x.y #Orb バージョン

workflows:
  test_my_app:
    jobs:
      - node/test:
          version: <node-version>
```

CircleCI Orb の詳細については、[Orb の概要]({{ site.baseurl }}/2.0/orb-intro/)を参照してください。

## CircleCI プラットフォームおよび Orb を使用するための環境構成
{: #configure-your-environment-for-circleci-pipelines-and-orbs }
{:.no_toc}

このクックブックのほとんどのレシピでは、バージョン 2.1 の設定、パイプラインおよびOrb が必要です。 記載されている例を使用する前に、これらの機能が設定済みであることを確認してください。 必要に応じて、以下の注意事項や手順を実行してください。

* パイプラインの機能や Orb を使用するには、`version 2.1` の設定ファイルを使用する必要があります。
* `<docker-image-name-tag>` を使ってどこで[ジョブに Docker イメージ]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice)を指定するかを記載しました。
* `version 2.0` の設定ファイルを引き続き使用する場合や CircleCI Server v2.x をご使用の場合も、[Orb レジストリ](https://circleci.com/developer/orbs)で幅広い Orb ソースを参照し、それぞれのジョブやコマンドのビルド方法をご覧いただけるためこのレシピを活用してください。
* このページの Orb を使用したサンプルでは、例えば`aws-s3: circleci/aws-s3@x.y.z`のように Orb はタグによるバージョンがつけられてています。 サンプルをコピー & ペーストする場合は、`x.y.z` を特定のバージョンの値に変更する必要があります。 使用可能なバージョンについては、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)の各 Orb のページを参照してください。
* `< >`の間の項目は、すべてご自身のパラメーターに置き換える必要があります。

## 変更を Amazon ECS にデプロイする
{: #deploy-changes-to-amazon-ecs }

Amazon Elastic Container Service (ECS) は、スケーラブルなコンテナ オーケストレーション サービスです。 Docker コンテナをサポートし、コンテナ化されたアプリケーションを AWS で実行およびスケールできます。 Amazon ECS を使用することにより、独自のコンテナ オーケストレーション ソフトウェアをインストール・設定せずに済むため、デプロイの複雑性を軽減し、CircleCI プラットフォームでコンテナをシンプルかつ最適にデプロイすることができます。 このセクションでは、CircleCI Orb を使用してソフトウェアの変更を Amazon ECS サービスにすばやく簡単にデプロイする方法を説明しますが、Amazon ECS サービスの機能や基本的なコンポーネントとアーキテクチャについての詳細情報については、[Amazon ECS のドキュメント](https://https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html)を参照してください。

### 環境変数の設定
{: #setting-environment-variables }
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

* `AWS_ECR_ACCOUNT_URL`
* `MY_APP_PREFIX`
* `AWS_REGION`
* `AWS_ACCESS_KEY_ID`

これらの環境変数の設定方法の詳細については、[環境変数の使用]({{site.baseurl}}/2.0/env-vars/)のページを参照してください。

**注: **このサンプルで使用されている `CIRCLE_SHA1` は組み込まれており、いつでも使用できます。

### サービスの更新のビルド、プッシュ、およびデプロイ
{: #build-push-and-deploy-a-service-update }

[ AWS サービスの更新](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html)をAWS ECR から新しくビルドされたイメージをデプロイするように設定するには、 Orb を使って設定をできる限りシンプルにすることが可能です。つまり、`aws-ecr` Orb で更新されたイメージをビルドして ECR にプッシュし、 `aws-ecs` Orb でサービスの更新をデプロイします。

以下の例では、イメージをビルドして AWS ECR にプッシュし、そのイメージをサービスの更新として AWS ECS にプッシュする方法を示しています。

```yaml
version: 2.1 # 2.1 config required to use orbs

orbs:
  aws-ecr: circleci/aws-ecr@x.y.z # invoke the AWS ECR orb
  aws-ecs: circleci/aws-ecs@x.y.z # invoke the AWS ECS orb

workflows:
  build-and-deploy:
    jobs:
      - aws-ecr/build-and-push-image: # orb built-in job
          repo: '${MY_APP_PREFIX}'
          tag: '${CIRCLE_SHA1}'
      - aws-ecs/deploy-service-update: # orb built-in job
          requires:
            - aws-ecr/build-and-push-image
          family: '${MY_APP_PREFIX}-service'
          cluster-name: '${MY_APP_PREFIX}-cluster'
          container-image-name-updates: 'container=${MY_APP_PREFIX}-service,tag=${CIRCLE_SHA1}'
```

使用方法のオプションと Orb エレメントの全リストについては、 CircleCI Orb レジストリの[AWS-ECS Orb のページ](https://circleci.com/developer/orbs/orb/circleci/aws-ecs)を参照してください。

### Amazon ECS サービスの更新を検証する
{: #verify-the-aws-ecs-service-update }

Amazon ECS サービスの更新が完了したら、更新が正しく行われたかを検証することができます。 設定をできる限りシンプルにするために、AWS CLI Orbと ECS Orb を使います。 ここでは、 Orb の組み込みジョブを使用して必要なプロセスを実行するのではなく、 Orb からのコマンドを `verify-deployment` という名前のジョブの定義のステップとして使用します。

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@x.y.z
  aws-ecs: circleci/aws-ecs@x.y.z

jobs:
  verify-deployment:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - aws-cli/install
      - aws-cli/configure:
          aws-access-key-id: $AWS_ACCESS_KEY_ID
          aws-region: $AWS_REGION
      - run:
          name: Get last task definition
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

この例は、Orb を使用して AWS CLI をインストールおよび設定し、以前デプロイされた[タスク定義](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)を取得し、`AWS-ECS` Orb から `verify-revision-is-deployed` コマンドを使用して、このリビジョンがデプロイされたかどうかを_検証_する方法を示しています。 イメージを設定して Amazon ECS にプッシュする方法の詳細については、[AWS ECR Orb のサンプル]({{site.baseurl}}/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples)を参照してください。

Amazon EKS サービスを使用する前に、以下の要件を満たしていることを確認してください。

## Google Kubernetes Engine (GKE) との連携
{: #interact-with-google-kubernetes-engine-gke }

Google Kubernetes Engine (GKE) を利用すると、CI/CD 戦略を自動化して、コードやアプリケーションの更新をすばやく簡単にデプロイすることができ、更新の配信に長時間かかることはありません。 CircleCI は、GKE 固有の CircleCI Orb を開発すると共に GKE のテクノロジーを活用して、特定のジョブ内での GKE との連携を可能にしました。 GKE を使用する前に、[Google Kubernetes Engine のドキュメント](https://cloud.google.com/kubernetes-engine/docs/)をご一読ください。

### 環境変数の設定
{: #set-environment-variables }
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

- `GCLOUD_SERVICE_KEY` (必須)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

これらの環境変数の設定方法の詳細については、[環境変数の使用]({{site.baseurl}}/ja/2.0/env-vars/)のページを参照してください。

### クラスタの作成と削除
{: #creating-and-deleting-clusters }
CircleCI GKE Orb を使うと最小限の設定で複雑なアクションを実行することができます。 たとえば、前のセクションで説明した環境変数を設定した後、次のスニペットを使用して新しい GKE クラスタを作成できます。

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  main:
    jobs:
      - gke/create-cluster:
          cluster: gcp-testing
```

以下により、クラスタを削除できます。

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  main:
    jobs:
      - gke/delete-cluster:
          cluster: gcp-testing
```

### GKE クラスタにイメージをパブリッシュおよびロールアウトする
{: #publishing-and-rolling-out-the-image-to-the-gke-cluster }

CircleCI GKE Orb を使用すると、以下の例のようにとても簡単に Docker イメージをパブリッシュして GKE クラスタにロールアウトすることができます。 必要なのは、Orb に組み込まれている `publish-and-rollout-image`コマンドと、いくつかの必須パラメータの定義のみです。 このジョブに使用できるパラメーターの全リストは、CircleCI Orb レジストリの[GKE](https://circleci.com/developer/orbs/orb/circleci/gcp-gke?version=1.0.4#jobs-publish-and-rollout-image)のページをご覧ください。

```yaml
version: 2.1

orbs:
  gke: circleci/gcp-gke@x.y.z

workflows:
  my-workflow:
    jobs:
      - gke/publish-and-rollout-image:
          cluster: <my-cluster-name>
          container: <my-kubernetes-container-name>
          deployment: <my-kubernetes-deployment-name>
          image: <my-docker-image-name>
```

## Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する
{: #using-amazon-elastic-container-service-for-kubernetes-amazon-eks }

CircleCIでは、Amazon Elastic Kubernetes Service（EKS）と連携して使用できるKubernetes Orbを提供しています。 この Orb では以下のタスクを行うことができます。

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

CircleCI AWS-EKSのorbを使用する前に、CircleCI Orb レジストリページの [AWS-EKS](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start) Orbの仕様を確認しておくとよいでしょう。

### EKS クラスタを作成する
{: #create-an-eks-cluster }

この`aws-eks` Orb を使用して、以下のサンプルようなコードにより EKS クラスタを作成、テスト、破棄することができます。

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z
  kubernetes: circleci/kubernetes@x.y.z

jobs:
  test-cluster:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          Name of the EKS cluster
        type: string
    steps:
      - kubernetes/install
      - aws-eks/update-kubeconfig-with-authenticator:
          cluster-name: << parameters.cluster-name >>
      - run:
          command: |
            kubectl get services
          name: Test cluster


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

このサンプルでは２つの Orb が使用されており、 クラスタの作成、テスト、破棄には、`aws-eks` Orb に組み込まれているジョブやコマンドが使われています。 `kubectl`のインストるには、`kubernetes` Orb に組み込まれている `install` コマンドが使われています。

### Kubernetes デプロイの作成
{: #create-a-kubernetes-deployment }

Kubernetes デプロイを作成します。これにより、クラスタの管理など、以下のようなさまざまなアクションをクラスタ内で実行できるようになります。

* クラスタ内のリソースの更新
* Authenticator を使用した Kubernetes 設定の更新
* コンテナイメージの更新

Kubernetes デプロイを作成するコードの例を示します。

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z
  kubernetes: circleci/kubernetes@x.y.z

jobs:
  create-deployment:
    executor: aws-eks/python3
    parameters:
      cluster-name:
        description: |
          Name of the EKS cluster
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

### クラスタに Helm Chart をインストールする
{: #install-a-helm-chart-in-your-cluster }

Helm は、Kubernetes クラスタ上で実行される強力なアプリケーション パッケージ マネージャーです。 Helm Chart を使用することで、アプリケーション構造を記述し、シンプルなコマンドによってその構造を管理できます。 Helm では、関連する Kubernetes リソース一式を記述するファイルが、チャートと呼ばれるパッケージ形式に集約されます。 1 つのチャートを使用して、memcached ポッドのような単純なアプリケーションから、HTTP サーバー、データベース、キャッシュなどから成る完全な Web アプリ スタックのような複雑なアプリケーションまで、幅広くデプロイできます。

`aws-eks`により、Kubernetes クラスタに Helm をインストールし、Orb に組み込まれているジョブにより、Helm Chart をインストールできます。 以下はそのためのコード例です。プロセスの最後でリリースとクラスタを削除すると、クリーンアップされます。

```yaml
version: 2.1

orbs:
  aws-eks: circleci/aws-eks@x.y.z

workflows:
  deployment:
    jobs:
      - aws-eks/create-cluster:
          cluster-name: my-eks-helm-demo
      - aws-eks/install-helm-on-cluster:
          cluster-name: my-eks-helm-demo
          enable-cluster-wide-admin-access: true
          requires:
            - aws-eks/create-cluster
      - aws-eks/install-helm-chart:
          chart: stable/grafana
          cluster-name: my-eks-helm-demo
          release-name: grafana-release
          requires:
            - aws-eks/install-helm-on-cluster
      - aws-eks/delete-helm-release:
          cluster-name: my-eks-helm-demo
          release-name: grafana-release
          requires:
            - aws-eks/install-helm-chart
      - aws-eks/delete-cluster:
          cluster-name: my-eks-helm-demo
          requires:
            - aws-eks/delete-helm-release
```

## CircleCI ジョブでカスタム Slack 通知を利用する
{: #enabling-custom-slack-notifications-in-circleci-jobs }

Slack は、リアルタイム コラボレーション アプリケーションです。 チーム メンバーは、カスタムのチャンネルやワークスペースを通じて、定型業務やプロジェクトに協力して取り組むことができます。 CircleCI プラットフォームを使用するときには、チームのニーズと要件に基づいて Slack アプリのカスタム通知を有効にしておくと便利です。

### 承認待ちの状態を Slack チャンネルに通知する
{: #notifying-a-slack-channel-of-pending-approval }

[CircleCI Slack Orb](https://circleci.com/developer/orbs/orb/circleci/slack) を使用すると、さまざまな通知やメッセージを作成して必要な受信者に配信できます。 その 1 つである「承認」通知を作成すると、承認が保留中であることを受信者に通知できるようになります。 CircleCI ジョブでこの承認通知を作成する例を以下に示します。

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

workflows:
  your-workflow:
    jobs:
      - slack/approval-notification:
          message: Pending approval
          webhook: webhook
```
上の例では、ワークフローを実行する前に、まず `circleci/slack@x.y.z` Orb を呼び出す必要があることに注意してください。これで、`message` や `webhook` を関連付けて通知を送信できるようになります。

ここに記載されていない Slack 通知をカスタマイズするパラメータが多数あります。 この Orb とその機能の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/slack)の Slack Orb を参照してください。

### カスタムメッセージを Slack チャンネルに通知する
{: #notifying-a-slack-channel-with-custom-messages }

CircleCI Slack Orb では、お客様が作成したカスタムメッセージによる通知も作成できます。 この種類の通知は、ワークフロー、ジョブ、またはプロジェクトに固有の詳細なメッセージを受信者に配信したいときに便利です。

カスタム メッセージを作成して特定の Slack チャンネルでユーザーに配信する例を以下に示します。

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

jobs:
  build:
    docker:
      - image: <docker-image-name-tag>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - slack/notify:
          color: '#42e2f4'
          mentions: 'USERID1,USERID2,'
          message: This is a custom message notification
          webhook: webhook

workflows:
  your-workflow:
    jobs:
      - build
```

この例では、 Slack Orb の `notify` と以下のパラメーターを使用してカスタム通知が作成されています。

1. メッセージ テキストの `color` を指定します。
2. メッセージの受信者 (`mentions`) を指定します。
3. 配信したいテキストを `message` に入力します。
4. メッセージの `webhook` を指定します。 Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

### ジョブの終了時に成功または失敗のステータスアラートを送信する
{: #sending-a-status-alert-at-the-end-of-a-job-based-on-success-or-failure }

ジョブの終了時に受信者にステータスアラートを送信することも可能です。 このステータスアラートの送信は、ジョブの最後のステップにする必要があります。

ジョブの終了時にステータスアラートを送信する例を以下に示します。

```yaml
version: 2.1

orbs:
  slack: circleci/slack@x.y.z

jobs:
  build:
    docker:
      - image: <docker image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: exit 0
      - slack/status:
          fail_only: 'true'
          mentions: 'USERID1,USERID2'
          only_for_branch: your-branch-name
          webhook: webhook
```

上の例では、ジョブが実行されて失敗した場合に、Slack ステータスアラートが受信者 (USERID1、USERID2) に送信されます。

この Orb とその機能の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/orbs/orb/circleci/slack)の Slack Orb を参照してください。

## パイプラインのパラメーターを使って実行するワークフローを選択する
{: #selecting-a-workflow-to-run-using-pipeline-parameters }

API を使用して特定のワークフローを手動で実行しながら、プロジェクトへのプッシュごとにワークフローを実行できるようにしたい場合があります。 これを行うには、 [パイプラインのパラメーター]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-parameters-in-configuration)を使用して、実行するワークフローを決定します。

以下の例ではデフォルトで`build`ワークフローを実行し、API を使用して他にどのワークフローを実行するか制御することができます。

```yaml
version: 2.1

parameters:
  action:
    type: enum
    enum: [build, report]
    default: build

jobs:
  build:
    machine: true
    steps:
      - checkout
      - run: ./run-tests.sh

  report:
    machine: true
    steps:
      - checkout
      - run: ./create-report.sh

workflows:
  build:
    when:
      equal: [ build, << pipeline.parameters.action >> ]
    jobs:
      - build

  report:
    when:
      equal: [ report, << pipeline.parameters.action >> ]
    jobs:
      - report
```

この `action `パラメーターは、プロジェクトへのプッシュ時にデフォルトで `build`されます。 次に、API v2 の [新しいパイプラインのトリガ ]({{ site.baseurl }}/api/v2/#operation/triggerPipeline)エンドポイントを使って別のワークフローを選択するために、`action` に別の値を指定する例を示します。この例では、`report` という名前のワークフローが実行されます。 [`project-slug`]({{ site.baseurl }}/2.0/api-developers-guide/#getting-started-with-the-api)をご自身の値に置き換えてください。

```shell
curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Circle-Token: API_KEY' \
  -d '{ "parameters": { "action": report } }'
```

API v2 エンドポイントに使用に関する詳細は、[API Reference]({{ site.baseurl }}/api/v2/) や [API API Developers Guide Worked Example]({{ site.baseurl }}/2.0/api-developers-guide/#example-end-to-end-api-request) を参照してください。

## ジョブのステップでのブランチのフィルタリング
{: #branch-filtering-for-job-steps }

ブランチのフィルタリングは、以前はワークフローでのみ可能でしたが、コンパイル時のロジックステートメントによりジョブのステップでもブランチのフィルタリングが可能です。

以下の例では、[パイプラインの値、]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values)`pipeline.git.branch` を使っていつステップを実行するか (`when`)を制御する方法を紹介します。 この例では、コミットがメインブランチに置かれた場合のみ `run: echo "I am on main"` ステップを実行します。

```yaml
version: 2.1

jobs:
  my-job:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - when:
          condition:
            equal: [ main, << pipeline.git.branch >> ]
          steps:
            - run: echo "I am on main"

workflows:
  my-workflow:
    jobs:
      - my-job
```

## ダイナミックコンフィグ
{: #dynamic-configuration }

このセクションでは、[ダイナミックコンフィグ]({{ site.baseurl }}/2.0/dynamic-config)セクションを既にお読みになっていること、 [入門ガイド]({{ site.baseurl }}/2.0/dynamic-config#getting-started-with-dynamic-config-in-circleci)に記載されている手順が実行済みであることを前提としています。

下記では、ダイナミックコンフィグの使用方法を説明します。

- [基本的な例]({{ site.baseurl }}/ja/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
- [変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する]({{ site.baseurl }}/ja/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)

### 基本的な例
{: #a-basic-example }

以下は、CircleCI のダイナミックコンフィグ機能を使用した基本的な例です。 この例では、`generate-config` スクリプトが既に存在することを前提としています。 このスクリプトは、行う処理の種類に基づいて新しい YAML 設定ファイルを出力します。 この過程で、`git` 履歴、パイプラインに渡される値、[`ジョブ`]({{ site.baseurl }}/2.0/configuration-reference/#jobs) 内で行われる処理などの確認を行うことができます。

```yaml
version: 2.1

# CircleCI のダイナミック コンフィグ機能を有効にする。
setup: true

# ダイナミック コンフィグの使用には continuation Orb が必要。
orbs:
  continuation: circleci/continuation@0.1.2

# ジョブとステップの定義
jobs:
  setup:
    executor: continuation/default
    steps:
      - checkout # コードのチェックアウト
      - run: # コマンドの実行
          name: 設定ファイルの生成
          command: |
            ./generate-config > generated_config.yml
      - continuation/continue:
          configuration_path: generated_config.yml # 新しく生成した設定ファイルを使用して続行

# 上記で定義した setup ジョブをトリガーする 1 つのワークフロー。
workflows:
  setup:
    jobs:
      - setup
```

上記の設定ファイルは、以下のように構成されています。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- ダイナミック コンフィグ機能を使用するために `continuation` Orb を呼び出します。
- `continuation` Orb を [`executor`]({{ site.baseurl }}/2.0/executor-intro/) として使用する `setup` というジョブを定義します。 このジョブでは、下記の処理を行います。
    - [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを呼び出して、設定されたリポジトリからコードをチェックアウトします。
    - [`run`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップにより `generate-config` スクリプトを呼び出し、 `continuation` Orb の `continue` ジョブに受け渡すデータを生成します。
    - 必須の `configuration_path` に指定された設定ファイルに基づいて、パイプラインの実行が続行されます。
- 最後に、`workflows` において、上記で定義された `setup` ジョブを呼び出します。

**注: **パイプラインの設定では、1 つの `config.yml` でダイナミックコンフィグの機能を使用して実行できるワークフローの数は 1 つに制限されています。 このセットアップ ワークフローには後続のワークフローを起動するためのワンタイムトークンが割り当てられます。 このセットアップ ワークフローはカスケードしないため、後続のワークフローが独自にさらに後に続くワークフローを起動することはできません。

`continuation` Orb の内容の詳細については、当該 Orb のソースコードを [CircleCI Developer Hub](https://circleci.com/developer/orbs/orb/circleci/continuation?version=0.1.2) で閲覧することや、 [ダイナミックコンフィグの FAQ]({{ site.baseurl }}/2.0/dynamic-config#dynamic-config-faqs) を参照することで確認できます。

### 変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する
{: #execute-specific-workflows-or-steps-based-on-which-files-are-modified }

`ワークフロー`や`ステップ`を実行するかどうかを、特定のファイルセットに対して行われた変更に応じて決定したい場合があります。 条件に応じた実行は、コードやマイクロ サービスがモノレポ (単一のリポジトリ) に格納されている場合に役立ちます。

これを可能にするために、CircleCI には [`path-filtering`](https://circleci.com/developer/ja/orbs/orb/circleci/path-filtering) Orb が用意されています。この Orb により、更新対象ファイルの具体的なパスに基づいて、パイプラインの実行を続行できます。

たとえば、以下のようのモノレポ構成があります。

```shell
.
├── .circleci
│   ├── config.yml
│   └── continue_config.yml
├── service1
│   ├── Service1.java
├── service2
│   ├── Service2.java
├── tests
│   ├── IntegrationTests.java
```

上記のような状況におけるダイナミック コンフィグの実装例が、以下の `config.yml` および `continue_config.yml` です:

#### config.yml
{: #configyml }

```yaml
version: 2.1

# this allows you to use CircleCI's dynamic configuration feature
setup: true

# the path-filtering orb is required to continue a pipeline based on
# the path of an updated fileset
orbs:
  path-filtering: circleci/path-filtering@0.1.1

workflows:
  # the always-run workflow is always triggered, regardless of the pipeline parameters.
  always-run:
    jobs:
      # the path-filtering/filter job determines which pipeline
      # parameters to update.
      - path-filtering/filter:
          name: check-updated-files
          # 3-column, whitespace-delimited mapping. One mapping per
          # line:
          # <regex path-to-test> <parameter-to-set> <value-of-pipeline-parameter>
          mapping: |
            service1/.* run-build-service-1-job true
            service2/.* run-build-service-2-job true
          base-revision: main
          # this is the path of the configuration we should trigger once
          # path filtering and pipeline parameter value updates are
          # complete. In this case, we are using the parent dynamic
          # configuration itself.
          config-path: .circleci/continue_config.yml
```

#### continue_config.yml
{: #continueconfigyml }

```yaml
version: 2.1

orbs:
  maven: circleci/maven@1.2.0

# the default pipeline parameters, which will be updated according to
# the results of the path-filtering orb
parameters:
  run-build-service-1-job:
    type: boolean
    default: false
  run-build-service-2-job:
    type: boolean
    default: false

# here we specify our workflows, most of which are conditionally
# executed based upon pipeline parameter values. Each workflow calls a
# specific job defined above, in the jobs section.
workflows:
  # when pipeline parameter, run-build-service-1-job is true, the
  # build-service-1 job is triggered.
  service-1:
    when: << pipeline.parameters.run-build-service-1-job >>
    jobs:
      - maven/test:
          name: build-service-1
          command: 'install -DskipTests'
          app_src_directory: 'service1'
  # when pipeline parameter, run-build-service-2-job is true, the
  # build-service-2 job is triggered.
  service-2:
    when: << pipeline.parameters.run-build-service-2-job >>
    jobs:
      - maven/test:
          name: build-service-2
          command: 'install -DskipTests'
          app_src_directory: 'service2'
  # when pipeline parameter, run-build-service-1-job OR
  # run-build-service-2-job is true, run-integration-tests job is
  # triggered. see:
  # https://circleci.com/docs/2.0/configuration-reference/#logic-statements
  # for more information.
  run-integration-tests:
    when:
      or: [<< pipeline.parameters.run-build-service-1-job >>, << pipeline.parameters.run-build-service-2-job >>]
    jobs:
      - maven/test:
          name: run-integration-tests
          command: '-X verify'
          app_src_directory: 'tests'
```

上記の設定ファイルは、以下のように設定されています。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- `path-filtering` Orb と `maven` Orb を呼び出して、使用できるようにします。
- `run-build-service-1-job` と `run-build-service-2-job` という 2 つのブール値パイプラインパラメーターを定義します。
- `check-updated-files`、`build-service-1`、`build-service-2`、`run-integration-tests` という 4 つのジョブを定義します。
  - `check-updated-files` ジョブ: `path-filtering` Orb を使用して、指定されたファイルパスのどのファイルに変更が加えられたのかを判断します。 また、指定されたパイプラインパラメーターに所定の値を設定します。 今回は、変更されたファイルに応じて各種 maven コマンドがトリガーされるようにしています。
  - `build-service-1` ジョブ: `maven` Orb を使用して service2 コードのコンパイルとインストールを行います。 テストはスキップします。
  - `build-service-2` ジョブ: `maven` Orb を使用して service2 コードのコンパイルとインストールを行います。 テストはスキップします。
  - `run-integration-tests` ジョブ: `maven` Orb を使用して結合テストを行います。
- 以下の 4 つのワークフローを定義します。 そのうち、3 つのワークフローは条件に従って実行されます。
  - `service-1` ワークフロー: run-build-service-1-job にマッピングされたパイプライン パラメータの値が `true` の場合に `build-service-1` ジョブをトリガーします。
  - `service-2` ワークフロー: run-build-service-2-job にマッピングされたパイプライン パラメータの値が `true` の場合に `build-service-2` ジョブをトリガーします。
  - `run-integration-tests` ワークフロー: `path-filtering` Orb の実行結果に基づいて `run-build-service-1-job` または `run-build-service-2-job` パイプライン パラメータの値が `true` に更新された場合に実行されます。
  - `check-updated-files` ワークフロー: このパイプラインがトリガーされた場合に必ず実行されます。

利用可能な機能や必要なパラメータなどの詳細については、`path-filtering` [Orb のドキュメント](https://circleci.com/developer/orbs/orb/circleci/path-filtering) を参照してください。

## マトリックスジョブを使用して、複数の OS テストを実行する
{: #use-matrix-jobs-to-run-multiple-os-tests }

マトリックスジョブを使用すると、パラメータを使用して、異なる引数でジョブを複数回実行することができます。 これは、複数のオペレーティングシステムでのテストや、異なる言語 / ライブラリバージョンに対するテストなど、多くの用途に役立ちます。

以下の例では、`test`ジョブが Linux コンテナ、Linux VM、macOS 環境で実行されます。 `test` ジョブの各実行において OS と Node.js の両方のバージョンを設定するために異なるパラメーターが渡されます。

```yaml
version: 2.1

orbs:
  node: circleci/node@4.7

executors:
  docker: # Docker using the Base Convenience Image
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  linux: # a Linux VM running Ubuntu 20.04
    machine:
      image: ubuntu-2004:202107-02
  macos: # macos executor running Xcode
    macos:
      xcode: 12.5.1

jobs:
  test:
    parameters:
      os:
        type: executor
      node-version:
        type: string
    executor: << parameters.os >>
    steps:
      - checkout
      - node/install:
          node-version: << parameters.node-version >>
          install-yarn: true

workflows:
  all-tests:
    jobs:
      - test:
          matrix:
            parameters:
              os: [docker, linux, macos]
              node-version: ["14.17.6", "16.9.0"]
```

このマトリックスの拡張バージョンでは、 `all-tests` ワークフローの下で以下の一連のジョブが実行されます。

```
    - test-14.17.6-docker
    - test-16.9.0-docker
    - test-14.17.6-linux
    - test-16.9.0-linux
    - test-14.17.6-macos
    - test-16.9.0-macos
```

マトリックスジョブに関する詳細は、[設定のリファレンス]({{ site.baseurl }}/ja/2.0/configuration-reference/#matrix-requires-version-21)を参照してください。
