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

The *CircleCI Configuration Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various configuration tasks using CircleCI resources including orbs. This guide, and its associated sections, will enable you to quickly perform repeatable tasks on the CircleCI platform.

* 目次
{:toc}

## はじめに
{: #introduction }

This page, and its associated recipes, describes how you can perform specific configuration tasks. Recipes include code snippets and examples for you to customize to fit your projects. Each recipe in this cookbook relates to a single task that you can perform on the CircleCI platform using your own resources in addition to CircleCI resources such as CircleCI orbs.

### What are CircleCI orbs?
{: #what-are-circleci-orbs }
{:.no_toc}

CircleCI Orb は、CircleCI プラットフォームを効率的に使用するための構成パッケージです。 Orbs enable you to share, standardize, and simplify configurations across your projects. You may also want to use orbs as a reference for configuration best practices.

Refer to the [CircleCI Orbs Registry](https://circleci.com/developer/orbs) for the complete list of available orbs.

To use an existing orb in your 2.1 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) file, invoke it with the `orbs` key. The following example invokes the [`hello-build` orb](https://circleci.com/developer/orbs/orb/circleci/hello-build) in the `circleci` namespace.

```yaml
version: 2.1

orbs:
  hello: circleci/hello-build@x.y.z

workflows:
  "Hello Workflow":
    jobs:
      - hello/hello-build
```

For more detailed information about CircleCI orbs, refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) page.

## Configure your environment for CircleCi pipelines and orbs
{: #configure-your-environment-for-circleci-pipelines-and-orbs }
{:.no_toc}

Most recipes in this cookbook call for version 2.1 configuration, pipelines and often, orbs. Before using the examples provided, you should check that you are set up for these features. The following notes and steps will get you where you need to be.

* In order to use pipelines features and orbs you must use `version 2.1` config.
* We have indicated where you need to specify a [docker image for your job]({{ site.baseurl }}/2.0/optimizations/#docker-image-choice) with `<docker-image-name-tag>`.
* If you wish to remain using `version 2.0` config, or are using a self-hosted installation of CircleCI Server, these recipes are still relevant because you can view the expanded orb source within the [Orbs Registry](https://circleci.com/developer/orbs) to see how the individual jobs and commands are built.
* In the examples on this page that use orbs, you will notice that the orbs are versioned with tags, for example, `aws-s3: circleci/aws-s3@x.y.z`. If you copy paste any examples you will need to edit `x.y.z` to specify a version. You can find the available versions listed on the individual orb pages in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).
* Any items that appear within `< >` should be replaced with your own parameters.

## Deploy changes to Amazon ECS
{: #deploy-changes-to-amazon-ecs }

Amazon Elastic Container Service (ECS) は、スケーラブルなコンテナ オーケストレーション サービスです。Docker コンテナをサポートし、コンテナ化されたアプリケーションを AWS で実行およびスケールできます。 Amazon ECS を使用することで、独自のコンテナ オーケストレーション ソフトウェアをインストール・構成せずに済むため、デプロイの複雑性を軽減し、CircleCI プラットフォームでコンテナをシンプルかつ最適にデプロイすることができます。 This recipe shows you how to quickly deploy software changes to Amazon ECS using CircleCI orbs, but if you would like more detailed information about the how Amazon ECS service works, and its underlying components and architecture, please refer to the [Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### Setting environment variables
{: #setting-environment-variables }
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

* `AWS_ECR_ACCOUNT_URL`
* `MY_APP_PREFIX`
* `AWS_REGION`
* `AWS_ACCESS_KEY_ID`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

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

## Interact with Google Kubernetes Engine (GKE)
{: #interact-with-google-kubernetes-engine-gke }

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly deploy code and application updates to your customers without requiring significant time to deliver these updates. Using GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### Set environment variables
{: #set-environment-variables }
以下の環境変数を CircleCI に直接またはコンテキスト経由で設定する必要があります。

- `GCLOUD_SERVICE_KEY` (required)
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

### Publishing and rolling out the image to the GKE cluster
{: #publishing-and-rolling-out-the-image-to-the-gke-cluster }

Using the CircleCI GKE orb makes publishing and rolling out a docker image to your GKE cluster very simple, as shown in the example below. All you need is the orbs built-in command `publish-and-rollout-image`, along with definitions for a few required parameters. For a full list of of parameters available for this job, check the [GKE page](https://circleci.com/developer/orbs/orb/circleci/gcp-gke?version=1.0.4#jobs-publish-and-rollout-image) in the CircleCI Orbs Registry.

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

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Kubernetes Service (EKS) to perform the following tasks:

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/developer/orbs/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

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

### Install a Helm chart in your cluster
{: #install-a-helm-chart-in-your-cluster }

Helm は、Kubernetes クラスタ上で実行される強力なアプリケーション パッケージ マネージャーです。Helm Chart を使用することで、アプリケーション構造を記述し、シンプルなコマンドによってその構造を管理できます。 Helm uses a packaging format called charts, which are collections of files that describe a related set of Kubernetes resources. 1 つのチャートを使用して、memcached ポッドのような単純なアプリケーションから、HTTP サーバー、データベース、キャッシュなどから成る完全な Web アプリ スタックのような複雑なアプリケーションまで、幅広くデプロイできます。

Using the `aws-eks` orb you can install Helm on your Kubernetes cluster, then install a Helm chart just using the orb's built-in jobs. Below is a code example for this, wchich also cleans up by deleting the release and cluster at the end of the process:

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

## Enabling custom Slack notifications in CircleCI jobs
{: #enabling-custom-slack-notifications-in-circleci-jobs }

Slack は、リアルタイム コラボレーション アプリケーションです。チーム メンバーは、カスタムのチャンネルやワークスペースを通じて、定型業務やプロジェクトに協力して取り組むことができます。 CircleCI プラットフォームを使用するときには、チームのニーズと要件に基づいて Slack アプリのカスタム通知を有効にしておくと便利です。

### Notifying a Slack channel of pending approval
{: #notifying-a-slack-channel-of-pending-approval }

The [CircleCI Slack orb](https://circleci.com/developer/orbs/orb/circleci/slack) enables you to create different notifications and messages that can be delivered to your desired recipients. その 1 つである「承認」通知を作成すると、承認が保留中であることを受信者に通知できるようになります。 CircleCI ジョブでこの承認通知を作成する例を以下に示します。

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

### Notifying a Slack channel with custom messages
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
4. メッセージの `webhook` を指定します。Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

### Sending a status alert at the end of a job based on success or failure
{: #sending-a-status-alert-at-the-end-of-a-job-based-on-success-or-failure }

ジョブの終了時に受信者にステータス アラートを送信することも可能です。 このステータス アラートの送信は、ジョブの最後のステップにする必要があります。

ジョブの終了時にステータス アラートを送信する例を以下に示します。

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

上記の設定ファイルは、以下のように構成されています。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- ダイナミック コンフィグ機能を使用するために `continuation` Orb を呼び出します。
- `continuation` Orb を [`executor`]({{ site.baseurl }}/2.0/executor-intro/) として使用する `setup` というジョブを定義します。 このジョブでは、下記の処理を行います。
    - [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを呼び出して、設定されたリポジトリからコードをチェックアウトします。
    - [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) ステップを呼び出して、`generate-config` スクリプトを実行します。これで、`continuation` Orb の `continue` ジョブに出力を渡すことができます。
    - 必須の `configuration_path` に指定された設定ファイルに基づいて、パイプラインの実行が続行されます。
- 最後に、`workflows` において、上記で定義された `setup` ジョブを呼び出します。

`continuation` Orb の処理について詳しくは、[CircleCI デベロッパー ハブ](https://circleci.com/developer/ja/orbs/orb/circleci/continuation?version=0.1.2)で Orb のソース コードを参照するか、「[ダイナミック コンフィグに関するよくあるご質問]({{ site.baseurl }}/2.0/dynamic-config#dynamic-config-faqs)」を参照してください。

### 変更されたファイルに基づいて特定の`ワークフロー`または`ステップ`を実行する
{: #execute-specific-workflows-or-steps-based-on-which-files-are-modified }

場合によっては、ある`ワークフロー`や`ステップ`を実行するかどうかを、特定のファイルセットに対して行われた変更に応じて決定したいことがあります。 条件に応じた実行は、コードやマイクロサービスがモノレポ (単一のリポジトリ) に格納されている場合に役立ちます。

これを可能にするために、CircleCI には [`path-filtering`](https://circleci.com/developer/ja/orbs/orb/circleci/path-filtering) Orb が用意されています。この Orb により、更新対象ファイルの具体的なパスに基づいて、パイプラインの実行を続行できます。

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

上記を前提に CircleCI のダイナミック コンフィグを実装すると、`config.yml` は次のようになります。

```yaml
version: 2.1

# CircleCI のダイナミック コンフィグ機能を有効にする
setup: true

# 更新対象ファイルセットのパスに基づいてパイプラインを続行するには path-filtering Orb が必要
# ダイナミック コンフィグを使用して Java プロジェクトをビルドする例として maven Orb も使用する。
orbs:
  path-filtering: circleci/path-filtering@0.0.2
  maven: circleci/maven@1.2.0

# デフォルトのパイプライン パラメーター。path-filtering Orb の結果に応じて更新される
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
        # 空白文字で区切った 3 列のマッピング。 1 行につき 1 つのマッピング: <regex path-to-test> <parameter-to-set> <value-of-pipeline-parameter>
        mapping: |
          service1/.* run-build-service-1-job true
          service2/.* run-build-service-2-job true
        base-revision: master
        # パス フィルタリングとパイプライン パラメーターの値の更新が完了したらトリガーする構成ファイルのパス。 今回は、親ダイナミック コンフィグ自体を使用する。
        config-path: .circleci/config.yml
  # build-service-1 ジョブでは maven Orb を使用して service1 のアーティファクトを maven リポジトリにビルドしてインストールする (テストは実行しない)。
  build-service-1:
    - maven/test:
        command: ‘install -DskipTests’
        app_src_directory: ‘service1’
  # build-service-2 ジョブでは maven Orb を使用して service2 のアーティファクトを maven リポジトリにビルドしてインストールする (テストは実行しない)。
  build-service-2:
    - maven/test:
        command: ‘install -DskipTests’
        app_src_directory: ‘service2’
  # run-integration-tests ジョブでは tests ディレクトリで定義されたジョブを実行する。
  run-integration-tests:
    - maven/test:
        command: ‘-X verify’
        app_src_directory: ‘tests’

# 以下でワークフローを指定する。ワークフローの大半はパイプライン パラメーターの値に応じた条件に従って実行される。 
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
```

上記の設定ファイルは、以下のように構成されています。

- 設定ファイルの最上部に `setup: true` という行を追加して、CircleCI のダイナミック コンフィグ機能を使用することを指定します。
- `path-filtering` Orb と `maven` Orb を呼び出して、使用できるようにします。
- `run-build-service-1-job` と `run-build-service-2-job` という 2 つのブール値パイプライン パラメーターを定義します。
- `check-updated-files`、`build-service-1`、`build-service-2`、`run-integration-tests` という 4 つのジョブを定義します。
  - `check-updated-files` ジョブ: `path-filtering` Orb を使用して、指定されたファイルパスのどのファイルに変更が加えられたのかを判断します。 また、指定されたパイプライン パラメーターに所定の値を設定します。今回は、変更されたファイルに応じて各種 maven コマンドがトリガーされるようにしています。
  - `build-service-1` ジョブ: `maven` Orb を使用して service1 コードのコンパイルとインストールを行います。テストはスキップします。
  - `build-service-2` ジョブ: `maven` Orb を使用して service2 コードのコンパイルとインストールを行います。テストはスキップします。
  - `run-integration-tests` ジョブ: `maven` Orb を使用して結合テストを行います。
- 以下の 4 つのワークフローを定義します。そのうち、3 つのワークフローは条件に従って実行されます。
  - `service-1` ワークフロー: run-build-service-1-job にマッピングされたパイプライン パラメーターの値が `true` の場合に `build-service-1` ジョブをトリガーします。
  - `service-2` ワークフロー: run-build-service-2-job にマッピングされたパイプライン パラメーターの値が `true` の場合に `build-service-2` ジョブをトリガーします。
  - `run-integration-tests` ワークフロー: `path-filtering` Orb の結果に基づいて `run-build-service-1-job` または `run-build-service-2-job` パイプライン パラメーターの値が `true` に更新された場合に実行されます。
  - `check-updated-files` ワークフロー: このパイプラインがトリガーされた場合に必ず実行されます。

利用可能な要素と必須パラメーターの詳細については、[`path-filtering` Orb のドキュメント](https://circleci.com/developer/ja/orbs/orb/circleci/path-filtering)を参照してください。

## Use matrix jobs to run multiple OS tests
{: #use-matrix-jobs-to-run-multiple-os-tests }

Using matrix jobs is a good way to run a job multiple times with different arguments, using parameters. There are many uses for this, including testing on multiple operating systems and against different language/library versions.

In the following example the `test` job is run across Linux, Windows and macOS environments, using two different versions of node. On each run of the `test` job different parameters are passed to set both the OS and the node version:

```yaml
version: 2.1

orbs:
  node: circleci/node@4.0.0
  win: circleci/windows@2.2.0

executors:
  linux: # linux executor using the node base image
    docker:
      - image: cimg/node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  windows: win/default # windows executor - uses the default executor from the windows orb
  macos: # macos executor using xcode 11.6
    macos:
      xcode: 11.6

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
      - run: yarn test

workflows:
  all-tests:
    jobs:
      - test:
          matrix:
            parameters:
              os: [linux, windows, macos]
              node-version: ["13.13.0", "14.0.0"]
```

The expanded version of this matrix runs the following list of jobs under the `all-tests` workflow:

```
    - test-13.13.0-linux
    - test-14.0.0-linux
    - test-13.13.0-windows
    - test-14.0.0-windows
    - test-13.13.0-macos
    - test-14.0.0-macos
```

For full details of the matrix jobs specification, see the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#matrix-requires-version-21).
