---
layout: classic-docs
title: "CircleCI 構成クックブック"
short-title: "構成クックブック"
description: "構成クックブック入門編"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

*CircleCI 構成クックブック*は、CircleCI のリソース (CircleCI やパートナーの承認済み Orbs など) を使用してさまざまな構成タスクを行うための詳しい手順について、ユースケースごとにまとめた「レシピ集」です。 このクックブックと関連セクションを参照することで、CircleCI プラットフォームで繰り返し行われるタスクをすばやく簡単に実行できるようになります。

* 目次
{:toc}

## はじめに
{: #introduction }

This page, and its associated recipes, describes how you can perform specific configuration tasks. Recipes include code snippets and examples for you to customize to fit your projects. この「クックブック」の「レシピ」はそれぞれ 1 つのタスクに対応します。 これらのタスクは、CircleCI Orb などの CircleCI リソースに加えて、ユーザー独自のリソースを使用して CircleCI プラットフォームで実行できます。

### CircleCI Orb とは
{: #what-are-circleci-orbs }
{:.no_toc}

CircleCI Orb は、CircleCI プラットフォームを効率的に使用するための構成パッケージです。 Orb を使用すると、複数のプロジェクトで構成を共有、標準化、簡略化することができます。 構成のベスト プラクティスの参考として Orb を使用することも可能です。

現在提供されている Orb の一覧は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)にて確認してください。

既存の Orb を 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/#orbs-version-21-が必須) ファイルで使用するには、`orbs` キーを使用して呼び出します。 以下の例では、`circleci` 名前空間で [`hello-build` Orb](https://circleci.com/developer/ja/orbs/orb/circleci/hello-build) を呼び出します。

```yaml
version: 2.1

orbs:
  hello: circleci/hello-build@0.0.5

workflows:
  "Hello Workflow":
    jobs:
      - hello/hello-build
```

For more detailed information about CircleCI orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

## CircleCI プラットフォームおよび Orb を使用するための環境構成
{: #configure-your-environment-for-circleci-pipelines-and-orbs }
{:.no_toc}

Most recipes in this cookbook call for version 2.1 configuration, pipelines and often, orbs. Before using the examples provided, you should check that you are set up for these features. The following notes and steps will get you where you need to be.

* `GCLOUD_SERVICE_KEY` (必須)
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using a self-hosted installation of CircleCI Server, these recipes are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/developer/orbs) to see how the individual jobs and commands are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).
* Any items that appear within `< >` should be replaced with your own parameters.

## ソフトウェアの変更を Amazon ECS にデプロイする
{: #deploy-changes-to-amazon-ecs }

Amazon Elastic Container Service (ECS) は、スケーラブルなコンテナ オーケストレーション サービスです。 Docker コンテナをサポートし、コンテナ化されたアプリケーションを AWS で実行およびスケールできます。 Amazon ECS を使用することで、独自のコンテナ オーケストレーション ソフトウェアをインストール・構成せずに済むため、デプロイの複雑性を軽減し、CircleCI プラットフォームでコンテナをシンプルかつ最適にデプロイすることができます。 このセクションでは、CircleCI Orb を使用してソフトウェアの変更を Amazon ECS サービスにすばやく簡単にデプロイする方法を取り上げますが、Amazon ECS サービスの機能や基本的なコンポーネントとアーキテクチャについての詳細情報を確認したい場合は、[Amazon ECS のドキュメント](https://https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html)を参照してください。

### 構成レシピ
{: #setting-environment-variables }
CircleCI Amazon ECS/ECR Orb の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/aws-ecs)を参照してください。

* `AWS_ECR_ACCOUNT_URL`
* `MY_APP_PREFIX`
* `AWS_REGION`
* `AWS_ACCESS_KEY_ID`

CircleCI Orb を使用して、AWS CLI を更新せずに Amazon ECS サービスを更新するには、ECS サービスの更新方法を示す以下の例を参照してください。

Google Kubernetes Engine (GKE) にソフトウェアの変更をデプロイする前に以下の要件を満たしている必要があります。

### 前提条件
{: #build-push-and-deploy-a-service-update }

上の例では、2 つの Orb (`aws-cli: circleci/aws-cli@0.1.4` と `aws-ecs: circleci/aws-ecs@0.0.3`) をインスタンス化し、いくつかの連続したステップを実行して、Amazon CLI をインストール・構成してから、Amazon ECS サービスを更新しています。

The following example shows building and pushing an image to AWS ECR and pushing that image as a service update to AWS ECS:

```yml
aws-ecs: circleci/aws-ecs@0.0.10
```

Docker イメージを GKE クラスタにロールアウトしながら、これらのアクションを実行するコードの例を以下に示します。

### Amazon ECS サービスを更新する
`gcloud` のインストール (必要な場合) および初期化と、Docker イメージの更新を完了したら、この更新したイメージを後から使用できるように GKE クラスタにパブリッシュおよびロールアウトできます。

Once you have updated the Amazon ECS service, you can verify the update was correctly applied. Amazon ECS サービスの更新を検証する To keep your config as simple as possible, use the AWS CLI and ECS orbs. This time, rather than using an orb's built-in job to perform the required process, commands from the orbs are used as steps in the definition of the job named `verify-deployment`.

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

この例は、Orb を使用して AWS CLI をインストール・構成し、タスク定義を取得してから、このリビジョンがデプロイされたかどうかを検証する方法を示しています。 イメージを構成して Amazon ECS にプッシュする方法の詳細については、[AWS ECR Orb のサンプル](https://circleci.com/ja/docs/2.0/deployment-integrations/#aws-ecr-と-aws-ecs-の-orb-のサンプル)を参照してください。

Amazon EKS サービスを使用する前に、以下の要件を満たしていることを確認してください。

## ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする
{: #interact-with-google-kubernetes-engine-gke }

Google Kubernetes Engine (GKE) を利用すると、CI/CD 戦略を自動化して、コードやアプリケーションの更新を顧客にすばやく簡単にデプロイできます。 更新の配信に長い時間はかかりません。 CircleCI は、GKE 固有の CircleCI Orb を開発すると共に、GKE のテクノロジーを活用して、特定のジョブで GKE を操作できるようにしました。 GKE を使用する前に、[Google Kubernetes Engine のドキュメント](https://cloud.google.com/kubernetes-engine/docs/)をご一読ください。

### 前提条件
2) {% include snippets/enable-pipelines.md %}
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

- EKS クラスタの作成
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する

### GKE アクションを管理する
3) 既存のワークフローやジョブで `aws-eks` エレメントを使用します。
以下のステップを実行して、CircleCI と Orb を使用できるように環境を構成します。 Using the CircleCI GKE orb, you can perform complex actions with minimal configuration required. For example, once you have set the environment variable mentioned in the previous section, you can create a new GKE cluster using the following snippet:

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

To delete a cluster, all you need is:

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

### GKE クラスタにイメージをパブリッシュおよびロールアウトする
{: #publishing-and-rolling-out-the-image-to-the-gke-cluster }

CircleCI GKE Orb を使用して Google Cloud Platform (GCP) にログインし、Docker イメージをビルドおよびパブリッシュして、そのイメージを GKE クラスタにロールアウトする例を示します。 All you need is the orbs built-in command `publish-and-rollout-image`, along with definitions for a few required parameters. For a full list of of parameters available for this job, check the [GKE page](https://circleci.com/developer/orbs/orb/circleci/gcp-gke?version=1.0.4#jobs-publish-and-rollout-image) in the CircleCI Orbs Registry.

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

## Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する
**メモ:** curl が有効で、amd64 アーキテクチャが使用されていることを確認してください。

CircleCI AWS-EKS Orb を使用するための要件を満たしていることが確認できたら、以下のコード例を使用して EKS クラスタを作成できます。

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

Kubernetes デプロイを作成するコードの例を示します。

### EKS クラスタを作成する
クラスタに Helm Chart をインストールする

Using the CircleCI `aws-eks` orb, you can create, test and teardown an EKS cluster using the code sample shown below.

```yaml
orbs: aws-eks: circleci/aws-eks@0.2.1
```

In this example two orbs are used: built-in jobs and commands from the `aws-eks` orb are used to create, test and then teardown a cluster. The built-in `install` command from the `kubernetes` orb is used to install `kubectl`.

### Kubernetes デプロイの作成
CircleCI ジョブでカスタム Slack 通知を利用する

You may wish to create a Kubernetes deployment, which enables you to manage the cluster and perform different actions within the cluster, including the ability to:

* クラスタ内のリソースの更新
* Authenticator を使用した Kubernetes 構成の更新
* コンテナ イメージの更新

Slack チャンネルに承認待ちを通知する

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
      監視するリビジョンを固定します。
```

### EKS クラスタを作成する
{: #install-a-helm-chart-in-your-cluster }

Helm は、Kubernetes クラスタ上で実行される強力なアプリケーション パッケージ マネージャーです。 Helm Chart を使用することで、アプリケーション構造を記述し、シンプルなコマンドによってその構造を管理できます。 Helm では、関連する Kubernetes リソース一式を記述するファイルが、チャートと呼ばれるパッケージ形式に集約されます。 1 つのチャートを使用して、memcached ポッドのような単純なアプリケーションから、HTTP サーバー、データベース、キャッシュなどから成る完全な Web アプリ スタックのような複雑なアプリケーションまで、幅広くデプロイできます。

Kubernetes クラスタに Helm をインストールしたら、以下のコード例を使用して Helm Chart をインストールできます。 Below is a code example for this, wchich also cleans up by deleting the release and cluster at the end of the process:

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

## CircleCI ジョブでカスタム Slack 通知を利用する
カスタム メッセージを付けて Slack チャンネルに通知する

Slack は、リアルタイム コラボレーション アプリケーションです。 チーム メンバーは、カスタムのチャンネルやワークスペースを通じて、定型業務やプロジェクトに協力して取り組むことができます。 CircleCI プラットフォームを使用するときには、チームのニーズと要件に基づいて Slack アプリのカスタム通知を有効にしておくと便利です。

### Kubernetes デプロイを作成する
カスタム メッセージを作成して特定の Slack チャンネルでユーザーに配信する例を以下に示します。

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
ジョブの終了時に成功または失敗のステータス アラートを送信する

There are several parameters for you to customize your Slack notifications that aren't shown here. For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/developer/orbs/orb/circleci/slack).

### クラスタに Helm をインストールする
ジョブの終了時にステータス アラートを送信する例を以下に示します。

CircleCI Slack Orb では、カスタム メッセージを含む通知も作成できます。 この種類の通知は、ワークフロー、ジョブ、またはプロジェクトに固有の詳細なメッセージを受信者に配信したいときに便利です。

この Orb とその機能の詳細については、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/slack)の Slack Orb を参照してください。

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

In this example, the Slack orb command `notify` is used, along with the following parameters to create a custom notification:

1. メッセージ テキストの `color` を指定します。
2. メッセージの受信者 (`mentions`) を指定します。
3. 配信したいテキストを `message` に入力します。
4. メッセージの `webhook` を指定します。 Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

### コンテナ イメージを更新する
{: #sending-a-status-alert-at-the-end-of-a-job-based-on-success-or-failure }

ジョブの終了時に受信者にステータス アラートを送信することも可能です。 このステータス アラートの送信は、ジョブの最後のステップにする必要があります。

The example below shows how you can send a status alert at the end of a job.

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

上の例では、ジョブが実行されて失敗した場合に、Slack ステータス アラートが受信者 (USERID1、USERID2) に送信されます。

ジョブの終了時にステータス アラートを送信する例を以下に示します。

## Selecting a workflow to run using pipeline parameters
{: #selecting-a-workflow-to-run-using-pipeline-parameters }

You might find that you want to be able to trigger a specific workflow to run, manually, using the API, but still run a workflow on every push to your project. To achieve this, use [pipeline parameters]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) to decide which workflow(s) to run.

The following example defaults to running the `build` workflow, but allows control of which other workflow to run using the API:

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

The `action` parameter will default to `build` on pushes to the project. Below is an example of supplying a different value to `action` using the API v2 [Trigger a New Pipeline]({{ site.baseurl }}/api/v2/#operation/triggerPipeline) endpoint to select a different workflow to run, in this example, the workflow named `report` would run. Remember to substitute [`project-slug`]({{ site.baseurl }}/2.0/api-developers-guide/#getting-started-with-the-api) with your values.

```sh
curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Circle-Token: API_KEY' \
  -d '{ "parameters": { "action": report } }'
```

For more information on using API v2 endpoints, see the [API Reference Documentation]({{ site.baseurl }}/api/v2/) and the [API Developers Guide Worked Example]({{ site.baseurl }}/2.0/api-developers-guide/#example-end-to-end-api-request).

## Branch-filtering for job steps
{: #branch-filtering-for-job-steps }

Branch filtering has previously only been available for workflows, but with compile-time logic statements, you can also implement branch filtering for job steps.

The following example shows using the [pipeline value]({{ site.baseurl }}/2.0/pipeline-variables/#pipeline-values) `pipeline.git.branch` to control `when` a step should run. In this case the step `run: echo "I am on master"` only runs when the commit is on the master branch:

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
```

## ダイナミック コンフィグ
{: #dynamic-configuration }

このセクションは、「[ダイナミック コンフィグ]({{ site.baseurl }}/2.0/dynamic-config)」を読み、「[CircleCI のダイナミック コンフィグの使用を開始する]({{ site.baseurl }}/2.0/dynamic-config#getting-started-with-dynamic-config-in-circleci)」セクションに記載の手順を完了済みであることを前提としています。

ここでは、下記のダイナミック コンフィグの使用方法の例を紹介します。

- [基本的な例]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
- [変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する]({{ site.baseurl }}/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)

### 基本的な例
{: #a-basic-example }

以下に、CircleCI のダイナミック コンフィグ機能の基本的な使用例を示します。 この例では、`generate-config` スクリプトが既に存在することを前提としています。 このスクリプトは、行う処理の種類に基づいて新しい YAML 設定ファイルを出力します。 この過程で、`git` 履歴、パイプラインに渡される値、[`job`]({{ site.baseurl }}/2.0/configuration-reference/#jobs) 内で行われる処理などの検査を行うことができます。

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

上記を前提に CircleCI のダイナミック コンフィグを実装すると、`config.yml` は次のようになります。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- ダイナミック コンフィグ機能を使用するために `continuation` Orb を呼び出します。
- `continuation` Orb を [`executor`]({{ site.baseurl }}/2.0/executor-intro/) として使用する `setup` というジョブを定義します。 このジョブでは、下記の処理を行います。
    - [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを呼び出して、設定されたリポジトリからコードをチェックアウトします。
    - `continuation` Orb の処理について詳しくは、[CircleCI デベロッパー ハブ](https://circleci.com/developer/ja/orbs/orb/circleci/continuation?version=0.1.2)で Orb のソース コードを参照するか、「[ダイナミック コンフィグに関するよくあるご質問]({{ site.baseurl }}/2.0/dynamic-config#dynamic-config-faqs)」を参照してください。
    - 必須の `configuration_path` に指定された設定ファイルに基づいて、パイプラインの実行が続行されます。
- 最後に、`workflows` において、上記で定義された `setup` ジョブを呼び出します。

上記の設定ファイルは、以下のように構成されています。

利用可能な要素と必須パラメーターの詳細については、[`path-filtering` Orb のドキュメント](https://circleci.com/developer/ja/orbs/orb/circleci/path-filtering)を参照してください。

### 変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する
{: #execute-specific-workflows-or-steps-based-on-which-files-are-modified }

場合によっては、ある`ワークフロー`や`ステップ`を実行するかどうかを、特定のファイルセットに対して行われた変更に応じて決定したいことがあります。 条件に応じた実行は、コードやマイクロサービスがモノレポ (単一のリポジトリ) に格納されている場合に役立ちます。

これを可能にするために、CircleCI には [`path-filtering`](https://circleci.com/developer/ja/orbs/orb/circleci/path-filtering) Orb が用意されています。 この Orb により、更新対象ファイルの具体的なパスに基づいて、パイプラインの実行を続行できます。

たとえば、以下のようなモノレポ構造を考えてみましょう。

```shell
.
├── .circleci
│   └── config.yml
├── service1
│   ├── Service1.java
├── service2
│   ├── Service2.java
├── tests
│   ├── IntegrationTests.java
```

An example implementation of CircleCI's dynamic configuration for the above use case can be found in the following `config.yml`:

```yaml
version: 2.1

# CircleCI のダイナミック コンフィグ機能を有効にする
setup: true

# 更新対象ファイルセットのパスに基づいてパイプラインを続行するには path-filtering Orb が必要
# ダイナミック コンフィグを使用して Java プロジェクトをビルドする例として maven Orb も使用する。
orbs:
  path-filtering: circleci/path-filtering@0.0.2
  maven: circleci/maven@1.2.0

# デフォルトのパイプライン パラメーター。
path-filtering Orb の結果に応じて更新される
parameters:
  run-build-service-1-job:
    type: boolean
    default: false
  run-build-service-2-job:
    type: boolean
    default: false

# ジョブの定義
jobs:
  # check-updated-files ジョブでは path-filtering Orb を使用して、更新するパイプライン パラメーターを判断する。
  check-updated-files:
    - path-filtering/filter:
        # 空白文字で区切った 3 列のマッピング。
  check-updated-files:
    - path-filtering/filter:
        # 3-column, whitespace-delimited mapping. One mapping per line: <regex path-to-test> <parameter-to-set> <value-of-pipeline-parameter>.
        1 行につき 1 つのマッピング: <regex path-to-test> <parameter-to-set> <value-of-pipeline-parameter>
        mapping: |
          service1/.* run-build-service-1-job true
          service2/.* run-build-service-2-job true
        base-revision: master
        # パス フィルタリングとパイプライン パラメーターの値の更新が完了したらトリガーする構成ファイルのパス。 In this case, we are using the parent dynamic configuration itself.
        config-path: .circleci/config.yml
  # the build-service-1 job uses the maven orb to build and install service1 artifacts into the maven repository (it does not run tests).
  build-service-1:
    - maven/test:
        command: 'install -DskipTests'
        app_src_directory: 'service1'
  # the build-service-2 job uses the maven orb to build and install service2 artifacts into the maven repository (it does not run tests).
  build-service-2:
    - maven/test:
        command: 'install -DskipTests'
        app_src_directory: 'service2'
  # the run-integration-tests job will run any tests defined in the tests directory.
  run-integration-tests:
    - maven/test:
        command: '-X verify'
        app_src_directory: 'tests'

# here we specify our workflows, most of which are conditionally executed based upon pipeline parameter values. 
# Each workflow calls a specific job defined above, in the jobs section.
workflows:
  # when pipeline parameter, run-build-service-1-job is true, the build-service-1 job is triggered.
  # 各ワークフローでは、上記の jobs セクションで定義された特定のジョブを呼び出す。
workflows:
  # パイプライン パラメーター run-build-service-1-job が true の場合、build-service-1 ジョブがトリガーされる。
  service-1:
    when: << pipeline.parameters.run-build-service-1-job >>
    jobs:
      - build-service-1
  # パイプライン パラメーター run-build-service-2-job が true の場合、build-service-2 ジョブがトリガーされる。
  service-2:
    when: << pipeline.parameters.run-build-service-2-job >>
    jobs:
      - build-service-2
  # パイプライン パラメーター run-build-service-1-job または run-build-service-2-job が true の場合、run-integration-tests ジョブがトリガーされる。
  # 詳細は https://circleci.com/docs/ja/2.0/configuration-reference/#logic-statements を参照。
  run-integration-tests:
    when: 
      or: [<< pipeline.parameters.run-build-service-1-job >>, << pipeline.parameters.run-build-service-2-job >>]
    jobs:
      - run-integration-tests
  # check-updated-files ジョブはパイプライン パラメーターの値にかかわらず必ずトリガーされる。
  always-run:
    jobs:
      - check-updated-files
  service-2:
    when: << pipeline.parameters.run-build-service-2-job >>
    jobs:
      - build-service-2
  # when pipeline parameter, run-build-service-1-job OR run-build-service-2-job is true, run-integration-tests job is triggered.
  # see: https://circleci.com/docs/2.0/configuration-reference/#logic-statements for more information.
  run-integration-tests:
    when: 
      or: [<< pipeline.parameters.run-build-service-1-job >>, << pipeline.parameters.run-build-service-2-job >>]
    jobs:
      - run-integration-tests
  # the check-updated-files job is always triggered, regardless of pipeline parameters.
  always-run:
    jobs:
      - check-updated-files
```

上記の設定ファイルは、以下のように構成されています。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- `path-filtering` Orb と `maven` Orb を呼び出して、使用できるようにします。
- `run-build-service-1-job` と `run-build-service-2-job` という 2 つのブール値パイプライン パラメーターを定義します。
- `check-updated-files`、`build-service-1`、`build-service-2`、`run-integration-tests` という 4 つのジョブを定義します。
  - `check-updated-files` ジョブ: `path-filtering` Orb を使用して、指定されたファイルパスのどのファイルに変更が加えられたのかを判断します。 また、指定されたパイプライン パラメーターに所定の値を設定します。 今回は、変更されたファイルに応じて各種 maven コマンドがトリガーされるようにしています。
  - `build-service-1` ジョブ: `maven` Orb を使用して service1 コードのコンパイルとインストールを行います。 テストはスキップします。
  - `build-service-2` ジョブ: `maven` Orb を使用して service2 コードのコンパイルとインストールを行います。 テストはスキップします。
  - `run-integration-tests` ジョブ: `maven` Orb を使用して結合テストを行います。
- 以下の 4 つのワークフローを定義します。 そのうち、3 つのワークフローは条件に従って実行されます。
  - `service-1` ワークフロー: run-build-service-1-job にマッピングされたパイプライン パラメーターの値が `true` の場合に `build-service-1` ジョブをトリガーします。
  - `service-2` ワークフロー: run-build-service-2-job にマッピングされたパイプライン パラメーターの値が `true` の場合に `build-service-2` ジョブをトリガーします。
  - `run-integration-tests` ワークフロー: `path-filtering` Orb の結果に基づいて `run-build-service-1-job` または `run-build-service-2-job` パイプライン パラメーターの値が `true` に更新された場合に実行されます。
  - `check-updated-files` ワークフロー: このパイプラインがトリガーされた場合に必ず実行されます。

See the `path-filtering` [orb documentation](https://circleci.com/developer/orbs/orb/circleci/path-filtering) for more information on available elements and required parameters.

## Use matrix jobs to run multiple OS tests
{: #use-matrix-jobs-to-run-multiple-os-tests }

Using matrix jobs is a good way to run a job multiple times with different arguments, using parameters. There are many uses for this, including testing on multiple operating systems and against different language/library versions.

In the following example the `test` job is run across Linux, Windows and macOS environments, using two different versions of node. On each run of the `test` job different parameters are passed to set both the OS and the node version:

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

The expanded version of this matrix runs the following list of jobs under the `all-tests` workflow:

```
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

For full details of the matrix jobs specification, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#matrix-requires-version-21).
