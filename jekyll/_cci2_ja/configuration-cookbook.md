---
layout: classic-docs
title: "CircleCI config クックブック"
short-title: "Config クックブック"
description: "Config クックブック入門編"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

*CircleCI config クックブック*は、 Orb のような CircleCI のリソースを使用してさまざまな構成タスクを行うための詳しい手順について、ユースケースごとにまとめた「レシピ集」です。 このクックブックと関連セクションを参照することで、CircleCI プラットフォームで繰り返し行われるタスクをすばやく簡単に実行できるようになります。

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

* In order to use pipelines features and orbs you must use `version 2.1` config.
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using a self-hosted installation of CircleCI Server, these recipes are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/developer/orbs) to see how the individual jobs and commands are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).
* Any items that appear within `< >` should be replaced with your own parameters.

## ソフトウェアの変更を Amazon ECS にデプロイする
{: #deploy-changes-to-amazon-ecs }

Amazon Elastic Container Service (ECS) は、スケーラブルなコンテナ オーケストレーション サービスです。 Docker コンテナをサポートし、コンテナ化されたアプリケーションを AWS で実行およびスケールできます。 Amazon ECS を使用することで、独自のコンテナ オーケストレーション ソフトウェアをインストール・構成せずに済むため、デプロイの複雑性を軽減し、CircleCI プラットフォームでコンテナをシンプルかつ最適にデプロイすることができます。 このセクションでは、CircleCI Orb を使用してソフトウェアの変更を Amazon ECS サービスにすばやく簡単にデプロイする方法を取り上げますが、Amazon ECS サービスの機能や基本的なコンポーネントとアーキテクチャについての詳細情報を確認したい場合は、[Amazon ECS のドキュメント](https://https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html)を参照してください。

### 構成レシピ
{: #setting-environment-variables }
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

* `AWS_ECR_ACCOUNT_URL`
* `MY_APP_PREFIX`
* `AWS_REGION`
* `AWS_ACCESS_KEY_ID`

これらの環境変数の設定方法の詳細については、[環境変数に関するドキュメント](https://circleci.com/ja/docs/2.0/env-vars/)を参照してください。

**Note:** the `CIRCLE_SHA1` variable used in this example is built-in, so it is always available.

### Build, push and deploy a service update
{: #build-push-and-deploy-a-service-update }

To configure an [AWS service update](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html) to deploy a newly built image from AWS ECR, you can use orbs to keep your configuration as simple as possible: the `aws-ecr` orb to build and push an updated image to ECR, and the `aws-ecs` orb to deploy you service update.

The following example shows building and pushing an image to AWS ECR and pushing that image as a service update to AWS ECS:

```yml
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

For a full list of usage options and orb elements see the [AWS-ECS orb page](https://circleci.com/developer/orbs/orb/circleci/aws-ecs) in the CircleCI Orbs Registry.

### Verify the AWS ECS service update
{: #verify-the-aws-ecs-service-update }

Once you have updated the Amazon ECS service, you can verify the update was correctly applied. To keep your config as simple as possible, use the AWS CLI and ECS orbs. This time, rather than using an orb's built-in job to perform the required process, commands from the orbs are used as steps in the definition of the job named `verify-deployment`.

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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the [task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) that was previously deployed, and then _verify_ the revision has been deployed using the `verify-revision-is-deployed` command from the `AWS-ECS` orb. Refer to the [AWS ECR](https://circleci.com/docs/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to configure and push an image to Amazon ECS.

Find more detailed information in the CircleCI Orb Registry for the CircleCI [AWS ECS](https://circleci.com/developer/orbs/orb/circleci/aws-ecs) and [AWS ECR](https://circleci.com/developer/orbs/orb/circleci/aws-ecr) orbs.

## ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする
{: #interact-with-google-kubernetes-engine-gke }

Google Kubernetes Engine (GKE) を利用すると、CI/CD 戦略を自動化して、コードやアプリケーションの更新を顧客にすばやく簡単にデプロイできます。 更新の配信に長い時間はかかりません。 CircleCI は、GKE 固有の CircleCI Orb を開発すると共に、GKE のテクノロジーを活用して、特定のジョブで GKE を操作できるようにしました。 GKE を使用する前に、[Google Kubernetes Engine のドキュメント](https://cloud.google.com/kubernetes-engine/docs/)をご一読ください。

### 環境変数の設定
{: #set-environment-variables }
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (必須)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

### Creating and deleting clusters
{: #creating-and-deleting-clusters }
Using the CircleCI GKE orb, you can perform complex actions with minimal configuration required. For example, once you have set the environment variable mentioned in the previous section, you can create a new GKE cluster using the following snippet:

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

To delete a cluster, all you need is:

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

CircleCI GKE Orb を使用して Google Cloud Platform (GCP) にログインし、Docker イメージをビルドおよびパブリッシュして、そのイメージを GKE クラスタにロールアウトする例を示します。 All you need is the orbs built-in command `publish-and-rollout-image`, along with definitions for a few required parameters. For a full list of of parameters available for this job, check the [GKE page](https://circleci.com/developer/orbs/orb/circleci/gcp-gke?version=1.0.4#jobs-publish-and-rollout-image) in the CircleCI Orbs Registry.

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

CircleCIでは、Amazon Elastic Kubernetes Service（EKS）と連携して使用できるKubernetes orbを提供しています。 このorbdでは以下のタスクを行うことができます。

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

CircleCI AWS-EKSのorbを使用する前に、CircleCI Orb Registryページの [AWS-EKS](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start) orbの仕様を確認しておくとよいでしょう。

### EKS クラスタを作成する
{: #create-an-eks-cluster }

Using the CircleCI `aws-eks` orb, you can create, test and teardown an EKS cluster using the code sample shown below.

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

In this example two orbs are used: built-in jobs and commands from the `aws-eks` orb are used to create, test and then teardown a cluster. The built-in `install` command from the `kubernetes` orb is used to install `kubectl`.

### Kubernetes デプロイの作成
{: #create-a-kubernetes-deployment }

You may wish to create a Kubernetes deployment, which enables you to manage the cluster and perform different actions within the cluster, including the ability to:

* クラスタ内のリソースの更新
* Authenticator を使用した Kubernetes 構成の更新
* コンテナ イメージの更新

The code example below illustrates how you can create the Kubernetes deployment.

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

### Install a Helm chart in your cluster
{: #install-a-helm-chart-in-your-cluster }

Helm は、Kubernetes クラスタ上で実行される強力なアプリケーション パッケージ マネージャーです。 Helm Chart を使用することで、アプリケーション構造を記述し、シンプルなコマンドによってその構造を管理できます。 Helm では、関連する Kubernetes リソース一式を記述するファイルが、チャートと呼ばれるパッケージ形式に集約されます。 1 つのチャートを使用して、memcached ポッドのような単純なアプリケーションから、HTTP サーバー、データベース、キャッシュなどから成る完全な Web アプリ スタックのような複雑なアプリケーションまで、幅広くデプロイできます。

Using the `aws-eks` orb you can install Helm on your Kubernetes cluster, then install a Helm chart just using the orb's built-in jobs. Below is a code example for this, which also cleans up by deleting the release and cluster at the end of the process:

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

### 承認待ちの状態をSlackチャンネルに通知する
{: #notifying-a-slack-channel-of-pending-approval }

The [CircleCI Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) enables you to create different notifications and messages that can be delivered to your desired recipients. One type of notification you can create is an "approval" notification that alerts your recipients that a specific approval is pending. The example below illustrates how you can create this approval notification in a CircleCI job:

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
In the above example, note that you first need to invoke the `circleci/slack@x.y.z` orb before running your workflow, which then enables you to send your notification with its associated `message` and `webhook`.

There are several parameters for you to customize your Slack notifications that aren't shown here. For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/developer/orbs/orb/circleci/slack).

### カスタムメッセージをSlackチャンネルに通知する
{: #notifying-a-slack-channel-with-custom-messages }

CircleCI Slack Orb では、カスタム メッセージを含む通知も作成できます。 この種類の通知は、ワークフロー、ジョブ、またはプロジェクトに固有の詳細なメッセージを受信者に配信したいときに便利です。

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

In this example, the Slack orb command `notify` is used, along with the following parameters to create a custom notification:

1. メッセージ テキストの `color` を指定します。
2. メッセージの受信者 (`mentions`) を指定します。
3. 配信したいテキストを `message` に入力します。
4. メッセージの `webhook` を指定します。 Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

### Sending a status alert at the end of a job based on success or failure
{: #sending-a-status-alert-at-the-end-of-a-job-based-on-success-or-failure }

ジョブの終了時に受信者にステータス アラートを送信することも可能です。 このステータス アラートの送信は、ジョブの最後のステップにする必要があります。

The example below shows how you can send a status alert at the end of a job.

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

上の例では、ジョブが実行されて失敗した場合に、Slack ステータス アラートが受信者 (USERID1、USERID2) に送信されます。

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/developer/orbs/orb/circleci/slack).

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
            equal: [ master, << pipeline.git.branch >> ]
          steps:
            - run: echo "I am on master"

workflows:
  my-workflow:
    jobs:
      - my-job
```

## ダイナミック コンフィグ
{: #dynamic-configuration }

ここでは、下記のダイナミック コンフィグの使用方法の例を紹介します。

上記の例では、以下のような要素が実装されています:

- [基本的な例]({{ site.baseurl }}/ja/2.0/configuration-cookbook/?section=examples-and-guides#a-basic-example)
- [変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する]({{ site.baseurl }}/ja/2.0/configuration-cookbook/?section=examples-and-guides#execute-specific-workflows-or-steps-based-on-which-files-are-modified)

### 基本的な例
{: #a-basic-example }

以下に、CircleCI のダイナミック コンフィグ機能の基本的な使用例を示します。 この例では、`generate-config` スクリプトが既に存在することを前提としています。 このスクリプトは、行う処理の種類に基づいて新しい YAML 設定ファイルを出力します。 この過程で、`git` 履歴、パイプラインに渡される値、[`ジョブ`]({{ site.baseurl }}/2.0/configuration-reference/#jobs) 内で行われる処理などの確認を行うことができます。

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

**注意:** 1 個の `config.yml` でダイナミック コンフィグの機能を使用して実行できるワークフローの数は 1 に制限されています。 このセットアップ ワークフローには後続のワークフローを起動するためのワンタイム トークンが割り当てられます。 このセットアップ ワークフローはカスケードしないため、後続のワークフローが独自にさらに後に続くワークフローを起動することはできません。

For a more in-depth explanation of what the `continuation` orb does, review the orb's source code in the [CircleCI Developer Hub](https://circleci.com/developer/orbs/orb/circleci/continuation?version=0.1.2) or review the [Dynamic configuration FAQ]({{ site.baseurl }}/2.0/dynamic-config#dynamic-config-faqs).

### 変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する
{: #execute-specific-workflows-or-steps-based-on-which-files-are-modified }

場合によっては、ある`ワークフロー`や`ステップ`を実行するかどうかを、特定のファイルセットに対して行われた変更に応じて決定したいことがあります。 条件に応じた実行は、コードやマイクロ サービスがモノレポ (単一のリポジトリ) に格納されている場合に役立ちます。

例えば、以下のようなモノレポ構成を考えます:

上記のような状況におけるダイナミック コンフィグの実装例が、以下の `config.yml` および `continue_config.yml` です:

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

An example implementation of CircleCI's dynamic configuration for the above use case can be found in the following `config.yml` and `continue_config.yml`:

#### config.yml
{: #configyml }

```yaml
version: 2.1

# CircleCI のダイナミック コンフィグ機能を有効にする
setup: true

# 更新対象のファイルセットのパスに基づいてパイプラインを続行するには path-filtering Orb が必要
orbs:
  path-filtering: circleci/path-filtering@0.0.2

workflows:
  # always-run ワークフローはパイプライン パラメータの内容にかかわらず常時実行
  always-run:
    jobs:
      # path-filtering/filter ジョブがどのパイプライン パラメータを
      # 変更するべきかを決定
      - path-filtering/filter:
          name: check-updated-files
          # 3 列を空白文字で区切ったマッピング 一行につき 1 マッピング
          # <検証するパスの正規表現> <変更するパラメータ名> <設定されるパラメータの値>
          mapping: |
            service1/.* run-build-service-1-job true
            service2/.* run-build-service-2-job true
          base-revision: master
          # パス フィルタリングとパイプライン パラメータの設定が完了した後に実行するコンフィグへのパス .
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
          base-revision: master
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
  <code>build-service-1</code> ジョブ: <code>maven</code> Orb を使用して service1 コードのコンパイルとインストールを行います。
  テストはスキップします。
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

In the above configuration, we:

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- `path-filtering` Orb と `maven` Orb を呼び出して、使用できるようにします。
- `run-build-service-1-job` と `run-build-service-2-job` という 2 つのブール値パイプライン パラメーターを定義します。
- `check-updated-files`、`build-service-1`、`build-service-2`、`run-integration-tests` という 4 つのジョブを定義します。
  - `check-updated-files` ジョブ: `path-filtering` Orb を使用して、指定されたファイルパスのどのファイルに変更が加えられたのかを判断します。 また、指定されたパイプライン パラメーターに所定の値を設定します。 今回は、変更されたファイルに応じて各種 maven コマンドがトリガーされるようにしています。
  - version: 2.1 orbs: maven: circleci/maven@1.2.0 # デフォルトのパイプライン パラメータ # path-filgering Orb により値は適宜書き換えられる parameters: run-build-service-1-job: type: boolean default: false run-build-service-2-job: type: boolean default: false # ワークフローを実際に定義 # ほとんどはパイプライン パラメータの値に準じて特定条件下でのみ実行される # それぞれのワークフローは上記 jobs セクションで定義されたジョブを実行 workflows: # run-build-service-1-job パラメータが true のときのみ # build-service-1 ジョブを起動 service-1: when: &lt;&lt; pipeline.parameters.run-build-service-1-job &gt;&gt; jobs: - maven/test: name: build-service-1 command: 'install -DskipTests' app_src_directory: 'service1' # run-build-service-2-job パラメータが true のときのみ # build-service-2 ジョブを起動 service-2: when: &lt;&lt; pipeline.parameters.run-build-service-2-job &gt;&gt; jobs: - maven/test: name: build-service-2 command: 'install -DskipTests' app_src_directory: 'service2' # run-build-service-1-job パラメータもしくは run-build-service-2-job パラメータが OR # true のとき run-integration-tests ジョブを起動 # 詳細は https://circleci.com/docs/2.0/configuration-reference/#logic-statements を参照 run-integration-tests: when: or: [&lt;&lt; pipeline.parameters.run-build-service-1-job &gt;&gt;, &lt;&lt; pipeline.parameters.run-build-service-2-job &gt;&gt;] jobs: - maven/test: name: run-integration-tests command: '-X verify' app_src_directory: 'tests'
  - `build-service-2` ジョブ: `maven` Orb を使用して service2 コードのコンパイルとインストールを行います。 テストはスキップします。
  - `run-integration-tests` ジョブ: `maven` Orb を使用して結合テストを行います。
- 以下の 4 つのワークフローを定義します。 そのうち、3 つのワークフローは条件に従って実行されます。
  - `service-1` ワークフロー: run-build-service-1-job にマッピングされたパイプライン パラメータの値が `true` の場合に `build-service-1` ジョブをトリガーします。
  - `service-2` ワークフロー: run-build-service-2-job にマッピングされたパイプライン パラメータの値が `true` の場合に `build-service-2` ジョブをトリガーします。
  - `run-integration-tests` ワークフロー: `path-filtering` Orb の実行結果に基づいて `run-build-service-1-job` または `run-build-service-2-job` パイプライン パラメータの値が `true` に更新された場合に実行されます。
  - `check-updated-files` ワークフロー: このパイプラインがトリガーされた場合に必ず実行されます。

利用可能な機能や必要なパラメータなどの詳細については `path-filtering` [Orb のドキュメント](https://circleci.com/developer/orbs/orb/circleci/path-filtering) を参照してください。

## Use matrix jobs to run multiple OS tests
{: #use-matrix-jobs-to-run-multiple-os-tests }

Using matrix jobs is a good way to run a job multiple times with different arguments, using parameters. There are many uses for this, including testing on multiple operating systems and against different language/library versions.

In the following example the `test` job is run across a Linux container, Linux VM, and macOS environments, using two different versions of Node.js. On each run of the `test` job different parameters are passed to set both the OS and the Node.js version:

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
      xcode: 12.5

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

The expanded version of this matrix runs the following list of jobs under the `all-tests` workflow:

```
    - test-14.17.6-docker
    - test-16.9.0-docker
    - test-14.17.6-linux
    - test-16.9.0-linux
    - test-14.17.6-macos
    - test-16.9.0-macos
```

For full details of the matrix jobs specification, see the [Configuration Reference]({{ site.baseurl }}/ja/2.0/configuration-reference/#matrix-requires-version-21).
