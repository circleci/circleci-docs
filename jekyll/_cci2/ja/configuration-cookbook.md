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

現在提供されている Orb の一覧は、[CircleCI Orb レジストリ](https://circleci.com/orbs/registry/)にて確認してください。

既存の Orb を 2.1 の [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-version-21-が必須) ファイルで使用するには、`orbs` キーを使用して呼び出します。 以下の例では、`circleci` 名前空間で [`hello-build` Orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) を呼び出します。

```yaml
version: 2.1

orbs:
  hello: circleci/hello-build@0.0.5

workflows:
  "Hello Workflow":
    jobs:
      - hello/hello-build
```

CircleCI Orb の詳細については、「[Orb の概要]({{ site.baseurl }}/2.0/orb-intro/)」を参照してください。

#### CircleCI プラットフォームおよび Orb を使用するための環境構成

1) `.circleci/config.yml` ファイルの先頭で CircleCI のバージョンを 2.1 に設定します。

`version: 2.1`

**NOTE:** {% include snippets/enable-pipelines.md %}

2) Add the orbs stanza below your version, which in turn imports the orb:

```yaml
aws-ecs: circleci/aws-ecs@0.0.10
```

3) Invoke the orbs element (e.g. `aws-ecs elements`) in your existing workflows and jobs.

### 構成レシピ

The table below lists the different build configuration "recipes" you can perform using CircleCI orbs.

| 構成レシピ                                                                          | 説明                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [ソフトウェアの変更を Amazon Elastic Container Service (ECS) にデプロイする](#header1)          | CircleCI 承認済み ECS Orb を使用して Amazon Elastic Container Service (ECS) に変更をデプロイする方法を説明します。 |
| [ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする](#header2)                  | CircleCI 承認済み GKE Orb を使用して Google Kubernetes Engine (GKE) に変更をデプロイする方法を説明します。         |
| [Amazon Elastic Container Service for Kubernetes (Amazon EKS) を使用する](#header3) | Kubernetes 向けの Amazon ECS サービスを Kubernetes 関連のタスクと操作に使用する方法を説明します。                     |
| [アプリケーションを Heroku にデプロイする](#header4)                                           | CircleCI Heroku Orb を使用して Heroku プラットフォームにアプリケーションをデプロイする方法を説明します。                     |
| [CircleCI ジョブでカスタム Slack 通知を利用する](#header5)                                    | カスタマイズした Slack 通知を CircleCI ジョブで利用する方法を説明します。                                          |

## ソフトウェアの変更を Amazon ECS にデプロイする {#header1}

The Amazon Elastic Container Service (ECS) is a scalable container orchestration service that enables you to support Docker containers and allows you to run and scale containerized applications on AWS. By using Amazon ECS, you will be able to use this service without installing and configuring your own container orchestration software, thereby eliminating the complexity of your deployment and ensuring you have a simple and optimized container deployment on the CircleCI platform. Although this documentation enables you to quickly and easily deploy software changes to the Amazon ECS service using CircleCI orbs, if you would like more detailed information about the how Amazon ECS service works, and its underlying components and architecture, please refer to the [Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) documentation.

### 前提条件

Before deploying any software changes to Amazon ECS on the CircleCI platform, you must first perform a series of configuration steps to ensure you have properly set up and configured your environment for the CircleCI platform. Also, because CircleCI has created an "orb" to simplify these steps, you will also need to ensure your CircleCI project has been configured to use CircleCI orbs.

### Amazon ECS サービスを更新する

Now that your environment is configured to work with orbs, update the Amazon ECS service to ensure you have the latest version of ECS. There are two different ways you can update the Amazon ECS Service, depending on whether you also want to update the existing Amazon Web Services CLI. Both of these approaches are described below.

#### AWS CLI を更新せずに Amazon ECS サービスを更新する

To update the Amazon ECS Service without updating the AWS CLI using CircleCI orbs, review the the example shown below, which shows you how to update the ECS service.

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

Notice in this example that you need to instantiate two different AWS ECS orbs: `aws-ecs 0.0.3` and `aws-ecs 0.0.4` to update the ECS service. Once you have instantiated these two orbs, the orb enables the configuration, and then pushes the image, before finally deploying the service update to ECS.

#### Amazon Web Services CLI と Amazon ECS を更新する

To update both the AWS CLI and ECS Service simultaneously, use the orb shown below to simplify the process of updating these services.

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

Notice in this above example that you instantiate two different orbs, `aws-cli: circleci/aws-cli@0.1.4` and `aws-ecs: circleci/aws-ecs@0.0.3` to perform a number of sequential steps to ensure that the Amazon CLI is installed and configured before updating the Amazon ECS service.

#### Amazon ECS サービスの更新を検証する

Once you have updated the Amazon ECS service, verify the update was properly applied using the CircleCI Amazon ECR/ECS orb. This orb example is shown below.

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

This example illustrates how you can use the orb to install and configure the AWS CLI, retrieve the task definition, and then verify the revision has been deployed. Refer to the [AWS ECR](https://circleci.com/docs/2.0/deployment-integrations/#aws-ecr--aws-ecs-orb-examples) example orb for more information on how to configure and push an image to Amazon ECS.

For more detailed information about the CircleCI Amazon ECS/ECR orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/aws-ecs).

## ソフトウェアの変更を Google Kubernetes Engine (GKE) にデプロイする {#header2}

The Google Kubernetes Engine (GKE) enables you to automate CI/CD strategies to quickly and easily deploy code and application updates to your customers without requiring significant time to deliver these updates. Using the GKE, CircleCI has leveraged this technology, along with development of a GKE-specific CircleCI orb, to enable you to interact with GKE within a specific job. Before working with GKE, you may wish to read Google's technical documentation, which can be found on the [GKE](https://cloud.google.com/kubernetes-engine/docs/) documentation page.

### 前提条件

The sections below list the prerequisites that must be met before deploying any software changes to the Google Kubernetes Engine (GKE).

#### 環境変数を設定する
The following environment variables need to be set in CircleCI either directly or through a context:

- `GCLOUD_SERVICE_KEY` (必須)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_COMPUTE_ZONE`

If you need more information on how to set these environment variables, refer to the [Using Environment Variables](https://circleci.com/docs/2.0/env-vars/) page in the CircleCI documentation.

### GKE アクションを管理する

The CircleCI GKE orb enables you to perform several different actions within the orb while working with a GKE cluster, including:

- `gcloud` と `kubectl` のインストール (まだインストールされていない場合)
- `gcloud` CLI の初期化
- 既存のデプロイの Docker イメージの更新

The code example below shows how you can perform these actions while also rolling out the docker image to the GKE cluster.

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

Now that you have installed (if necessary) and initialized `gcloud` and updated the docker image, you may then publish and roll out this updated image to the GKE cluster for later use.

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

The example below shows how you can use the CircleCI GKE orb to log into the Google Cloud Platform (GCP), build and publish a docker image, and then roll the image out to the GKE cluster.

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

CircleCI has developed a Kubernetes orb you can use in coordination with the Amazon Elastic Container Service (ECS) to perform the following tasks:

* EKS クラスタの作成
* Kubernetes デプロイの作成
* Helm Chart のインストール
* コンテナ イメージの更新

Before working with the CircleCI AWS-EKS orb, you may wish to review the specifics of the [AWS-EKS](https://circleci.com/orbs/registry/orb/circleci/aws-eks#quick-start) orb in the CircleCI Orb Registry page.

### 前提条件

Before using the Amazon EKS service, make sure you meet the following requirements:

* CircleCI プラットフォームと CircleCI Orb を使用するように環境が構成されている
* `eksctl` ツールがインストールされている
* `AWS-CLI` と `AWS-IAM Authenticator for Kubernetes` がインストールされている

#### CircleCI プラットフォームおよび Orb を使用するように環境を構成する

To configure your environment to use CircleCI and orbs, perform the following steps:

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

2) {% include snippets/enable-pipelines.md %}

Add the orbs stanza below your version, invoking the orb:

`orbs: aws-eks: circleci/aws-eks@0.2.1`

3) Use `aws-eks` elements in your existing workflows and jobs.

#### Amazon `eksctl` ツールをインストールする

If the Amazon `eksctl` tool is not already installed, install `eksctl` so you can use these tools to manage a cluster on EKS - Amazon's managed Kubernetes service for EC2.

The code sample shown below illustrates how you can install the 'eksctl' tool in your environment using the CircleCI orb.

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

CircleCI enables you to use the `AWS-CLI` and `AWS-IAM` authentication tool to run command-line tools in an AWS cluster. Where `AWS-CLI` allows you to run these command-line tools, `AWS-IAM` provides you with the capability to authenticate an existing Kubernetes cluster. By using the AWS IAM Authenticator for Kubernetes, you will not have to manage a separate credential for the Kubernetes access. If you would like more detailed information about how to install and use these tools, refer to the [AWS-IAM GitHub](https://github.com/kubernetes-sigs/aws-iam-authenticator) page.

To install the AWS IAM Authenticator for Kubernetes, see the code sample shown below.

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

**Note:** Make sure curl in enabled, and you are using the amd64 architecture.

### EKS クラスタを作成する

Once you meet the requirements for using the CircleCI AWS-EKS orb, you may create an EKS cluster using the code sample shown below.

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

In this example, when you use the CircleCI AWS-EKS orb, you can install Kubernetes, update the Kubernetes configuration with the authenticator, and then retrieve Kubernetes services in one single job.

### Kubernetes デプロイを作成する

After creating a Kubernetes cluster, you may wish to create a Kubernetes deployment, which enables you to manage the cluster and perform different actions within the cluster, including the ability to:

* クラスタ内のリソースの更新
* Authenticator を使用した Kubernetes 構成の更新
* コンテナ イメージの更新

The code example below illustrates how you can create the Kubernetes deployment.

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

To simplify the Helm installation on your cluster,

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

Helm is a powerful application package manager that runs on top of a Kubernetes cluster and allows you to describe the application structure by using helm-charts and manage the structure using simple commands. Helm uses a packaging format called charts, which is a collection of files that describe a related set of Kubernetes resources. A single chart might be used to deploy something simple, like a memcached pod, or something complex, like a full web app stack with HTTP servers, databases, caches, and so on.

Once Helm is installed in your Kubernetes cluster, you can then install Helm charts using the code example shown below.

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

Occasionally, you may find it necessary to update the container image of a resource in your Kubernetes cluster. The CircleCI AWS-EKS orb enables you to update this image quickly and easily by first updating the Kubernetes configuration with the IAM authenticator, and then updating the specific image in the Kubernetes configuration.

The code example below illustrates how this orb updates an existing container image in the Kubernetes cluster.

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

The Heroku platform is a cloud-based, fully-scalable platform that enables you to quickly and easily deliver and deploy applications. Using CircleCI builds and orbs, you can simplify the deployment process in a few simple steps by following the steps described in the sections below.

### 前提条件

Before you can deploy an applications to the Heroku platform, make sure the following requirements are met:

* CircleCI プラットフォームと CircleCI Orb を使用するように環境が構成されている
* Heroku CLI がインストールされている

#### Heroku CLI をインストールする

If the Heroku CLI is not already installed, install the Heroku CLI so you can deploy your application to the Heroku platform. To install the Heroku CLI, run the following installation step:

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

Now that you have configured your environment to work with the CircleCI platform and orbs, and installed the Heroku CLI (if necessary), deploy your application to the Heroku platform using git. By using git, you can simplify the deployment process, ensuring that you can quickly and easily deploy applications to the Heroku platform by only performing a single step.

```yaml
version: 2.1
orbs:
  heroku: circleci/heroku@0.0.10
workflows:
  heroku_deploy:
    jobs:
      - heroku/deploy-via-git
```

Notice in the above example, when the CircleCI Heroku orb (`circleci/heroku@0.0.10`) is invoked, the `heroku-deploy` workflow is initiated, enabling the `deploy-via-git` job to run.

For more detailed information about the CircleCI Heroku orb, refer to the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/heroku).

## CircleCI ジョブでカスタム Slack 通知を利用する {#header5}

Slack is a real-time collaboration application where team members can work together to perform routine tasks and projects through custom channels and workspaces. When using the CircleCI platform, you may find it useful to enable custom notifications with the Slack app based on specific team needs and requirements.

### 前提条件

Before enabling custom notifications in Slack while using the CircleCI platform, ensure your environment is properly configured and setup to leverage the CircleCI platform and orbs.

### Slack チャンネルに承認待ちを通知する

The CircleCI Slack orb enables you to create different notifications and messages that can be delivered to your desired recipients. One type of notification you can create is an "approval" notification that alerts your recipients that a specific approval is pending. The example below illustrates how you can create this approval notification in a CircleCI job:

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
In the above example, note that you first need to invoke the `circleci/slack@1.0.0` orb before running your workflow, which then enables you to send your notification with its associated `message` and `webhook`.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).

### カスタム メッセージを付けて Slack チャンネルに通知する

Another type of notification you can create using the CircleCI Slack orb is a notification with a custom message created by you. This type of notification is useful when you want to deliver a detailed message to your recipients that is specific to a workflow, job, or project.

The example shown below details how you can create a custom message that will be delivered in a specific Slack channel for users.

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

After building a Docker image, perform the following steps to create your custom notification:

1. メッセージ テキストの `color` を指定します。
2. メッセージの受信者 (`mentions`) を指定します。
3. 配信したいテキストを `message` に入力します。
4. メッセージの `webhook` を指定します。Slack Web フックの作成方法については、[こちらのガイド](https://api.slack.com/incoming-webhooks)を参照してください。

Once you have performed these steps, invoke the CircleCI Slack orb (`circleci/slack@1.0.0`) to initiate the workflow to deliver your notification.

### ジョブの終了時に成功または失敗のステータス アラートを送信する

You may also send a status alert at the end of a job to your recipients. Note that this status alert must be the last step in a job.

The example below shows how you can send a status alert at the end of a job.

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
Notice in the example that the job is run and a Slack status alert is sent to your recipients (USERID1, USERID2) if the job has failed.

For more detailed information about this orb and its functionality, refer to the Slack orb in the [CircleCI Orb Registry](https://circleci.com/orbs/registry/orb/circleci/slack).
