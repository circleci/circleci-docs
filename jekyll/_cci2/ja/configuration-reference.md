---
layout: classic-docs
title: "CircleCI を設定する"
short-title: "CircleCI を設定する"
description: ".circleci/config.yml に関するリファレンス"
order: 20
version:
  - Cloud
  - Server v2.x
---

`config.yml` ファイルで使用される CircleCI 2.x 構成キーのリファレンス ガイドです。 CircleCI によって承認されたリポジトリ ブランチに `.circleci/config.yml` ファイルが存在するということは、2.x インフラストラクチャを使用することを意味しています。

You can see a complete `config.yml` in our [full example](#example-full-configuration).

**メモ:** 既に CircleCI 1.0 バージョンの設定ファイルが存在する場合は、`config.yml` ファイルを使用することで、独立した別のブランチで 2.x ビルドをテストできます。このとき、古い `circle.yml` スタイルの既存の構成は変更する必要がなく、CircleCI 1.0 インフラストラクチャの `.circleci/config.yml` を含まないブランチで実行できます。

---

## 目次
{: #table-of-contents }
{:.no_toc}

* 目次
{:toc}

---

## **`setup`**
{: #setup }

| キー    | 必須 | 型    | 説明                                                                                  |
| ----- | -- | ---- | ----------------------------------------------------------------------------------- |
| setup | ×  | ブール値 | config.yaml で[ダイナミック コンフィグ]({{ site.baseurl }}/2.0/dynamic-config/)機能を使用することを指定します。 |
{: class="table table-striped"}

`setup` フィールドを指定すると、プライマリ .circleci 親ディレクトリ外部にある設定ファイルのトリガー、パイプライン パラメーターの更新、およびカスタマイズされた設定ファイルの生成を、条件に従って実行できます。

## **`version`**
{: #version }

| キー      | 必須 | Type   | 説明                                                                                                                                                                                                               |
| ------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version | ○  | String | `2`, `2.0`, or `2.1` See the [Reusing Config]({{ site.baseurl }}/2.0/reusing-config/) doc for an overview of new 2.1 keys available to simplify your `.circleci/config.yml` file, reuse, and parameterized jobs. |
{: class="table table-striped"}

`version` フィールドは、非推奨または互換性を損なう変更について注意を促すために使用します。

## **`orbs`** (version: 2.1 が必須)
{: #orbs-requires-version-21 }

| キー        | 必須 | Type | 説明                                                                                                                                                                                                                  |
| --------- | -- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orbs      | ×  | マップ  | A map of user-selected names to either: orb references (strings) or orb definitions (maps). Orb 定義は、2.1 設定ファイルの Orb 関連サブセットである必要があります。 詳細については、[Orb の作成に関するドキュメント]({{ site.baseurl }}/2.0/creating-orbs/)を参照してください。 |
| executors | ×  | マップ  | A map of strings to executor definitions. このページの [executors]({{ site.baseurl }}/2.0/configuration-reference/#executors-version-21-が必須) セクションを参照してください。                                                              |
| commands  | ×  | マップ  | A map of command names to command definitions. このページの [commands]({{ site.baseurl }}/2.0/configuration-reference/#commands-version-21-が必須) セクションを参照してください。                                                           |
{: class="table table-striped"}

以下の例では、承認済みの `circleci` 名前空間に格納された `hello-build` という名前の Orb を呼び出します。

```
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
上の例で、`hello` は Orb の参照名と見なされます。`circleci/hello-build@0.0.5` は完全修飾の Orb 参照です。 You can learn more about orbs [here](https://circleci.com/orbs/)

## **`commands`** (version: 2.1 が必須)
{: #commands-requires-version-21 }

commands では、ジョブ内で実行する一連のステップをマップとして定義します。これにより、複数のジョブで [1 つのコマンド定義を再利用]({{ site.baseurl }}/2.0/reusing-config/)できます。

| キー          | 必須 | Type   | 説明                                                                                                                                                              |
| ----------- | -- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス  | A sequence of steps run inside the calling job of the command.                                                                                                  |
| parameters  | ×  | マップ    | パラメーター キーのマップ。 詳細については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/2.0/reusing-config/)の「[パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)」を参照してください。 |
| description | ×  | String | コマンドの目的を記述する文字列。                                                                                                                                                |
{: class="table table-striped"}

Example:

```yaml
commands:
  sayhello:
    description: "デモ用の簡単なコマンド"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

## **`parameters`** (version: 2.1 が必須)
{: #parameters-requires-version-21 }
設定ファイル内で使用するパイプライン パラメーターを定義します。 使用方法の詳細については、[パイプライン変数に関するドキュメント]({{ site.baseurl }}/2.0/pipeline-variables#設定ファイルにおけるパイプライン-パラメーター)を参照してください。

| キー         | 必須 | Type | 説明                                                                                                                         |
| ---------- | -- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| parameters | ×  | マップ  | パラメーター キーのマップ。 `文字列`、`ブール値`、`整数`、`列挙型`がサポートされています。 [パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)を参照してください。 |
{: class="table table-striped"}

## **`executors`** (version: 2.1 が必須)
{: #executors-requires-version-21 }

Executors define the environment in which the steps of a job will be run, allowing you to reuse a single executor definition across multiple jobs.

| キー                | 必須               | Type   | 説明                                                                                                                                         |
| ----------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| docker            | ○ <sup>(1)</sup> | リスト    | [docker Executor](#docker) 用のオプション。                                                                                                        |
| resource_class    | ×                | String | Amount of CPU and RAM allocated to each container in a job. **注:** この機能を利用するには、Performance プランへの申し込みが必要です。                                 |
| machine           | ○ <sup>(1)</sup> | マップ    | [machine Executor](#machine) 用のオプション。                                                                                                      |
| macos             | ○ <sup>(1)</sup> | マップ    | [macOS Executor](#macos) 用のオプション。                                                                                                          |
| windows           | ○ <sup>(1)</sup> | マップ    | 現在、[Windows Executor](#windows) は Orb に対応しています。 [こちらの Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) を参照してください。         |
| shell             | ×                | String | Shell to use for execution command in all steps. 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。 |
| working_directory | ×                | String | ステップを実行するディレクトリ。 絶対パスとして解釈されます。                                                                                                            |
| environment       | ×                | マップ    | A map of environment variable names and values.                                                                                            |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

例

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

パラメーター化された Executor の使用例については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/2.0/reusing-config/)の「[Executor でのパラメーターの使用](https://circleci.com/ja/docs/2.0/reusing-config/#executor-でのパラメーターの使用)」を参照してください。

## **`jobs`**
{: #jobs }

A Workflow is comprised of one or more uniquely named jobs. それらのジョブは `jobs` マップで指定します。[2.0 config.yml のサンプル]({{ site.baseurl }}/2.0/sample-config/)で `jobs` マップの例を紹介しています。 ジョブの名前がマップのキーとなり、ジョブを記述するマップが値となります。

**Note:** Jobs have a maximum runtime of 5 hours. If your jobs are timing out, consider running some of them concurrently using [workflows]({{ site.baseurl }}/2.0/workflows/).

### **<`job_name`>**
{: #lessjobnamegreater }

Each job consists of the job's name as a key and a map as a value. A name should be case insensitive unique within a current `jobs` list. The value map has the following attributes:

| キー                | 必須               | Type   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト    | [docker Executor](#docker) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| machine           | ○ <sup>(1)</sup> | マップ    | [machine Executor](#machine) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| macos             | ○ <sup>(1)</sup> | マップ    | [macOS Executor](#macos) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| shell             | ×                | String | Shell to use for execution command in all steps. 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                                                                                                                                                                                                                                                                                                                                                                                                                          |
| parameters        | ×                | マップ    | [Parameters](#parameters) for making a `job` explicitly configurable in a `workflow`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| steps             | ○                | リスト    | 実行する[ステップ](#steps)のリスト。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| working_directory | ×                | String | ステップを実行するディレクトリ。 絶対パスとして解釈されます。 Default: `~/project` (where `project` is a literal string, not the name of your specific project). Processes run during the job can use the `$CIRCLE_WORKING_DIRECTORY` environment variable to refer to this directory. **Note:** Paths written in your YAML configuration file will _not_ be expanded; if your `store_test_results.path` is `$CIRCLE_WORKING_DIRECTORY/tests`, then CircleCI will attempt to store the `test` subdirectory of the directory literally named `$CIRCLE_WORKING_DIRECTORY`, dollar sign `$` and all. |
| parallelism       | ×                | 整数     | このジョブを実行する並列インスタンスの数 (デフォルトは 1)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| environment       | ×                | マップ    | A map of environment variable names and values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| branches          | ×                | マップ    | A map defining rules to allow/block execution of specific branches for a single job that is **not** in a workflow or a 2.1 config (default: all allowed). See [Workflows](#workflows) for configuring branch execution for jobs in a workflow or 2.1 config.                                                                                                                                                                                                                                                                                                        |
| resource_class    | ×                | String | Amount of CPU and RAM allocated to each container in a job. **注:** この機能を利用するには、Performance プランへの申し込みが必要です。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

#### `environment`
{: #environment }
A map of environment variable names and values. これらは、CircleCI アプリケーションで設定した環境変数をオーバーライドします。


#### `parallelism`
{: #parallelism }

If `parallelism` is set to N > 1, then N independent executors will be set up and each will run the steps of that job in parallel. これにより、テスト ステップを最適化できます。CircleCI CLI を使用して並列コンテナにテスト スイートを分割すると、ジョブの実行時間を短縮できます。 Certain parallelism-aware steps can opt out of the parallelism and only run on a single executor (for example [`deploy` step](#deploy--deprecated)). Learn more about [parallel jobs]({{ site.baseurl }}/2.0/parallelism-faster-jobs/).

`working_directory` will be created automatically if it doesn't exist.

例

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split)
```

#### `parameters`
{: #parameters }
The `parameters` can be used when [calling that `job` in a `workflow`](#jobs-1).

Reserved parameter-names:

* `name`
* `requires`
* `context`
* `type`
* `filters`
* `matrix`
<!-- Others? -->
<!-- branches & type pass `circleci config validate`. Strange -->

See [Parameter Syntax]({{ site.baseurl }}/2.0/reusing-config/#parameter-syntax) <!-- In this reference, it's not mentioned which types are allowed for job-parameters. --> for definition details.


#### **`docker`**/**`machine`**/**`macos`**/**`windows`** (_Executor_)
{: #docker-machine-macos-windows-executor }

An "executor" is roughly "a place where steps occur". CircleCI 2.0 では、必要な数の Docker コンテナを一度にローンチすることによって必要な環境を構築するか、完全な仮想マシンを使用します。 Learn more about [different executors]({{ site.baseurl }}/2.0/executor-types/).

#### `docker`
{: #docker }
{:.no_toc}

Configured by `docker` key which takes a list of maps:

| キー          | 必須 | Type      | 説明                                                              |
| ----------- | -- | --------- | --------------------------------------------------------------- |
| image       | ○  | String    | 使用するカスタム Docker イメージの名前。                                        |
| name        | ×  | String    | 他から参照するためのコンテナの名前。  デフォルトでは、`localhost` を通してコンテナ サービスにアクセスできます。 |
| entrypoint  | ×  | 文字列またはリスト | コンテナのローンチ時に実行するコマンド。                                            |
| command     | ×  | 文字列またはリスト | コンテナのローンチ時にルート プロセスとなる PID 1 として使用するコマンド (または entrypoint の引数)。  |
| user        | ×  | String    | Docker コンテナ内でコマンドを実行するユーザー。                                     |
| environment | ×  | マップ       | 環境変数の名前と値のマップ。                                                  |
| auth        | ×  | マップ       | 標準の `docker login` 認証情報を用いたレジストリの認証情報。                          |
| aws_auth    | ×  | マップ       | Authentication for AWS Elastic Container Registry (ECR)         |
{: class="table table-striped"}

The first `image` listed in the file defines the primary container image where all steps will run.

`entrypoint` overrides the image's `ENTRYPOINT`.

`command` overrides the image's `COMMAND`; it will be used as arguments to the image `ENTRYPOINT` if it has one, or as the executable if the image has no `ENTRYPOINT`.

For a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) (the first container in the list), if neither `command` nor `entrypoint` is specified in the config, then any `ENTRYPOINT` and `COMMAND` in the image are ignored. This is because the primary container is typically used only for running the `steps` and not for its `ENTRYPOINT`, and an `ENTRYPOINT` may consume significant resources or exit prematurely. ([A custom image may disable this behavior and force the `ENTRYPOINT` to run.]({{ site.baseurl }}/2.0/custom-images/#adding-an-entrypoint)) The job `steps` run in the primary container only.

`name` defines the name for reaching the secondary service containers.  By default, all services are exposed directly on `localhost`.  たとえば、同じサービスのバージョン違いを複数立ち上げるときなど、ローカル ホスト以外のホスト名を使用したい場合に、このフィールドは適しています。

The `environment` settings apply to entrypoint/command run by the docker container, not the job steps.

You can specify image versions using tags or digest. 任意の公式 Docker レジストリ (デフォルトは Docker Hub) にある任意のパブリック イメージを使用できます。 Learn more about [specifying images]({{ site.baseurl }}/2.0/executor-types).

Some registries, Docker Hub, for example, may rate limit anonymous docker pulls.  It's recommended you authenticate in such cases to pull private and public images. The username and password can be specified in the `auth` field.  See [Using Docker Authenticated Pulls]({{ site.baseurl }}/2.0/private-images/) for details.

Example:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty # プライマリ コンテナ
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        environment:
          ENV: CI

      - image: mongo:2.6.8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        command: [--smallfiles]

      - image: postgres:9.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  #  コンテキスト/プロジェクト UI 環境変数の参照
```

Using an image hosted on [AWS ECR](https://aws.amazon.com/ecr/) requires authentication using AWS credentials. By default, CircleCI uses the AWS credentials that you add to the Project > Settings > AWS Permissions page in the CircleCI application or by setting the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` project environment variables. It is also possible to set the credentials by using `aws_auth` field as in the following example:

```yaml
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定するか
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # UI から設定したプロジェクトの環境変数を参照するように指定します
```

It is possible to reuse [declared commands]({{ site.baseurl }}/2.0/reusing-config/) in a job when using version 2.1. The following example invokes the `sayhello` command.

```yaml
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - sayhello:
          to: "Lev"
```

#### **`machine`**
{: #machine }
{:.no_toc}

The [machine executor]({{ site.baseurl }}/2.0/executor-types) is configured by using the `machine` key, which takes a map:

| キー                     | 必須 | Type   | 説明                                                                                                                                                                                                                                       |
| ---------------------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image                  | ○  | String | 使用する VM イメージ。 [使用可能なイメージ](#使用可能な-machine-イメージ)を参照してください。 **メモ:** このキーは、オンプレミス環境では**サポートされません**。 ユーザーのサーバーにインストールされた CircleCI 上の `machine` Executor イメージをカスタマイズする方法については、[VM サービスに関するドキュメント]({{ site.baseurl }}/2.0/vm-service)を参照してください。 |
| docker_layer_caching | ×  | ブール値   | `true` に設定すると、[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching)が有効になります。 **メモ:** お使いのアカウントでこの有料の機能を有効化するには、サポート チケットをオープンしてください。CircleCI 営業担当者から連絡を差し上げます。                                                                |
{: class="table table-striped"}


Example:

```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:202010-01
    steps:
      - checkout
      - run:
          name: "テスト"
          command: echo "Hi"
```

##### 使用可能な `machine` イメージ
{: #available-machine-images }
CircleCI supports multiple machine images that can be specified in the `image` field:

* `ubuntu-2004:202104-01` - Ubuntu 20.04, Docker v20.10.6, Docker Compose v1.29.1,
* `ubuntu-2004:202101-01` - Ubuntu 20.04, Docker v20.10.2, Docker Compose v1.28.2,
* `ubuntu-2004:202010-01` - Ubuntu 20.04, Docker v19.03.13, Docker Compose v1.27.4, `ubuntu-2004:202008-01` is an alias

* `ubuntu-1604:202104-01` - Ubuntu 16.04, Docker v19.03.15, Docker Compose v1.29.1, final release by CircleCI
* `ubuntu-1604:202101-01` - Ubuntu 16.04, Docker v19.03.14, Docker Compose v1.28.2, 2nd to last release
* `ubuntu-1604:202010-01` - Ubuntu 16.04, Docker v19.03.13, Docker Compose v1.27.4
* `ubuntu-1604:202007-01` - Ubuntu 16.04, Docker v19.03.12, Docker Compose v1.26.1
* `ubuntu-1604:202004-01` - Ubuntu 16.04, Docker v19.03.8, Docker Compose v1.25.5
* `ubuntu-1604:201903-01` - Ubuntu 16.04, Docker v18.09.3, Docker Compose v1.23.1

***Note:*** *Ubuntu 16.04 has reached the end of its LTS window as of April 2021 and will no longer be supported by Canonical. As a result, `ubuntu-1604:202104-01` is the final Ubuntu 16.04 image released by CircleCI. We suggest upgrading to the latest Ubuntu 20.04 image for continued releases and support past April 2021.*

The machine executor supports [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) which is useful when you are building Docker images during your job or Workflow.

##### 使用可能な Linux GPU イメージ
{: #available-linux-gpu-images }

When using the [Linux GPU executor](#gpu-executor-linux), the available images are:

* `ubuntu-1604-cuda-11.1:202012-01` - CUDA v11.1、Docker v19.03.13、nvidia-container-toolkit v1.4.0-1
* `ubuntu-1604-cuda-10.2:202012-01` - CUDA v10.2、Docker v19.03.13、nvidia-container-toolkit v1.3.0-1
* `ubuntu-1604-cuda-10.1:201909-23` - CUDA v10.1、Docker v19.03.0-ce、nvidia-docker v2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA v9.2、Docker v19.03.0-ce、nvidia-docker v2.2.2

##### 使用可能な Windows GPU イメージ
{: #available-windows-gpu-image }

When using the [Windows GPU executor](#gpu-executor-windows), the available image is:

* `windows-server-2019-nvidia:stable` - Windows Server 2019、CUDA 10.1。 このイメージはデフォルトです。

**Example**

```yaml
version: 2.1
workflows:
  main:
    jobs:
      - build
jobs:
  build:
    machine:
      image: windows-server-2019-nvidia:stable
      docker_layer_caching: true    # デフォルトは false
```

#### **`macos`**
{: #macos }
{:.no_toc}

CircleCI supports running jobs on [macOS](https://developer.apple.com/macos/), to allow you to build, test, and deploy apps for macOS, [iOS](https://developer.apple.com/ios/), [tvOS](https://developer.apple.com/tvos/) and [watchOS](https://developer.apple.com/watchos/). To run a job in a macOS virtual machine, you must add the `macos` key to the top-level configuration for the job and specify the version of Xcode you would like to use.

| キー    | 必須 | Type   | 説明                                                                                                                                               |
| ----- | -- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| xcode | ○  | String | 仮想マシンにインストールする Xcode のバージョン。iOS でのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#サポートされている-xcode-のバージョン)」を参照してください。 |
{: class="table table-striped"}

**Example:** Use a macOS virtual machine with Xcode version 11.3:

```yaml
jobs:
  build:
    macos:
      xcode: "11.3.0"
```

#### **`windows`**
{: #windows }
{:.no_toc}

CircleCI は、Windows 上でのジョブ実行をサポートしています。 To run a job on a Windows machine, you must add the `windows` key to the top-level configuration for the job. Orb を使用すると、Windows ジョブを簡単にセットアップできます。 To learn more about prerequisites to running Windows jobs and what Windows machines can offer, consult the [Hello World on Windows]({{ site.baseurl }}/2.0/hello-world-windows) document.


**Example:** Use a windows executor to run a simple job.

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: echo 'Hello, Windows'
```

#### **`branches` – 非推奨**
{: #branches-deprecated }

**This key is deprecated. Use [workflows filtering](#jobfilters) to control which jobs run for which branches.**

Defines rules for allowing/blocking execution of some branches if Workflows are **not** configured and you are using 2.0 (not 2.1) config. If you are using [Workflows]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows), job-level branches will be ignored and must be configured in the Workflows section of your `config.yml` file. If you are using 2.1 config, you will need to add a workflow in order to use filtering. See the [workflows](#workflows) section for details. The job-level `branch` key takes a map:

| キー     | 必須 | Type | 説明              |
| ------ | -- | ---- | --------------- |
| only   | ×  | リスト  | 実行するブランチのみのリスト。 |
| ignore | ×  | リスト  | 無視するブランチのリスト。   |
{: class="table table-striped"}

Both `only` and `ignore` lists can have full names and regular expressions. Regular expressions must match the **entire** string. たとえば、以下のようになります。

``` YAML
jobs:
  build:
    branches:
      only:
        - master
        - /rc-.*/
```

この場合は、"master" ブランチと、正規表現 "rc-.*" に一致するブランチのみが実行されます。

``` YAML
jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

こちらの例では、"develop" ブランチと正規表現 "feature-.*" に一致するブランチを除くすべてのブランチが実行されます。

If both `ignore` and `only` are present in config, only `ignore` will be taken into account.

構成されたルールによって実行されなかったジョブは、UI のジョブ一覧にスキップのマーク付きで表示されます。

To ensure the job runs for **all** branches, either don't use the `branches` key, or use the `only` key along with the regular expression: `/.*/` to catch all branches.

#### **`resource_class`**
{: #resourceclass }

The `resource_class` feature allows configuring CPU and RAM resources for each job. 下表に示すように、Executor ごとにさまざまなリソース クラスが提供されています。

CircleCI では、すべてのお客様がシステムを安定した状態で利用できるよう、リソース クラスごとに同時処理数のソフト制限を設けています。 Performance プランまたは Custom プランを使用していて、特定のリソース クラスで待機時間が発生している場合は、このソフト制限に達している可能性があります。 [Contact CircleCI support](https://support.circleci.com/hc/en-us/requests/new) to request a raise on these limits for your account.

**Note:** This feature is automatically enabled on free and Performance plans. Free プランのお客様の場合、利用可能なリソース クラスは Linux が small または medium、Windows が medium に制限されています。 MacOS は Free プランでは利用できません。

**For self-hosted installations of CircleCI Server contact your system administrator for a list of available resource classes**. See Server Administration documents for further information: [Nomad Client System Requirements]({{ site.baseurl }}/2.0/server-ports/#nomad-clients) and [Server Resource Classes]({{ site.baseurl }}/2.0/customizations/#resource-classes).

##### Docker Executor
{: #docker-executor }

| クラス                    | vCPU | RAM  |
| ---------------------- | ---- | ---- |
| small                  | 1    | 2GB  |
| medium (デフォルト)         | 2    | 4GB  |
| medium+                | 3    | 6GB  |
| large                  | 4    | 8 GB |
| xlarge                 | 8    | 16GB |
| 2xlarge<sup>(2)</sup>  | 16   | 32GB |
| 2xlarge+<sup>(2)</sup> | 20   | 40GB |
{: class="table table-striped"}

###### 例
{: #example-usage }

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    resource_class: xlarge
    steps:
      ... // 他の構成
```

You may also use the `resource_class` to configure a [runner instance](https://circleci.com/docs/2.0/runner-overview/#section=configuration).

For example:

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### machine Executor (Linux)
{: #machine-executor-linux }

{% include snippets/machine-resource-table.md %}

###### 例
{: #example-usage }
```yaml
jobs:
  build:
    machine:
      image: ubuntu-2004:202010-01 # 推奨 Linux イメージ
    resource_class: large
    steps:
      ... // 他の構成
```

You may also use the `machine` class to configure a [runner instance](https://circleci.com/docs/2.0/runner-overview/#section=configuration).

For example:

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### macOS Executor
{: #macos-executor }

| クラス                 | vCPU | RAM  |
| ------------------- | ---- | ---- |
| medium (デフォルト)      | 4    | 8 GB |
| large<sup>(3)</sup> | 8    | 16GB |
{: class="table table-striped"}

###### 例
{: #example-usage }
```yaml
jobs:
  build:
    macos:
      xcode: "11.3.0"
    resource_class: large
    steps:
      ... // 他の構成
```

##### Windows Executor
{: #windows-executor }

| クラス            | vCPU | RAM   |
| -------------- | ---- | ----- |
| medium (デフォルト) | 4    | 15GB  |
| large          | 8    | 30GB  |
| xlarge         | 16   | 60GB  |
| 2xlarge        | 32   | 128GB |
{: class="table table-striped"}

###### 例
{: #example-usage }
```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor:
      name: win/default
      size: "medium" # "medium"、"large"、"xlarge"、"2xlarge" のいずれを指定可能
    steps:
      - run: Write-Host 'Hello, Windows'
```

Note the way resource class is set is different for `windows` because the executor is defined within the windows orb.

See the [Windows Getting Started document]({{ site.baseurl }}/2.0/hello-world-windows/) for more details and examples of using the Windows executor.

##### GPU Executor (Linux)
{: #gpu-executor-linux }

| クラス                             | vCPU | RAM | GPU | GPU モデル         | GPU メモリ (GiB) |
| ------------------------------- | ---- | --- | --- | --------------- | ------------- |
| gpu.nvidia.small<sup>(2)</sup>  | 4    | 15  | 1   | NVIDIA Tesla P4 | 8             |
| gpu.nvidia.medium<sup>(2)</sup> | 8    | 30  | 1   | NVIDIA Tesla T4 | 16            |
{: class="table table-striped"}

###### 例
{: #example-usage }
```yaml
version: 2.1

jobs:
  build:
    machine:
      resource_class: gpu.nvidia.small
      image: ubuntu-1604-cuda-10.1:201909-23
    steps:
      - run: nvidia-smi
      - run: docker run --gpus all nvidia/cuda:9.0-base nvidia-smi
```

See the [Available Linux GPU images](#available-linux-gpu-images) section for the full list of available images.

##### GPU Executor (Windows)
{: #gpu-executor-windows }

| クラス                                     | vCPU | RAM | GPU | GPU モデル         | GPU メモリ (GiB) |
| --------------------------------------- | ---- | --- | --- | --------------- | ------------- |
| windows.gpu.nvidia.medium<sup>(2)</sup> | 16   | 60  | 1   | NVIDIA Tesla T4 | 16            |
{: class="table table-striped"}

###### 例
{: #example-usage }
```yaml
version: 2.1
orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - checkout
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

<sup>(2)</sup> _This resource requires review by our support team. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to request access._

<sup>(3)</sup> _This resource is available only for customers with an annual contract. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to learn more about our annual plans._

**Note**: Java, Erlang and any other languages that introspect the `/proc` directory for information about CPU count may require additional configuration to prevent them from slowing down when using the CircleCI 2.0 resource class feature. この問題が発生すると、32 個の CPU コアを要求していても、1 コアを要求する場合よりも実行速度が低下する場合があります。 この問題が発生する言語をお使いの場合は、保証された CPU リソースに基づいて CPU 数を固定する必要があります。


**Note**: If you want to confirm how much memory you have been allocated, you can check the cgroup memory hierarchy limit with `grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat`.

#### **`steps`**
{: #steps }

The `steps` setting in a job should be a list of single key/value pairs, the key of which indicates the step type. 値は (そのステップの種類の要件に従って) 構成マップまたは文字列で記述します。 たとえば、マップで記述する場合は以下のようになります。

```yaml
jobs:
  build:
    working_directory: ~/canary-python
    environment:
      FOO: bar
    steps:
      - run:
          name: テストの実行
          command: make test
```

Here `run` is a step type. The `name` attribute is used by the UI for display purposes. The `command` attribute is specific for `run` step and defines command to execute.

一部のステップは省略構文を実装しており、 For example, `run` may be also be called like this:

```
jobs:
  build:
    steps:
      - run: make test
```

In its short form, the `run` step allows us to directly specify which `command` to execute as a string value. In this case step itself provides default suitable values for other attributes (`name` here will have the same value as `command`, for example).

さらに一部のステップには別の省略表記があり、キーと値のペアの代わりに単なる文字列のステップ名を使用できます。

```
jobs:
  build:
    steps:
      - checkout
```

In this case, the `checkout` step will checkout project source code into the job's [`working_directory`](#jobs).

In general all steps can be described as:

| キー                   | 必須 | Type      | 説明                              |
| -------------------- | -- | --------- | ------------------------------- |
| &lt;step_type> | ○  | マップまたは文字列 | ステップの構成マップ、またはステップによって規定された文字列。 |
{: class="table table-striped"}

定義済みステップについて、以下に詳しく説明します。

##### **`run`**
{: #run }

Used for invoking all command-line programs, taking either a map of configuration values, or, when called in its short-form, a string that will be used as both the `command` and `name`. run コマンドは、デフォルトでは非ログイン シェルで実行されます。したがって、ドットファイルをコマンドの中で明示的に参照する必要があります。

| キー                  | 必須 | Type   | 説明                                                                                                                                                       |
| ------------------- | -- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| command             | ○  | String | シェルから実行するコマンド。                                                                                                                                           |
| name                | ×  | String | Title of the step to be shown in the CircleCI UI (default: full `command`)                                                                               |
| shell               | ×  | String | Shell to use for execution command (default: See [Default Shell Options](#default-shell-options))                                                        |
| environment         | ×  | マップ    | コマンドに対するローカル スコープとなる追加の環境変数。                                                                                                                             |
| background          | ×  | ブール値   | このステップをバックグラウンドで実行するかどうかの設定 (デフォルトは false)。                                                                                                              |
| working_directory   | ×  | String | In which directory to run this step. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`)                        |
| no_output_timeout | ×  | String | 出力のないままコマンドを実行できる経過時間。 「20m」「1.25h」「5s」のように、数字の後に単位を付けた文字列で記述します (デフォルトは 10 分)                                                                           |
| when                | ×  | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`) |
{: class="table table-striped"}

Each `run` declaration represents a new shell. It is possible to specify a multi-line `command`, each line of which will be run in the same shell:

``` YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

You can also configure commands to run [in the background](#background-commands) if you don't want to wait for the step to complete before moving on to subsequent run steps.

###### _デフォルトのシェル オプション_
{: #default-shell-options }

For jobs that run on **Linux**, the default value of the `shell` option is `/bin/bash -eo pipefail` if `/bin/bash` is present in the build container. Otherwise it is `/bin/sh -eo pipefail`. The default shell is not a login shell (`--login` or `-l` are not specified). Hence, the shell will **not** source your `~/.bash_profile`, `~/.bash_login`, `~/.profile` files.

For jobs that run on **macOS**, the default shell is `/bin/bash --login -eo pipefail`. このシェルは、非対話型のログイン シェルです。 The shell will execute `/etc/profile/` followed by `~/.bash_profile` before every step.

For more information about which files are executed when bash is invocated, [see the `INVOCATION` section of the `bash` manpage](https://linux.die.net/man/1/bash).

Descriptions of the `-eo pipefail` options are provided below.

`-e`

> パイプライン (1 つのコマンドで構成される場合を含む)、かっこ「()」で囲まれたサブシェル コマンド、または中かっこ「{}」で囲まれたコマンド リストの一部として実行されるコマンドの 1 つが 0 以外のステータスで終了した場合は、直ちに終了します。

So if in the previous example `mkdir` failed to create a directory and returned a non-zero status, then command execution would be terminated, and the whole step would be marked as failed. If you desire the opposite behaviour, you need to add `set +e` in your `command` or override the default `shell` in your configuration map of `run`. たとえば、以下のようになります。
``` YAML
- run:
    command: |
      echo Running test
      set +e
      mkdir -p /tmp/test-results
      make test

- run:
    shell: /bin/sh
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

`-o pipefail`

> pipefail を有効にすると、パイプラインの戻り値は、0 以外のステータスで終了した最後 (右端) のコマンドのステータス値か、すべてのコマンドが正しく終了した場合に 0 となります。 シェルは、パイプライン内のすべてのコマンドの終了を待って値を返します。

たとえば、以下のようになります。
``` YAML
- run: make test | tee test-output.log
```

If `make test` fails, the `-o pipefail` option will cause the whole step to fail. Without `-o pipefail`, the step will always run successfully because the result of the whole pipeline is determined by the last command (`tee test-output.log`), which will always return a zero status.

Note that even if `make test` fails the rest of pipeline will be executed.

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

In general, we recommend using the default options (`-eo pipefail`) because they show errors in intermediate commands and simplify debugging job failures. For convenience, the UI displays the used shell and all active options for each `run` step.

For more information, see the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) document.

###### _バックグラウンド コマンド_
{: #background-commands }

The `background` attribute enables you to configure commands to run in the background. Job execution will immediately proceed to the next step rather than waiting for return of a command with the `background` attribute set to `true`. 以下は、Selenium テストにおいてよく必要となる、X 仮想フレームバッファをバックグラウンドで実行するための構成例です。

``` YAML
- run:
    name: X 仮想フレームバッファの実行
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _省略構文_
{: #shorthand-syntax }

`run` has a very convenient shorthand syntax:

``` YAML
- run: make test

# 簡略化したうえで複数行のコマンドを実行
- run: |
    mkdir -p /tmp/test-results
    make test
```
In this case, `command` and `name` become the string value of `run`, and the rest of the config map for that `run` have their default values.

###### `when` 属性
{: #the-when-attribute }

CircleCI のデフォルトでは、ジョブ ステップが `config.yml` に定義された順序で一度に 1 つずつ、いずれかのステップが失敗する (0 以外の終了コードを返す) まで実行されます。 コマンドが失敗すると、以降のジョブ ステップは実行されません。

ジョブ ステップに `when` 属性を追加すると、このデフォルトの動作をオーバーライドして、ジョブのステータスに応じてステップを実行するかスキップするかを選択できるようになります。

デフォルト値の `on_success` は、それまでのすべてのステップが成功した (終了コード 0 を返した) 場合にのみ、そのステップが実行されることを意味します。

`always` は、それまでのステップの終了ステータスに関係なく、そのステップが実行されることを意味します。 それまでのステップの成否にかかわらずタスクを実行したい場合に便利です。 例として、ログやコード カバレッジ データをどこかにアップロードする必要があるジョブ ステップが挙げられます。

`on_fail` は、それまでのステップの 1 つが失敗した (0 以外の終了コードを返した) 場合にのみ、そのステップが実行されることを意味します。 失敗したテストのデバッグに役立てるために何らかの診断データを保存したり、失敗に関するカスタム通知 (メールの送信やチャットルームへのアラートのトリガーなど) を実行したりする場合に、よく使用されます。``

**メモ:** `store_artifacts`、`store_test_results` などの一部のステップは、**それより前のステップが失敗しても** (0 以外の終了コードが返された場合でも) 常に実行されます。 ただし、ジョブがキャンセル要求により**強制終了**された場合、または実行時間がグローバル タイムアウト上限である 5 時間に達した場合、`when` 属性、`store_artifacts`、`store_test_results` は実行されません。

``` YAML
- run:
    name: CodeCov.io データのアップロード
    command: bash <(curl -s https://codecov.io/bash) -F unittests
    when: always # 成功しても失敗しても、コード カバレッジの結果をアップロードします
```



###### Ending a job from within a `step`
{: #ending-a-job-from-within-a-step }

A job can exit without failing by using `run: circleci-agent step halt`. これは、条件に従ってジョブを実行する必要がある場合に便利です。

Here is an example where `halt` is used to avoid running a job on the `develop` branch:

``` YAML
run: |
    if [ "$CIRCLE_BRANCH" = "develop" ]; then
        circleci-agent step halt
    fi
```

###### 例
{: #example }

```yaml
steps:
  - run:
      name: アプリケーションのテスト
      command: make test
      shell: /bin/bash
      working_directory: ~/my-app
      no_output_timeout: 30m
      environment:
        FOO: bar

  - run: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

  - run: |
      sudo -u root createuser -h localhost --superuser ubuntu &&
      sudo createdb -h localhost test_db

  - run:
      name: 失敗したテストのアップロード
      command: curl --data fail_tests.log http://example.com/error_logs
      when: on_fail
```

##### **`when` ステップ** (version: 2.1 が必須)
{: #the-when-step-requires-version-21 }

A conditional step consists of a step with the key `when` or `unless`. `when` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 The purpose of the `when` step is customizing commands and job configuration to run on custom conditions (determined at config-compile time) that are checked before a workflow runs. See the [Conditional Steps section of the Reusing Config document]({{ site.baseurl }}/2.0/reusing-config/#defining-conditional-steps) for more details.

| キー        | 必須 | Type  | 説明                                                                                      |
| --------- | -- | ----- | --------------------------------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | A list of steps to execute when the condition is true                                   |
{: class="table table-striped"}

###### *例*
{: #example }

```
version: 2.1

jobs: # 条件付きステップは「commands:」でも定義できる  job_with_optional_custom_checkout:
    parameters:
      custom_checkout:
        type: string
        default: ""
    machine: true
    steps:
      - when:
          condition: <<parameters.custom_checkout>>
          steps:
            - run: echo "独自のチェックアウト処理"
      - unless:
          condition: <<parameters.custom_checkout>>
          steps:
            - checkout
workflows:
  build-test-deploy:
    jobs:
      - job_with_optional_custom_checkout:
          custom_checkout: "空文字列でなければ正常に終了"
      - job_with_optional_custom_checkout
```

##### **`checkout`**
{: #checkout }

A special step used to check out source code to the configured `path` (defaults to the `working_directory`). これが特別なステップである理由は、単なるヘルパー関数ではなく、コードを自動的に簡単にチェックアウトできるように設計されているからです。 このステップは SSH でチェックアウトするように git を設定するため、HTTPS で git を実行する必要がある場合は、このステップを使用しないでください。

| キー   | 必須 | Type   | 説明                                                                                                               |
| ---- | -- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| path | ×  | String | Checkout directory. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`) |
{: class="table table-striped"}

If `path` already exists and is:
 * a git repo - step will not clone whole repo, instead will fetch origin
 * Git リポジトリ以外 - ステップは失敗します。

In the case of `checkout`, the step type is just a string with no additional attributes:

``` YAML
- checkout
```

**Note:** CircleCI does not check out submodules. If your project requires submodules, add `run` steps with appropriate commands as shown in the following example:

``` YAML
- checkout
- run: git submodule sync
- run: git submodule update --init
```

This command will automatically add the required authenticity keys for interacting with GitHub and Bitbucket over SSH, which is detailed further in our [integration guide]({{ site.baseurl }}/2.0/gh-bb-integration/#establishing-the-authenticity-of-an-ssh-host) – this guide will also be helpful if you wish to implement a custom checkout command.

**Note:** The `checkout` step will configure Git to skip automatic garbage collection. If you are caching your `.git` directory with [restore_cache](#restore_cache) and would like to use garbage collection to reduce its size, you may wish to use a [run](#run) step with command `git gc` before doing so.

##### **`setup_remote_docker`**
{: #setupremotedocker }

Creates a remote Docker environment configured to execute Docker commands. See [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/) for details.

| キー                     | 必須 | Type    | 説明                                                                                                                                                                                      |
| ---------------------- | -- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker_layer_caching | ×  | boolean | set this to `true` to enable [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/) in the Remote Docker Environment (default: `false`)                                   |
| version                | ×  | String  | Version string of Docker you would like to use (default: `17.09.0-ce`). View the list of supported docker versions [here]({{site.baseurl}}/2.0/building-docker-images/#docker-version). |
{: class="table table-striped"}

**Notes**:

- A paid account on a [Performance or Custom Plan](https://circleci.com/pricing/) is required to access Docker Layer Caching.
- `setup_remote_docker` is not compatible with the `machine` executor. See [Docker Layer Caching in Machine Executor]({{ site.baseurl }}/2.0/docker-layer-caching/#machine-executor) for information on how to enable DLC with the `machine` executor.
- The `version` key is not currently supported on CircleCI installed in your private cloud or datacenter. お使いのリモート Docker 環境にインストールされている Docker バージョンについては、システム管理者にお問い合わせください。

##### **`save_cache`**
{: #savecache }

Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later jobs can [restore this cache](#restore_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

| キー    | 必須 | Type   | 説明                                                                                                                                                       |
| ----- | -- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| paths | ○  | リスト    | キャッシュに追加するディレクトリのリスト。                                                                                                                                    |
| key   | ○  | String | このキャッシュの一意の識別子。                                                                                                                                          |
| name  | ×  | String | CircleCI の UI に表示されるステップのタイトル (デフォルトは「Saving Cache」)。                                                                                                    |
| when  | ×  | String | [Specify when to enable or disable the step](#the-when-attribute). Takes the following values: `always`, `on_success`, `on_fail` (default: `on_success`) |
{: class="table table-striped"}

The cache for a specific `key` is immutable and cannot be changed once written.

**Note** If the cache for the given `key` already exists it won't be modified, and job execution will proceed to the next step.

When storing a new cache, the `key` value may contain special templated values for your convenience:

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                                                                                     |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ビルド番号。                                                                                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                                                                                    |
| {% raw %}`{{ .CheckoutKey }}`{% endraw %}              | リポジトリのチェックアウトに使用する SSH 鍵。                                                                                                                                                                                                                                                                                                                                                                                             |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | The environment variable `variableName` (supports any environment variable [exported by CircleCI](https://circleci.com/docs/2.0/env-vars/#circleci-environment-variable-descriptions) or added to a specific [Context](https://circleci.com/docs/2.0/contexts)—not any arbitrary environment variable).                                                                                                               |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。 リポジトリにコミットするファイルのみを指定できます。絶対パス、または現在の作業ディレクトリからの相対パスで参照できます。 Good candidates are dependency manifests, such as `package-lock.json`, `pom.xml` or `project.clj`. It's important that this file does not change between `restore_cache` and `save_cache`, otherwise the cache will be saved under a cache key different than the one used at `restore_cache` time. |
| {% raw %}`{{ epoch }}`{% endraw %}                     | UNIX エポックからの秒数で表される現在時刻。                                                                                                                                                                                                                                                                                                                                                                                              |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU の情報。  Useful when caching compiled binaries that depend on OS and CPU architecture, for example, `darwin amd64` versus `linux i386/32-bit`.                                                                                                                                                                                                                                                                  |
{: class="table table-striped"}

During step execution, the templates above will be replaced by runtime values and use the resultant string as the `key`.

テンプレートの例
 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - cache will be regenerated every time something is changed in `package-lock.json` file, different branches of this project will generate the same cache key.
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - same as the previous one, but each branch will generate separate cache
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - every run of a job will generate a separate cache

While choosing suitable templates for your cache `key`, keep in mind that cache saving is not a free operation, because it will take some time to upload the cache to our storage. So it make sense to have a `key` that generates a new cache only if something actually changed and avoid generating a new one every run of a job.

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code> など) を付加すると便利です。 こうすれば、プレフィックスのバージョン番号を増やしていくだけで、キャッシュ全体を再生成できます。
</div>

###### _例_
{: #example }

{% raw %}
``` YAML
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

##### **`restore_cache`**
{: #restorecache }

Restores a previously saved cache based on a `key`. Cache needs to have been saved first for this key using [`save_cache` step](#save_cache). Learn more in [the caching documentation]({{ site.baseurl }}/2.0/caching/).

| キー   | 必須               | Type   | 説明                                                        |
| ---- | ---------------- | ------ | --------------------------------------------------------- |
| key  | ○ <sup>(1)</sup> | String | 復元するキャッシュ キーを 1 つだけ指定します。                                 |
| keys | ○ <sup>(1)</sup> | リスト    | 復元するキャッシュを検索するためのキャッシュ キーのリスト。 最初に一致したキーのみが復元されます。        |
| name | ×                | String | CircleCI の UI に表示されるステップのタイトル (デフォルトは "Restoring Cache")。 |
{: class="table table-striped"}

<sup>(1)</sup> at least one attribute has to be present. If `key` and `keys` are both given, `key` will be checked first, and then `keys`.

既存のキーを対象に前方一致で検索が行われます。

**Note**: When there are multiple matches, the **most recent match** will be used, even if there is a more precise match.

たとえば、以下のようになります。

``` YAML
steps:
  - save_cache:
      key: v1-myapp-cache
      paths:
        - ~/d1

  - save_cache:
      key: v1-myapp-cache-new
      paths:
        - ~/d2

  - run: rm -f ~/d1 ~/d2

  - restore_cache:
      key: v1-myapp-cache
```

In this case cache `v1-myapp-cache-new` will be restored because it's the most recent match with `v1-myapp-cache` prefix even if the first key (`v1-myapp-cache`) has exact match.

For more information on key formatting, see the `key` section of [`save_cache` step](#save_cache).

When CircleCI encounters a list of `keys`, the cache will be restored from the first one matching an existing cache. Most probably you would want to have a more specific key to be first (for example, cache for exact version of `package-lock.json` file) and more generic keys after (for example, any cache for this project). キーに該当するキャッシュが存在しない場合は、警告が表示され、ステップがスキップされます。

A path is not required here because the cache will be restored to the location from which it was originally saved.

###### 例
{: #example }

{% raw %}
``` YAML
- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # `project.clj` の正確なバージョンに対応するキャッシュが存在しない場合は、最新のキャッシュをロードします
      - v1-myapp-

# ... アプリケーションをビルドおよびテストするステップ ...

# キャッシュは「project.clj」のバージョンごとに一度だけ保存する
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

##### **`deploy` – DEPRECATED**
{: #deploy-deprecated }

**This key is deprecated. For improved control over your deployments use [workflows](#workflows) plus associated filtering and scheduling keys.**

Special step for deploying artifacts.

`deploy` uses the same configuration map and semantics as [`run`](#run) step. Jobs may have more than one `deploy` step.

In general `deploy` step behaves just like `run` with two exceptions:

- In a job with `parallelism`, the `deploy` step will only be executed by node #0 and only if all nodes succeed. #0 以外のノードは、このステップをスキップします。
- In a job that runs with SSH, the `deploy` step will not execute, and the following action will show instead: > **skipping deploy** > Running in SSH mode.  Avoid deploying.

When using the `deploy` step, it is also helpful to understand how you can use workflows to orchestrate jobs and trigger jobs. ワークフローの使用方法については、以下を参照してください。

- [ワークフロー](https://circleci.com/ja/docs/2.0/workflows/)
- [`workflows`](https://circleci.com/docs/2.0/configuration-reference/#section=configuration)

###### 例
{: #example }

``` YAML
- deploy:
    command: |
      if [ "${CIRCLE_BRANCH}" == "master" ]; then
        ansible-playbook site.yml
      fi
```

**Note:** The `run` step allows you to use a shortcut like `run: my command`; however, if you try to use a similar shortcut for the `deploy` step like `deploy: my command`, then you will receive the following error message in CircleCI:

`In step 3 definition: This type of step does not support compressed syntax`

##### **`store_artifacts`**
{: #storeartifacts }

Step to store artifacts (for example logs, binaries, etc) to be available in the web app or through the API. See the [Uploading Artifacts]({{ site.baseurl }}/2.0/artifacts/) document for more information.

| キー          | 必須 | Type   | 説明                                                                                                               |
| ----------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| path        | ○  | String | ジョブ アーティファクトとして保存するプライマリ コンテナ内のディレクトリ。                                                                           |
| destination | ×  | String | Prefix added to the artifact paths in the artifacts API (default: the directory of the file specified in `path`) |
{: class="table table-striped"}

There can be multiple `store_artifacts` steps in a job. 各ステップで一意のプレフィックスを使用すると、ファイルの上書きを防止できます。

###### 例
{: #example }

``` YAML
- run:
    name: Jekyll サイトのビルド
    command: bundle exec jekyll build --source jekyll --destination jekyll/_site/docs/
- store_artifacts:
    path: jekyll/_site/docs/
    destination: circleci-docs
```

##### **`store_test_results`**
{: #storetestresults }

ビルドのテスト結果をアップロードおよび保存するための特別なステップです。 テスト結果は、CircleCI Web アプリケーションで各ビルドの「テスト サマリー」セクションに表示されます。 テスト結果を保存すると、テスト スイートのタイミング分析に役立ちます。

It is also possible to store test results as a build artifact; to do so, please refer to [the **store_artifacts** step](#store_artifacts).

| キー   | 必須 | Type   | 説明                                                                                                                                                |
| ---- | -- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| path | ○  | String | Path (absolute, or relative to your `working_directory`) to directory containing subdirectories of JUnit XML or Cucumber JSON test metadata files |
{: class="table table-striped"}

**Note:** Please write your tests to **subdirectories** of your `store_test_results` path, ideally named to match the names of your particular test suites, in order for CircleCI to correctly infer the names of your reports. If you do not write your reports to subdirectories, you will see reports in your "Test Summary" section such as `Your build ran 71 tests in unknown`, instead of, for example, `Your build ran 71 tests in rspec`.

###### _例_
{: #example }

ディレクトリ構造

```
test-results
├── jest
│   └── results.xml
├── mocha
│   └── results.xml
└── rspec
    └── results.xml
```

`config.yml` syntax:

``` YAML
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**
{: #persisttoworkspace }

Special step used to persist a temporary file to be used by another job in the workflow.

**Note:** Workspaces are stored for up to 15 days after being created. 作成から 15 日以上が経過したワークスペースを使用するジョブは、すべて失敗します。これには、ワークフローの部分的な再実行や SSH による個別ジョブの再実行も含まれます。

| キー    | 必須 | Type   | 説明                                                                                                                 |
| ----- | -- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| root  | ○  | String | Either an absolute path or a path relative to `working_directory`                                                  |
| paths | ○  | リスト    | 共有ワークスペースに追加する、グロブで認識されるファイル、またはディレクトリへの非グロブ パス。 ワークスペースのルート ディレクトリへの相対パスと解釈され、 ワークスペースのルート ディレクトリ自体を指定することはできません。 |
{: class="table table-striped"}

root キーは、ワークスペースのルート ディレクトリとなる、コンテナ上のディレクトリを指定します。 paths の値は、すべてルート ディレクトリからの相対的パスです。

##### _root キーの例_
{: #example-for-root-key }

For example, the following step syntax persists the specified paths from `/tmp/dir` into the workspace, relative to the directory `/tmp/dir`.

``` YAML
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

After this step completes, the following directories are added to the workspace:

```
/tmp/dir/foo/bar
/tmp/dir/baz
```

###### _paths キーの例_
{: #example-for-paths-key }

``` YAML
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

The `paths` list uses `Glob` from Go, and the pattern matches [filepath.Match](https://golang.org/pkg/path/filepath/#Match).

```
pattern:
        { term }
term:
        '*'         区切り文字を除く任意の文字シーケンスに一致します
        '?'         区切り文字を除く任意の 1 文字に一致します
        '[' [ '^' ] { character-range } ']'
                    文字クラス (空白は不可)
        c           文字 c に一致します ('*'、'?'、'\\'、'[' 以外) 
        '\\' c      文字 c に一致します
character-range:
        c           文字 c に一致します ('\\'、'-'、']' 以外)
        '\\' c      文字 c に一致します
        lo '-' hi   lo <= c <= hi の範囲にある文字 c に一致します
```

The Go documentation states that the pattern may describe hierarchical names such as `/usr/*/bin/ed` (assuming the Separator is '/'). **Note:** Everything must be relative to the work space root directory.

##### **`attach_workspace`**
{: #attachworkspace }

Special step used to attach the workflow's workspace to the current container. ワークスペースのすべての内容がダウンロードされ、ワークスペースがアタッチされているディレクトリにコピーされます。

| キー | 必須 | Type   | 説明                    |
| -- | -- | ------ | --------------------- |
| at | ○  | String | ワークスペースのアタッチ先のディレクトリ。 |
{: class="table table-striped"}

###### _例_
{: #example }

``` YAML
- attach_workspace:
    at: /tmp/workspace
```

Each workflow has a temporary workspace associated with it. ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。 Jobs can add files into the workspace using the `persist_to_workspace` step and download the workspace content into their file system using the `attach_workspace` step. ワークスペースは追加専用です。ジョブは、ワークスペースにファイルを追加することはできますが、ワークスペースからファイルを削除することはできません。 各ジョブでは、そのアップストリームのジョブによってワークスペースに追加された内容を参照することのみ可能です。 ワークスペースをアタッチすると、アップストリーム ジョブがワークフロー グラフに現れる順番で、各アップストリーム ジョブからの「レイヤー」が適用されます。 2 つのジョブが同時に実行される場合、それらのレイヤーが適用される順番は不定になります。 複数の同時ジョブが同じファイル名を永続化する場合、ワークスペースのアタッチはエラーになります。

ワークフローが再実行される場合、それは、元のワークフローと同じワークスペースを継承します。 失敗したジョブのみを再実行する場合、再実行されるジョブは、元のワークフロー内のジョブと同じワークスペースの内容を参照することになります。

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| Type     | 存続期間                                 | 用途                                                                                      | 例                                                                                                                                                                                                                                            |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 1 Month                              | Preserve long-term artifacts.                                                           | Available in the Artifacts tab of the **Job page** under the `tmp/circle-artifacts.<hash>/container`   or similar directory.                                                                                                           |
| ワークスペース  | Duration of workflow (up to 15 days) | Attach the workspace in a downstream container with the `attach_workspace:` step.       | The `attach_workspace` copies and re-creates the entire workspace content when it runs.                                                                                                                                                      |
| キャッシュ    | 15 Days                              | Store non-vital data that may help the job run faster, for example npm or Gem packages. | The `save_cache` job step with a `path` to a list of directories to add and a `key` to uniquely identify the cache (for example, the branch, build number, or revision).   Restore the cache with `restore_cache` and the appropriate `key`. |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

##### **`add_ssh_keys`**
{: #addsshkeys }

Special step that adds SSH keys from a project's settings to a container. 指定する鍵を使用するように SSH を構成します。

| キー           | 必須 | Type | 説明                                               |
| ------------ | -- | ---- | ------------------------------------------------ |
| fingerprints | ×  | リスト  | 追加する鍵に対応するフィンガープリントのリスト (デフォルトでは、追加されるすべての鍵が対象)。 |
{: class="table table-striped"}

```yaml
steps:
  - add_ssh_keys:
      fingerprints:
        - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

**Note:** Even though CircleCI uses `ssh-agent` to sign all added SSH keys, you **must** use the `add_ssh_keys` key to actually add keys to a container.

##### `pipeline.` 値の使用
{: #using-pipeline-values }

Pipeline values are available to all pipeline configurations and can be used without previous declaration. 利用可能なパイプライン値は次のとおりです。

| 値                          | 説明                                                 |
| -------------------------- | -------------------------------------------------- |
| pipeline.id                | A globally unique id representing for the pipeline |
| pipeline.number            | パイプラインを表す、プロジェクトで一意の整数の ID                         |
| pipeline.project.git_url   | E.g. https://github.com/circleci/circleci-docs     |
| pipeline.project.type      | E.g. "github"                                      |
| pipeline.git.tag           | The tag triggering the pipeline                    |
| pipeline.git.branch        | The branch triggering the pipeline                 |
| pipeline.git.revision      | The current git revision                           |
| pipeline.git.base_revision | The previous git revision                          |
{: class="table table-striped"}

For example:

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/node:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

## **`workflows`**
{: #workflows }
Used for orchestrating all jobs. 各ワークフローは、キーとなるワークフロー名と、値となるマップで構成します。 A name should be unique within the current `config.yml`. The top-level keys for the Workflows configuration are `version` and `jobs`.

### **`version`**
{: #version }
The Workflows `version` field is used to issue warnings for deprecation or breaking changes during Beta.

| キー      | 必須 | Type   | 説明                      |
| ------- | -- | ------ | ----------------------- |
| version | ○  | String | Should currently be `2` |
{: class="table table-striped"}

### **<`workflow_name`>**
{: #lessworkflownamegreater }

A unique name for your workflow.

#### **`triggers`**
{: #triggers }
Specifies which triggers will cause this workflow to be executed. デフォルトの動作では、ブランチにプッシュされたときにワークフローがトリガーされます。

| キー       | 必須 | Type | 説明                              |
| -------- | -- | ---- | ------------------------------- |
| triggers | ×  | 配列   | Should currently be `schedule`. |
{: class="table table-striped"}

##### **`schedule`**
{: #schedule }
A workflow may have a `schedule` indicating it runs at a certain time, for example a nightly build that runs every day at 12am UTC:

```
workflows:
   version: 2
   nightly:
     triggers:
       - schedule:
           cron: "0 0 * * *"
           filters:
             branches:
               only:
                 - master
                 - beta
     jobs:
       - test
```
###### **`cron`**
{: #cron }
The `cron` key is defined using POSIX `crontab` syntax.

| キー   | 必須 | Type   | 説明                                                                                         |
| ---- | -- | ------ | ------------------------------------------------------------------------------------------ |
| cron | ○  | String | See the [crontab man page](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html). |
{: class="table table-striped"}

###### **`filters`**
{: #filters }
Trigger Filters can have the key `branches`.

| キー      | 必須 | Type | 説明                |
| ------- | -- | ---- | ----------------- |
| filters | ○  | マップ  | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

###### **`branches`**
{: #branches }
{:.no_toc}

The `branches` key controls whether the *current* branch should have a schedule trigger created for it, where *current* branch is the branch containing the `config.yml` file with the `trigger` stanza. That is, a push on the `master` branch will only schedule a [workflow]({{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-workflows) for the `master` branch.

Branches can have the keys `only` and `ignore` which either map to a single string naming a branch. You may also use regular expressions to match against branches by enclosing them with `/`'s, or map to a list of such strings. Regular expressions must match the **entire** string.

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | Type           | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ○  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ○  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

#### **`jobs`**
{: #jobs }
A job can have the keys `requires`, `context`, `type`, and `filters`.

| キー   | 必須 | Type | 説明                   |
| ---- | -- | ---- | -------------------- |
| jobs | ○  | リスト  | 依存関係に従って実行するジョブのリスト。 |
{: class="table table-striped"}

##### **<`job_name`>**
{: #lessjobnamegreater }

A job name that exists in your `config.yml`.

###### **`requires`**
{: #requires }
Jobs are run in parallel by default, so you must explicitly require any dependencies by their job name.

| キー       | 必須 | Type   | 説明                                                                                                                                                                                                                                                                                                                           |
| -------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| requires | ×  | リスト    | A list of jobs that must succeed for the job to start. Note: When jobs in the current workflow that are listed as dependencies are not executed (due to a filter function for example), their requirement as a dependency for other jobs will be ignored by the requires option. しかし、ジョブのすべての依存関係がフィルター処理されると、そのジョブは実行されません。 |
| name     | ×  | String | ジョブ名の代替名。 ジョブを複数回呼び出す場合に便利です。 同じジョブを複数回呼び出したいときや、あるジョブで同じ内容のジョブが必要なときなどに有効です (2.1 のみ)。                                                                                                                                                                                                                                       |
{: class="table table-striped"}

###### **`context`**
{: #context }
Jobs may be configured to use global environment variables set for an organization, see the [Contexts]({{ site.baseurl }}/2.0/contexts) document for adding a context in the application settings.

| キー      | 必須 | Type        | 説明                                                                                                                                                                      |
| ------- | -- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| context | ×  | String/List | The name of the context(s). The initial default name is `org-global`. 各コンテキスト名は一意である必要があります。 If using CircleCI Server, only a single Context per workflow is supported. |
{: class="table table-striped"}

###### **`type`**
{: #type }
A job may have a `type` of `approval` indicating it must be manually approved before downstream jobs may proceed. Jobs run in the dependency order until the workflow processes a job with the `type: approval` key followed by a job on which it depends, for example:

```
      - hold:
          type: approval
          requires:
            - test1
            - test2
      - deploy:
          requires:
            - hold
```
**Note:** The `hold` job name must not exist in the main configuration.

###### **`filters`**
{: #jobfilters }
Job Filters can have the key `branches` or `tags`. **Note** Workflows will ignore job-level branching. If you use job-level branching and later add workflows, you must remove the branching at the job level and instead declare it in the workflows section of your `config.yml`, as follows:

| キー      | 必須 | Type | 説明                |
| ------- | -- | ---- | ----------------- |
| filters | ×  | マップ  | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

The following is an example of how the CircleCI documentation uses a regex to filter running a workflow for building PDF documentation:

```yaml
# ...
workflows:
  build-deploy:
    jobs:
      - js_build
      - build_server_pdfs: # << the job to conditionally run based on the filter-by-branch-name.
          filters:
            branches:
              only: /server\/.*/
```

The above snippet causes the job  `build_server_pdfs` to only be run when the branch being built starts with "server/" in it.

You can read more about using regex in your config in the [Workflows document]({{ site.baseurl }}/2.0/workflows/#using-regular-expressions-to-filter-tags-and-branches).

###### **`branches`**
{: #branches }
{:.no_toc}
Branches can have the keys `only` and `ignore` which either map to a single string naming a branch. スラッシュで囲むことで正規表現でブランチに一致させたり、そのような文字列のリストでマップさせたりできます。 Regular expressions must match the **entire** string.

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | Type           | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ×  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

###### **`tags`**
{: #tags }
{:.no_toc}

CircleCI does not run workflows for tags unless you explicitly specify tag filters. さらに、ジョブが (直接的または間接的に) 他のジョブを必要とする場合は、それらのジョブにタグ フィルターを指定する必要があります。

Tags can have the keys `only` and `ignore` keys. スラッシュで囲むことで正規表現でタグに一致させたり、そのような文字列のリストでマップさせたりできます。 Regular expressions must match the **entire** string. 軽量のタグと注釈付きのタグがサポートされています。

- Any tags that match `only` will run the job.
- Any tags that match `ignore` will not run the job.
- If neither `only` nor `ignore` are specified then the job is skipped for all tags.
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー     | 必須 | Type           | 説明                 |
| ------ | -- | -------------- | ------------------ |
| tags   | ×  | マップ            | 実行するタグを定義するマップ。    |
| only   | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
| ignore | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
{: class="table table-striped"}

For more information, see the [Executing Workflows For a Git Tag]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag) section of the Workflows document.

###### **`matrix`** (requires version: 2.1)
{: #matrix-requires-version-21 }
The `matrix` stanza allows you to run a parameterized job multiple times with different arguments.

| キー         | 必須 | Type   | 説明                                                                                                                   |
| ---------- | -- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| parameters | ○  | マップ    | A map of parameter names to every value the job should be called with                                                |
| exclude    | ×  | リスト    | A list of argument maps that should be excluded from the matrix                                                      |
| alias      | ×  | String | An alias for the matrix, usable from another job's `requires` stanza. Defaults to the name of the job being executed |
{: class="table table-striped"}

The following is a basic example of using matrix jobs.

```yaml
workflows:
  workflow:
    jobs:
      - build:
          matrix:
            parameters:
              version: ["0.1", "0.2", "0.3"]
              platform: ["macos", "windows", "linux"]
```

This expands to 9 different `build` jobs, and could be equivalently written as:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-macos-0.1
          version: 0.1
          platform: macos
      - build:
          name: build-macos-0.2
          version: 0.2
          platform: macos
      - build:
          name: build-macos-0.3
          version: 0.3
          platform: macos
      - build:
          name: build-windows-0.1
          version: 0.1
          platform: windows
      - ...
```

###### Excluding sets of parameters from a matrix
{: #excluding-sets-of-parameters-from-a-matrix }
{:.no_toc}
Sometimes you may wish to run a job with every combination of arguments _except_ some value or values. You can use an `exclude` stanza to achieve this:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          matrix:
            parameters:
              a: [1, 2, 3]
              b: [4, 5, 6]
            exclude:
              - a: 3
                b: 5
```

The matrix above would expand into 8 jobs: every combination of the parameters `a` and `b`, excluding `{a: 3, b: 5}`

###### Dependencies and matrix jobs
{: #dependencies-and-matrix-jobs }
{:.no_toc}

To `require` an entire matrix (every job within the matrix), use its `alias`. The `alias` defaults to the name of the job being invoked.

```yaml
workflows:
  workflow:
    jobs:
      - deploy:
          matrix:
            parameters:
              version: ["0.1", "0.2"]
      - another-job:
          requires:
            - deploy
```

This means that `another-job` will require both deploy jobs in the matrix to finish before it runs.

Additionally, matrix jobs expose their parameter values via `<< matrix.* >>` which can be used to generate more complex workflows. For example, here is a `deploy` matrix where each job waits for its respective `build` job in another matrix.

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-v<< matrix.version >>
          matrix:
            parameters:
              version: ["0.1", "0.2"]
      - deploy:
          name: deploy-v<< matrix.version >>
          matrix:
            parameters:
              version: ["0.1", "0.2"]
          requires:
            - build-v<< matrix.version >>
```

This workflow will expand to:

```yaml
workflows:
  workflow:
    jobs:
      - build:
          name: build-v0.1
          version: 0.1
      - build:
          name: build-v0.2
          version: 0.2
      - deploy:
          name: deploy-v0.1
          version: 0.1
          requires:
            - build-v0.1
      - deploy:
          name: deploy-v0.2
          version: 0.2
          requires:
            - build-v0.2
```

###### **`pre-steps`** and **`post-steps`** (requires version: 2.1)
{: #pre-steps-and-post-steps-requires-version-21 }
Every job invocation in a workflow may optionally accept two special arguments: `pre-steps` and `post-steps`.

Steps under `pre-steps` are executed before any of the other steps in the job. `post-steps` の下のステップは、他のすべてのステップよりも後に実行されます。

事前ステップと事後ステップを使用すると、特定のジョブ内で、そのジョブを変更せずにいくつかのステップを実行できます。 これは、たとえば、ジョブの実行前にカスタムのセットアップ ステップを実行したいときに便利です。

```yaml
version: 2.1

jobs:
  bar:
    machine: true
    steps:
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"

workflows:
  build:
    jobs:
      - bar:
          pre-steps: # steps to run before steps defined in the job bar
            - run:
                command: echo "install custom dependency"
          post-steps: # steps to run after steps defined in the job bar
            - run:
                command: echo "upload artifact to s3"
```

##### **ワークフローでの `when` の使用**
{: #using-when-in-workflows }

With CircleCI v2.1 configuration, you may use a `when` clause (the inverse clause `unless` is also supported) under a workflow declaration with a [logic statement](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) to determine whether or not to run that workflow.

The example configuration below uses a pipeline parameter, `run_integration_tests` to drive the `integration_tests` workflow.

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

workflows:
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:
      - mytestjob

jobs:
...
```

This example prevents the workflow `integration_tests` from running unless the tests are invoked explicitly when the pipeline is triggered with the following in the `POST` body:

```sh
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

Refer to the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document for more examples and conceptual information.

## Logic statements
{: #logic-statements }

Certain dynamic configuration features accept logic statements as arguments. Logic statements are evaluated to boolean values at configuration compilation time, that is - before the workflow is run. The group of logic statements includes:

| Type                                                                                                | Arguments             | `true` if                              | Example                                                                  | |-----------------------------------------------------------------------------------------------------+-----------------------+----------------------------------------+--------------------------------------------------------------------------| | YAML literal                                                                                        | None                  | is truthy                              | `true`/`42`/`"a string"`                                                 | | YAML alias                                                                                          | None                  | resolves to a truthy value             | *my-alias                                                                | | [Pipeline Value]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-values)                          | None                  | resolves to a truthy value             | `<< pipeline.git.branch >>`                                              | | [Pipeline Parameter]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) | None                  | resolves to a truthy value             | `<< pipeline.parameters.my-parameter >>`                                 | | and                                                                                                 | N logic statements    | all arguments are truthy               | `and: [ true, true, false ]`                                             | | or                                                                                                  | N logic statements    | any argument is truthy                 | `or: [ false, true, false ]`                                             | | not                                                                                                 | 1 logic statement     | the argument is not truthy             | `not: true`                                                              | | equal                                                                                               | N values              | all arguments evaluate to equal values | `equal: [ 42, << pipeline.number >>]`                                    | | matches                                                                                             | `pattern` and `value` | `value` matches the `pattern`          | `matches: { pattern: "^feature-.+$", value: << pipeline.git.branch >> }` |
{: class="table table-striped"}

The following logic values are considered falsy:

- false
- null
- 0
- NaN
- empty strings ("")
- statements with no arguments

All other values are truthy. Further, Please also note that using logic with an empty list will cause a validation error.

Logic statements always evaluate to a boolean value at the top level, and coerce as necessary. They can be nested in an arbitrary fashion, according to their argument specifications, and to a maximum depth of 100 levels.

`matches` uses [Java regular expressions](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html) for its `pattern`. It is recommended to enclose a pattern in `^` and `$` to avoid accidental partial matches.

**Note:** When using logic statements at the workflow level, do not include the `condition:` key (the `condition` key is only needed for `job` level logic statements).

### Logic statement examples
{: #logic-statement-examples }

```yaml
workflows:
  my-workflow:
      when:
        or:
          - equal: [ master, << pipeline.git.branch >> ]
          - equal: [ staging, << pipeline.git.branch >> ]
```

```yaml
workflows:
  my-workflow:
    when:
      and:
        - not:
            matches:
              pattern: "^master$"
              value: << pipeline.git.branch >>
        - or:
            - equal: [ canary, << pipeline.git.tag >> ]
            - << pipeline.parameters.deploy-canary >>
```

```yaml
version: 2.1

executors:
  linux-13:
    docker:
      - image: cimg/node:13.13
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  macos: &macos-executor
    macos:
      xcode: 11.4

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
      - when:
          condition:
            equal: [ *macos-executor, << parameters.os >> ]
          steps:
            - run: echo << parameters.node-version >>
      - run: echo 0

workflows:
  all-tests:
    jobs:
      - test:
          os: macos
          node-version: "13.13.0"
```

## Example full configuration
{: #example-full-configuration }

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      - image: mongo:2.6.8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        command: [mongod, --smallfiles]

      - image: postgres:9.4.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        # some containers require setting environment variables
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      - image: rabbitmq:3.5.4
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    environment:
      TEST_REPORTS: /tmp/test-reports

    working_directory: ~/my-project

    steps:
      - checkout

      - run:
          command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

      # Create Postgres users and database
      # Note the YAML heredoc '|' for nicer formatting
      - run: |
          sudo -u root createuser -h localhost --superuser ubuntu &&
          sudo createdb -h localhost test_db

      - restore_cache:
          keys:
            - v1-my-project-{{ checksum "project.clj" }}
            - v1-my-project-

      - run:
          environment:
            SSH_TARGET: "localhost"
            TEST_ENV: "linux"
          command: |
            set -xu
            mkdir -p ${TEST_REPORTS}
            run-tests.sh
            cp out/tests/*.xml ${TEST_REPORTS}

      - run: |
          set -xu
          mkdir -p /tmp/artifacts
          create_jars.sh ${CIRCLE_BUILD_NUM}
          cp *.jar /tmp/artifacts

      - save_cache:
          key: v1-my-project-{{ checksum "project.clj" }}
          paths:
            - ~/.m2

      # Save artifacts
      - store_artifacts:
          path: /tmp/artifacts
          destination: build

      # Upload test results
      - store_test_results:
          path: /tmp/test-reports

  deploy-stage:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Staging
          command: ansible-playbook site.yml -i staging

  deploy-prod:
    docker:
      - image: ubuntu:14.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Master
          command: ansible-playbook site.yml -i production

workflows:
  version: 2
  build-deploy:
    jobs:
      - build:
          filters:
            branches:
              ignore:
                - develop
                - /feature-.*/
      - deploy-stage:
          requires:
            - build
          filters:
            branches:
              only: staging
      - deploy-prod:
          requires:
            - build
          filters:
            branches:
              only: master
```
{% endraw %}

## 関連項目
{: #see-also }
{:.no_toc}

[設定ファイルの概要]({{site.baseurl}}/2.0/config-intro/)
