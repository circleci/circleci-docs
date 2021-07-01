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

`config.yml` の全体は「[サンプル コード](#サンプル-コード)」で確認できます。

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
○

| キー      | 必須 | 型      | 説明                                                                                                                                                                            |
| ------- | -- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version | ○  | String | `2`、`2.0`、または `2.1`。 `.circleci/config.yml` ファイルの簡素化、再利用、パラメータ化ジョブの利用に役立つバージョン 2.1 の新しいキーの概要については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)を参照してください。 |
{: class="table table-striped"}

`version` フィールドは、非推奨または互換性を損なう変更について注意を促すために使用します。

## **`orbs`** (version: 2.1 が必須)
例

| キー        | 必須 | 型   | 説明                                                                                                                                                                                 |
| --------- | -- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orbs      | ×  | マップ | ユーザー指定の名前によるマップ。 Orb の参照名 (文字列) または Orb の定義名 (マップ) を指定します。 Orb 定義は、2.1 設定ファイルの Orb 関連サブセットである必要があります。 詳細については、[Orb の作成に関するドキュメント]({{ site.baseurl }}/2.0/creating-orbs/)を参照してください。 |
| executors | ×  | マップ | Executor を定義する文字列のマップ。 このページの [executors]({{ site.baseurl }}/2.0/configuration-reference/#executors-version-21-が必須) セクションを参照してください。                                                |
| commands  | ×  | マップ | コマンドを定義するコマンド名のマップ。 このページの [commands]({{ site.baseurl }}/2.0/configuration-reference/#commands-version-21-が必須) セクションを参照してください。                                                     |
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
上の例で、`hello` は Orb の参照名と見なされます。`circleci/hello-build@0.0.5` は完全修飾の Orb 参照です。 `circleci/hello-build@0.0.5` は完全修飾の Orb 参照です。

## **`commands`** (version: 2.1 が必須)
{: #commands-requires-version-21 }

commands では、ジョブ内で実行する一連のステップをマップとして定義します。これにより、複数のジョブで [1 つのコマンド定義を再利用]({{ site.baseurl }}/2.0/reusing-config/)できます。

| キー          | 必須 | 型      | 説明                                                                                                                                                              |
| ----------- | -- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス  | コマンドの呼び出し元のジョブ内で実行する一連のステップ。                                                                                                                                    |
| parameters  | ×  | マップ    | パラメーター キーのマップ。 詳細については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/2.0/reusing-config/)の「[パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)」を参照してください。 |
| description | ×  | String | コマンドの目的を記述する文字列。                                                                                                                                                |
{: class="table table-striped"}

パラメーター化された Executor の使用例については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)の「[Executor でのパラメーターの使用](https://circleci.com/ja/docs/2.0/reusing-config/#executor-でのパラメーターの使用)」を参照してください。

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

| キー         | 必須 | 型   | 説明                                                                                                                         |
| ---------- | -- | --- | -------------------------------------------------------------------------------------------------------------------------- |
| parameters | ×  | マップ | パラメーター キーのマップ。 `文字列`、`ブール値`、`整数`、`列挙型`がサポートされています。 [パラメーターの構文]({{ site.baseurl }}/2.0/reusing-config/#パラメーターの構文)を参照してください。 |
{: class="table table-striped"}

## **`executors`** (version: 2.1 が必須)
{: #executors-requires-version-21 }

executors では、ジョブのステップを実行する環境を定義します。 これにより、複数のジョブで 1 つの Executor 定義を再利用できます。

| キー                | 必須               | 型      | 説明                                                                                                                                 |
| ----------------- | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト    | [docker Executor](#docker) 用のオプション。                                                                                                |
| resource_class    | ×                | String | ジョブ内の各コンテナに割り当てられる CPU と RAM の量。 **注:** この機能を利用するには、Performance プランへの申し込みが必要です。                                                    |
| machine           | ○ <sup>(1)</sup> | マップ    | [machine Executor](#machine) 用のオプション。                                                                                              |
| macos             | ○ <sup>(1)</sup> | マップ    | [macOS Executor](#macos) 用のオプション。                                                                                                  |
| windows           | ○ <sup>(1)</sup> | マップ    | 現在、[Windows Executor](#windows) は Orb に対応しています。 [こちらの Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) を参照してください。 |
| shell             | ×                | String | すべてのステップのコマンド実行に使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                 |
| working_directory | ×                | String | ステップを実行するディレクトリ。 絶対パスとして解釈されます。                                                                                                    |
| environment       | ×                | マップ    | 環境変数の名前と値のマップ。                                                                                                                     |
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
例

実行処理は 1 つ以上の名前付きジョブで構成し、 それらのジョブは `jobs` マップで指定します。 それらのジョブは `jobs` マップで指定します。[2.0 config.yml のサンプル]({{ site.baseurl }}/2.0/sample-config/)で `jobs` マップの例を紹介しています。 ジョブの名前がマップのキーとなり、ジョブを記述するマップが値となります。

**メモ:** ジョブの最大実行時間は 5 時間です。 ジョブがタイムアウトになる場合は、並列実行も検討してください。

### **<`job_name`>**
`docker` キーは、以下のマップのリストで構成します。

各ジョブは、キーとなるジョブ名と、値となるマップで構成されます。 名前は、その `jobs` リスト内で一意である必要があります。 値となるマップでは以下の属性を使用できます。

| キー                | 必須               | 型      | 説明                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト    | [docker Executor](#docker) 用のオプション。                                                                                                                                                                                                                                                                                                                                                 |
| machine           | ○ <sup>(1)</sup> | マップ    | [machine Executor](#machine) 用のオプション。                                                                                                                                                                                                                                                                                                                                               |
| macos             | ○ <sup>(1)</sup> | マップ    | [macOS Executor](#macos) 用のオプション。                                                                                                                                                                                                                                                                                                                                                   |
| shell             | ×                | String | すべてのステップのコマンド実行に使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                                                                                                                                                                                                                                                                  |
| parameters        | ×                | マップ    | いくつかの例と概念的な情報については、[ワークフローに関するドキュメント]({{ site.baseurl }}/ja/2.0/workflows)を参照してください。                                                                                                                                                                                                                                                                                                |
| steps             | ○                | リスト    | 実行する[ステップ](#steps)のリスト。                                                                                                                                                                                                                                                                                                                                                             |
| working_directory | ×                | String | ステップを実行するディレクトリ。 絶対パスとして解釈されます。 デフォルトは `~/project` となります (この `project` は特定のプロジェクトの名前ではなく、リテラル文字列)。 ジョブ内で実行するプロセスでは、`$CIRCLE_WORKING_DIRECTORY` 環境変数を介してこのディレクトリを参照できます。 **メモ:** YAML 設定ファイルに記述したパスは*展開されません*。 `store_test_results.path` を `$CIRCLE_WORKING_DIRECTORY/tests` と設定しても、CircleCI は文字どおり「`$CIRCLE_WORKING_DIRECTORY`」という、`$` 記号を含む名前のディレクトリ内に、サブディレクトリ `test` を格納しようとします。 |
| parallelism       | ×                | 整数     | このジョブを実行する並列インスタンスの数 (デフォルトは 1)。                                                                                                                                                                                                                                                                                                                                                    |
| environment       | ×                | マップ    | 環境変数の名前と値のマップ。                                                                                                                                                                                                                                                                                                                                                                      |
| branches          | ×                | マップ    | ワークフローまたはバージョン 2.1 の設定ファイル**以外**の構成に含まれる 1 つのジョブに対して特定のブランチでの実行を許可またはブロックするルールを定義するマップ (デフォルトではすべてのブランチでの実行が許可されます)。 ワークフロー内またはバージョン 2.1 の設定ファイル内のジョブに対するブランチ実行の設定については、[workflows](#workflows) セクションを参照してください。                                                                                                                                                                     |
| resource_class    | ×                | String | ジョブ内の各コンテナに割り当てられる CPU と RAM の量。 **注:** この機能を利用するには、Performance プランへの申し込みが必要です。                                                                                                                                                                                                                                                                                                     |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

#### `environment`
pattern:
    { term }
環境変数の名前と値のマップです。 これらは、CircleCI アプリケーションで設定した環境変数をオーバーライドします。


#### `parallelism`
{: #parallelism }

`parallelism` を 2 以上に設定すると、設定した数の Executor がそれぞれセットアップされ、そのジョブのステップを並列に実行します。 これにより、テスト ステップを最適化できます。CircleCI CLI を使用して並列コンテナにテスト スイートを分割すると、ジョブの実行時間を短縮できます。 並列処理を設定していても、特定のステップでは並列処理がオプトアウトされ、1 つの Executor でのみ実行される場合があります (たとえば [`deploy` ステップ](#deploy) など)。 詳細については、[並列ジョブのドキュメント]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を参照してください。

チェックアウト ディレクトリ (デフォルトはジョブの [`working_directory`](#jobs))。

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
パラメーター値。
この例の `checkout` ステップは、プロジェクトのソース コードをジョブの [`working_directory`](#jobs) にチェックアウトします。

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
[machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) は、`machine` キーと以下のマップを用いて構成します。

Executor とは、簡単に言うと「ステップの実行環境」です。 CircleCI 2.0 では、必要な数の Docker コンテナを一度にローンチすることによって必要な環境を構築するか、完全な仮想マシンを使用します。 Executor の種類については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

#### `docker`
{: #docker }
{:.no_toc}

machine Executor は、ジョブまたはワークフローで Docker イメージをビルドするときに便利な [Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)をサポートします。

| キー          | 必須 | 型         | 説明                                                              |
| ----------- | -- | --------- | --------------------------------------------------------------- |
| image       | ○  | String    | 使用するカスタム Docker イメージの名前。                                        |
| name        | ×  | String    | 他から参照するためのコンテナの名前。  デフォルトでは、`localhost` を通してコンテナ サービスにアクセスできます。 |
| entrypoint  | ×  | 文字列またはリスト | コンテナのローンチ時に実行するコマンド。                                            |
| command     | ×  | 文字列またはリスト | コンテナのローンチ時にルート プロセスとなる PID 1 として使用するコマンド (または entrypoint の引数)。  |
| user        | ×  | String    | Docker コンテナ内でコマンドを実行するユーザー。                                     |
| environment | ×  | マップ       | 環境変数の名前と値のマップ。                                                  |
| auth        | ×  | マップ       | 標準の `docker login` 認証情報を用いたレジストリの認証情報。                          |
| aws_auth    | ×  | マップ       | AWS EC2 Container Registry (ECR) の認証情報。                         |
{: class="table table-striped"}

ファイル内で最初に記述する `image` が、すべてのステップを実行するプライマリ コンテナ イメージとなります。

`entrypoint` overrides the image's `ENTRYPOINT`.

`command` overrides the image's `COMMAND`; it will be used as arguments to the image `ENTRYPOINT` if it has one, or as the executable if the image has no `ENTRYPOINT`.

[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container) (最初に記述したもの) に対して `command` を指定しない場合、`command` とイメージ エントリポイントは無視されます。 これにより、エントリポイントの実行可能ファイルによる大量のリソース消費や予期しない終了によって発生するエラーが回避されます。 現時点では、`steps` はすべてプライマリ コンテナでのみ実行されます。

`name` では、セカンダリ サービス コンテナにアクセスするための名前を定義します。  デフォルトでは、すべてのサービスが `localhost` で直接アクセスできる状態になっています。  たとえば、同じサービスのバージョン違いを複数立ち上げるときなど、ローカル ホスト以外のホスト名を使用したい場合に、このフィールドは適しています。

**例:** macOS 仮想マシンを Xcode バージョン 11.3 で使用する場合

タグまたはダイジェストを使用して、イメージのバージョンを指定できます。 任意の公式 Docker レジストリ (デフォルトは Docker Hub) にある任意のパブリック イメージを使用できます。 詳細については、[イメージの指定に関するドキュメント]({{ site.baseurl }}/ja/2.0/executor-types)を参照してください。

Some registries, Docker Hub, for example, may rate limit anonymous docker pulls.  It's recommended you authenticate in such cases to pull private and public images. プライベート イメージを使用する場合は、`auth` フィールドを使用してユーザー名とパスワードを指定できます。  See [Using Docker Authenticated Pulls]({{ site.baseurl }}/2.0/private-images/) for details.

**例:** Windows Executor を使用して単純なジョブを実行する場合

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

[AWS ECR](https://aws.amazon.com/ecr/) でホストされているイメージを使用するには、AWS 認証情報を使用した認証が必要です。 デフォルトでは、CircleCI アプリケーションの [Project (プロジェクト)] > [Settings (設定)] > [AWS Permissions (AWS 権限)] ページで追加した AWS 認証情報、またはプロジェクト環境変数の `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を使用します。 以下の例のように、`aws_auth` フィールドを使用して認証情報を設定することも可能です。

```yaml
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定するか
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # UI から設定したプロジェクトの環境変数を参照するように指定します
```

バージョン 2.1 を使用している場合、[宣言済みのコマンド]({{ site.baseurl }}/ja/2.0/reusing-config/)をジョブで再利用できます。 以下の例では `sayhello` コマンドを呼び出しています。

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

こちらの例では、"develop" ブランチと正規表現 "feature-.*" に一致するブランチを除くすべてのブランチが実行されます。

| キー                     | 必須 | 型      | 説明                                                                                                                                                                                                                                       |
| ---------------------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image                  | ○  | String | 使用する VM イメージ。 [使用可能なイメージ](#使用可能な-machine-イメージ)を参照してください。 **メモ:** このキーは、オンプレミス環境では**サポートされません**。 ユーザーのサーバーにインストールされた CircleCI 上の `machine` Executor イメージをカスタマイズする方法については、[VM サービスに関するドキュメント]({{ site.baseurl }}/2.0/vm-service)を参照してください。 |
| docker_layer_caching | ×  | ブール値   | `true` に設定すると、[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching)が有効になります。 **メモ:** お使いのアカウントでこの有料の機能を有効化するには、サポート チケットをオープンしてください。CircleCI 営業担当者から連絡を差し上げます。                                                                |
{: class="table table-striped"}


**すべての**ブランチで確実にジョブを実行するには、`branches` キーを使用しないか、`only` キーに正規表現 `/.*/` を指定してすべてのブランチを対象にします。

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
CircleCI ではいくつかの machine イメージをサポートしており、`image` フィールドで指定できます。

* `ubuntu-1604-cuda-10.1:201909-23` - CUDA 10.1、docker 19.03.0-ce、nvidia-docker 2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA 9.2、docker 19.03.0-ce、nvidia-docker 2.2.2
* `circleci/classic:201707-01` – docker 17.06.0-ce、docker-compose 1.14.0

* `circleci/classic:201710-01` – docker 17.09.0-ce、docker-compose 1.14.0
* `circleci/classic:201709-01` – docker 17.07.0-ce、docker-compose 1.14.0
* `circleci/classic:201703-01` – docker 17.03.0-ce、docker-compose 1.9.0
* `circleci/classic:201711-01` – docker 17.11.0-ce、docker-compose 1.17.1
* `entrypoint` は、Dockerfile のデフォルトのエントリポイントをオーバーライドします。
* `true` に設定すると、リモート Docker 環境で [Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching/) が有効になります (デフォルトは `false`)。

***Note:*** *Ubuntu 16.04 has reached the end of its LTS window as of April 2021 and will no longer be supported by Canonical. As a result, `ubuntu-1604:202104-01` is the final Ubuntu 16.04 image released by CircleCI. We suggest upgrading to the latest Ubuntu 20.04 image for continued releases and support past April 2021.*

The machine executor supports [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) which is useful when you are building Docker images during your job or Workflow.

##### 使用可能な Linux GPU イメージ
[Linux GPU Executor](#gpu-executor-linux) では、次のイメージが使用可能です。

使用可能なイメージの一覧は、[こちらのセクション](#使用可能な-linux-gpu-イメージ)を参照してください。

* `ubuntu-1604-cuda-11.1:202012-01` - CUDA v11.1、Docker v19.03.13、nvidia-container-toolkit v1.4.0-1
* `ubuntu-1604-cuda-10.2:202012-01` - CUDA v10.2、Docker v19.03.13、nvidia-container-toolkit v1.3.0-1
* `ubuntu-1604-cuda-10.1:201909-23` - CUDA v10.1、Docker v19.03.0-ce、nvidia-docker v2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA v9.2、Docker v19.03.0-ce、nvidia-docker v2.2.2

##### 使用可能な Windows GPU イメージ
[Windows GPU Executor](#gpu-executor-windows) では、次のイメージが使用可能です。

[windows Executor](#windows) 用のオプション。

* `windows-server-2019-nvidia:stable` - Windows Server 2019、CUDA 10.1。 このイメージはデフォルトです。

**サンプル コード**

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

CircleCI は [macOS](https://developer.apple.com/macos/) 上でのジョブ実行をサポートしており、macOS、[iOS](https://developer.apple.com/jp/ios/)、[tvOS](https://developer.apple.com/jp/tvos/)、および [watchOS](https://developer.apple.com/jp/watchos/) 用のアプリのビルド、テスト、デプロイが可能です。 macOS 仮想マシンでジョブを実行するには、`macos` キーをジョブ構成の最上位に追加し、使用する Xcode のバージョンを指定します。

| キー    | 必須 | 型      | 説明                                                                                                                                               |
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

CircleCI は、Windows 上でのジョブ実行をサポートしています。 Windows マシンでジョブを実行するには、`windows` キーをジョブ構成の最上位に追加する必要があります。 Orb を使用すると、Windows ジョブを簡単にセットアップできます。 Windows ジョブを実行する際の前提条件と、Windows マシンで提供される機能の詳細については、「[Windows での Hello World]({{ site.baseurl }}/ja/2.0/hello-world-windows)」を参照してください。


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
一部のステップは省略構文を実装しており、 たとえば `run` を以下のように呼び出すことが可能です。

**This key is deprecated. Use [workflows filtering](#jobfilters) to control which jobs run for which branches.**

ワークフローを**構成せず**、2.1 ではなく 2.0 の設定ファイルを使用している場合に、一部のブランチの実行を許可またはブロックするルールを定義できます。 [ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)を使用している場合、ジョブ レベルのブランチは無視されるため、`config.yml` ファイルの workflows セクションで構成する必要があります。 2.1 の設定ファイルを使用している場合にフィルターを使用するには、ワークフローを追加する必要があります。 詳細については、[workflows](#workflows) セクションを参照してください。 ジョブ レベルの `branch` キーは、以下のマップで構成します。

| キー     | 必須 | 型   | 説明              |
| ------ | -- | --- | --------------- |
| only   | ×  | リスト | 実行するブランチのみのリスト。 |
| ignore | ×  | リスト | 無視するブランチのリスト。   |
{: class="table table-striped"}

`only` と `ignore` のリストには、完全一致のフル ネームと正規表現のどちらでも記述できます。 正規表現は、文字列**全体**に一致する必要があります。 たとえば、以下のようになります。

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

現在は `2` を指定する必要があります。

構成されたルールによって実行されなかったジョブは、UI のジョブ一覧にスキップのマーク付きで表示されます。

To ensure the job runs for **all** branches, either don't use the `branches` key, or use the `only` key along with the regular expression: `/.*/` to catch all branches.

#### **`resource_class`**
{: #resourceclass }

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 下表に示すように、Executor ごとにさまざまなリソース クラスが提供されています。

CircleCI では、すべてのお客様がシステムを安定した状態で利用できるよう、リソース クラスごとに同時処理数のソフト制限を設けています。 Performance プランまたは Custom プランを使用していて、特定のリソース クラスで待機時間が発生している場合は、このソフト制限に達している可能性があります。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new) にお客様のアカウントの制限値引き上げを依頼してください。

**メモ:** この機能は、Free プランおよび Performance プランで自動的に有効化されています。 Free プランのお客様の場合、利用可能なリソース クラスは Linux が small または medium、Windows が medium に制限されています。 MacOS は Free プランでは利用できません。

**CircleCI Server をオンプレミスでホスティングしている場合は、利用可能なリソース クラスについてシステム管理者に問い合わせてください**。 See Server Administration documents for further information: [Nomad Client System Requirements]({{ site.baseurl }}/2.0/server-ports/#nomad-clients) and [Server Resource Classes]({{ site.baseurl }}/2.0/customizations/#resource-classes).

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
たとえば、以下のようになります。

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

`make test` が失敗しても、パイプラインの残りの部分は実行されることに注意してください。

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### machine Executor (Linux)
この動作を回避するには、コマンドで `set +o pipefail` を指定するか、`shell` 全体をオーバーライドします (前述の例を参照)。

{% include snippets/machine-resource-table.md %}

###### 例
詳細については、「[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)」を参照してください。
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

`run` では、たいへん便利な省略構文を使用できます。

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### macOS Executor
この例では、`command` と `name` に `run` の文字列値が割り当てられたことになり、この `run` の構成マップの残りの属性はデフォルト値になります。

| クラス                 | vCPU | RAM  |
| ------------------- | ---- | ---- |
| medium (デフォルト)      | 4    | 8 GB |
| large<sup>(2)</sup> | 8    | 16GB |
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

以下の例では、`halt` を使用して、`develop` ブランチでジョブが実行されないようにしています。

Windows Executor の詳細と例については、[Windows に関する入門ガイド]({{ site.baseurl }}/ja/2.0/hello-world-windows/) を参照してください。

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
`path` が既に存在する場合、次のように動作します。

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

<sup>(2)</sup> *このリソースは、サポート チームによる確認が必要となります。 ご利用の際は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)してください。 *

<sup>(3)</sup> _This resource is available only for customers with an annual contract. 有料のプランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能を利用できるようリクエストしてください。</p>

**メモ:** Java、Erlang など、CPU 数に関する情報を `/proc` ディレクトリから入手する言語では、CircleCI 2.0 のリソース クラス機能を使用するときに、低速化を防ぐために追加の構成が必要になることがあります。 この問題が発生すると、32 個の CPU コアを要求していても、1 コアを要求する場合よりも実行速度が低下する場合があります。 この問題が発生する言語をお使いの場合は、保証された CPU リソースに基づいて CPU 数を固定する必要があります。


割り当てられているメモリ量を確認するには、`grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat` を実行して cgroup メモリ階層制限をチェックしてください。

#### **`steps`**
{: #steps }

ジョブ内の `steps` は、キーと値のペアを 1 つずつ列挙する形で設定します。 値は (そのステップの種類の要件に従って) 構成マップまたは文字列で記述します。 たとえば、マップで記述する場合は以下のようになります。

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

ここでは、`run` がステップの種類です。 `name` 属性は、UI に表示するために使用します。 `command` 属性は `run` ステップに固有の属性で、実行するコマンドを定義します。

一部のステップは省略構文を実装しており、 一部のステップは省略構文を実装しており、 For example, `run` may be also be called like this:

```
jobs:
  build:
    steps:
      - run: make test
```

省略形式の `run` ステップでは、どの `command` を実行するかを文字列値で直接指定できます。 この場合、他の属性に対しては、自動的に適切なデフォルト値が設定されます (たとえば、`name` は `command` と同じ値になります)。

さらに一部のステップには別の省略表記があり、キーと値のペアの代わりに単なる文字列のステップ名を使用できます。

```
jobs:
  build:
    steps:
      - checkout
```

新しいキャッシュを格納する際に、`key` に特別なテンプレートの値を含めることも可能です。

通常、ステップは以下のように記述します。

| キー                   | 必須 | 型         | 説明                              |
| -------------------- | -- | --------- | ------------------------------- |
| &lt;step_type> | ○  | マップまたは文字列 | ステップの構成マップ、またはステップによって規定された文字列。 |
{: class="table table-striped"}

定義済みステップについて、以下に詳しく説明します。

##### **`run`**
{: #run }

すべてのコマンドライン プログラムの呼び出しに使用します。 構成値のマップを記述するか、省略形式で呼び出した場合には `command` と `name` の両方に使用する文字列を記述します。 run コマンドは、デフォルトでは非ログイン シェルで実行されます。したがって、ドットファイルをコマンドの中で明示的に参照する必要があります。

| キー                  | 必須 | 型      | 説明                                                                                                                                |
| ------------------- | -- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| command             | ○  | String | シェルから実行するコマンド。                                                                                                                    |
| name                | ×  | String | CircleCI の UI に表示されるステップのタイトル (デフォルトは `command` 文字列全体)。                                                                           |
| shell               | ×  | String | コマンド実行に使用するシェル (デフォルトについては「[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照)。                                                               |
| environment         | ×  | マップ    | コマンドに対するローカル スコープとなる追加の環境変数。                                                                                                      |
| background          | ×  | ブール値   | このステップをバックグラウンドで実行するかどうかの設定 (デフォルトは false)。                                                                                       |
| working_directory   | ×  | String | In which directory to run this step. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`) |
| no_output_timeout | ×  | String | 出力のないままコマンドを実行できる経過時間。 「20m」「1.25h」「5s」のように、数字の後に単位を付けた文字列で記述します (デフォルトは 10 分)                                                    |
| when                | ×  | String | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。                                 |
{: class="table table-striped"}

それぞれの `run` 宣言で新しいシェルが立ち上がります。 複数行の `command` を指定でき、その場合はすべての行が同じシェルで実行されます。

``` YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

You can also configure commands to run [in the background](#background-commands) if you don't want to wait for the step to complete before moving on to subsequent run steps.

###### _デフォルトのシェル オプション_
キャッシュは元々保存されていた場所に復元されるため、ここでパスは必要ありません。

**Linux** で実行するジョブの場合、`shell` オプションのデフォルト値は、`/bin/bash` がビルド コンテナに存在すれば `/bin/bash -eo pipefail`、 存在しなければ `/bin/sh -eo pipefail` になります。 Otherwise it is `/bin/sh -eo pipefail`. デフォルトのシェルはログイン シェルではありません (`--login` または `-l` は指定されません)。 そのため、このシェルは `~/.bash_profile`、`~/.bash_login`、`~/.profile` といったファイルを**読み込みません**。

**macOS** で実行するジョブの場合、デフォルトのシェルは `/bin/bash --login -eo pipefail` になります。 このシェルは、非対話型のログイン シェルです。 シェルは、`/etc/profile/` を読み込み、続いて `~/.bash_profile` を読み込んでから、各ステップを実行します。

**メモ:** `run` ステップでは `run: my command` のようなショートカットを使用できますが、`deploy` ステップで同様に `deploy: my command` のようにショートカットを使用すると、CircleCI から以下のエラー メッセージが出力されます。

`-eo pipefail` オプションについては以下のように説明されています。

`-e`

> パイプライン (1 つのコマンドで構成される場合を含む)、かっこ「()」で囲まれたサブシェル コマンド、または中かっこ「{}」で囲まれたコマンド リストの一部として実行されるコマンドの 1 つが 0 以外のステータスで終了した場合は、直ちに終了します。

したがって、前の例で `mkdir` がディレクトリの作成に失敗し、0 以外のステータスを返した場合は、コマンドの実行が終了し、ステップ全体が失敗として扱われます。 それとは反対の動作にする必要がある場合は、`command` に `set +e` を追加するか、`run` の構成マップでデフォルトの `shell` をオーバーライドします。 たとえば、以下のようになります。
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

この例では、`make test` が失敗した場合、`-o pipefail` オプションによってステップ全体が失敗します。 `-o pipefail` オプションを指定していなければ、パイプライン全体の結果は最後のコマンド (`tee test-output.log`) によって決まり、これは常に 0 のステータスを返すため、ステップの実行は常に成功となります。

この例では、`POST` 本体に以下が含まれた状態でパイプラインがトリガーされたときに、テストが明示的に呼び出されない限りは `integration_tests` ワークフローは実行されないようにしています。

If you want to avoid this behaviour, you can specify `set +o pipefail` in the command or override the whole `shell` (see example above).

デフォルト オプション (`-eo pipefail`) を使用すると、途中のコマンドのエラーが表示され、失敗したジョブのデバッグが容易になるため、通常はこちらをお勧めします。 UI には、使用されているシェルと各 `run` ステップのすべての有効なオプションが表示されるため便利です。

For more information, see the [Using Shell Scripts]({{ site.baseurl }}/2.0/using-shell-scripts/) document.

###### _バックグラウンド コマンド_
ディレクトリ構造

`background` 属性を使用すると、コマンドをバックグラウンドで実行するように構成できます。 `background` 属性を `true` に設定した場合、コマンドの終了を待つことなく、ジョブの実行が直ちに次のステップに進みます。 以下は、Selenium テストにおいてよく必要となる、X 仮想フレームバッファをバックグラウンドで実行するための構成例です。

``` YAML
- run:
    name: X 仮想フレームバッファの実行
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _省略構文_
一時ファイルを永続化してワークフロー内の別のジョブで使用できるようにするための特別なステップです。

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



###### `step` 内からのジョブの終了
{: #ending-a-job-from-within-a-step }

`run: circleci-agent step halt` を使用することで、ジョブを失敗させずに終了できます。 これは、条件に従ってジョブを実行する必要がある場合に便利です。

以下の例では、`halt` を使用して、`develop` ブランチでジョブが実行されないようにしています。

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

条件付きステップは、`when` キーまたは `unless` キーを含むステップで構成されます。 `when` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `when` ステップの目的は、コマンドやジョブ構成が、ワークフローの実行前にチェックされるカスタム条件 (設定ファイルのコンパイル時に決定) に基づいて実行されるようにカスタマイズすることです。 詳細については、設定ファイルの再利用に関するドキュメントの「[条件付きステップの定義]({{ site.baseurl }}/ja/2.0/reusing-config/#条件付きステップの定義)」を参照してください。

| キー        | 必須 | 用途    | 説明                                                                                      |
| --------- | -- | ----- | --------------------------------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                   |
{: class="table table-striped"}

###### *例*
ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

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

設定済みの `path` (デフォルトは `working_directory`) にソース コードをチェックアウトするために使用する特別なステップです。 これが特別なステップである理由は、単なるヘルパー関数ではなく、コードを自動的に簡単にチェックアウトできるように設計されているからです。 このステップは SSH でチェックアウトするように git を設定するため、HTTPS で git を実行する必要がある場合は、このステップを使用しないでください。

| キー   | 必須 | 型      | 説明                                                                                                               |
| ---- | -- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| path | ×  | String | Checkout directory. Will be interpreted relative to the [`working_directory`](#jobs) of the job). (default: `.`) |
{: class="table table-striped"}

絶対パス、または `working_directory` からの相対パス。
 * Git リポジトリ - ステップはリポジトリ全体をクローンするのではなく、オリジナルをプルします。
 * Git リポジトリ以外 - ステップは失敗します。

`checkout` は、属性のない単なる文字列としてステップを記述します。

``` YAML
- checkout
```

**メモ:** CircleCI は、サブモジュールをチェックアウトしません。 サブモジュールが必要なプロジェクトの場合は、以下の例に示すように、適切なコマンドを実行する `run` ステップを追加します。

``` YAML
- checkout
- run: git submodule sync
- run: git submodule update --init
```

たとえば、以下のようになります。

**メモ:** `checkout` ステップは、自動ガベージ コレクションをスキップするように Git を構成します。 [restore_cache](#restore_cache) で `.git` ディレクトリをキャッシュし、そのキャッシュ サイズをガベージ コレクションで縮小したい場合は、その前に `git gc` コマンドを指定した [run](#run) ステップを実行してください。

##### **`setup_remote_docker`**
ワークフローの `version` フィールドは、非推奨またはベータ版での互換性を損なう変更について注意を促すために記述します。

Docker コマンドを実行するように構成されたリモート Docker 環境を作成します。 詳細については、「[Docker コマンドの実行手順]({{ site.baseurl }}/ja/2.0/building-docker-images/)」を参照してください。

| キー                     | 必須 | 型       | 説明                                                                                                                                                      |
| ---------------------- | -- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker_layer_caching | ×  | boolean | `true` に設定すると、[Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)が有効になります。                                                              |
| version                | ×  | String  | 使用する Docker のバージョン文字列 (デフォルトは `17.09.0-ce`)。 サポートされている Docker バージョンについては、[こちら]({{site.baseurl}}/ja/2.0/building-docker-images/#docker-のバージョン)を参照してください。 |
{: class="table table-striped"}

**メモ:** この機能を利用するには有料アカウントが必要です。

- A paid account on a [Performance or Custom Plan](https://circleci.com/pricing/) is required to access Docker Layer Caching.
- `setup_remote_docker` は、`machine` Executor と互換性がありません。 `machine` Executor で Docker レイヤー キャッシュを有効化する方法については、[こちら]({{ site.baseurl }}/ja/2.0/docker-layer-caching/#machine-executor)を参照してください。
- 現在、プライベート クラウドまたはデータセンターにインストールされている CircleCI では、`version` キーがサポートされていません。 お使いのリモート Docker 環境にインストールされている Docker バージョンについては、システム管理者にお問い合わせください。

##### **`save_cache`**
キャッシュ

依存関係やソース コードなどのファイルのキャッシュ、または複数のファイルが入ったディレクトリのキャッシュを生成して、オブジェクト ストレージに格納します。 後続のジョブで、[キャッシュを復元](#restore_cache)できます。 詳細については、[キャッシュに関するドキュメント]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。

| キー    | 必須 | 型      | 説明                                                                                                |
| ----- | -- | ------ | ------------------------------------------------------------------------------------------------- |
| paths | ○  | リスト    | キャッシュに追加するディレクトリのリスト。                                                                             |
| key   | ○  | String | このキャッシュの一意の識別子。                                                                                   |
| name  | ×  | String | CircleCI の UI に表示されるステップのタイトル (デフォルトは「Saving Cache」)。                                             |
| when  | ×  | String | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。 |
{: class="table table-striped"}

キーの書式の詳細については、[`save_cache` ステップ](#save_cache)の `key` に関する説明を参照してください。

**Note** If the cache for the given `key` already exists it won't be modified, and job execution will proceed to the next step.

フィルターでは、`branches` キーを使用できます。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                 |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ビルド番号。                                                                                                                                                                                                                                                                                                                            |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .CheckoutKey }}`{% endraw %}              | リポジトリのチェックアウトに使用する SSH 鍵。                                                                                                                                                                                                                                                                                                                         |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                                |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。 リポジトリにコミットするファイルのみを指定できます。絶対パス、または現在の作業ディレクトリからの相対パスで参照できます。 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用をお勧めします。 また、このファイルの内容が、`restore_cache` から `save_cache` までの間に変化しないようにすることが重要です。 ファイルの内容が変化した場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュ キーの下でキャッシュが保存されます。 |
| {% raw %}`{{ epoch }}`{% endraw %}                     | UNIX エポックからの秒数で表される現在時刻。                                                                                                                                                                                                                                                                                                                          |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU の情報。  OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュする場合に便利です (`darwin amd64`、`linux i386/32-bit` など)。                                                                                                                                                                                                                                           |
{: class="table table-striped"}

ステップの実行中に、上記のテンプレートが実行時の値に置き換えられ、その置換後の文字列が `key` として使用されます。

テンプレートの例
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - 上の例と同じように、ファイルの内容が変わるたびにキャッシュが再生成されますが、各ブランチで個別のキャッシュが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ジョブを実行するごとに個別のキャッシュが生成されます。
 * `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。

キャッシュの `key` に使用するテンプレートを選択するうえでは、キャッシュの保存にはコストがかかること、キャッシュを CircleCI ストレージにアップロードするにはある程度の時間がかかることに留意してください。 したがって、実際に何か変更があった場合にのみ新しいキャッシュが生成されるような `key` を使用し、ジョブを実行するたびに新しいキャッシュが生成されることがないようにします。

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
{% endraw %}
 ##### **`restore_cache`** 以前に保存したキャッシュを `key` に基づいて復元します。

Restores a previously saved cache based on a `key`. あらかじめ \[`save_cache` ステップ\](#save_cache)を使用して、そのキーでキャッシュを保存しておく必要があります。 詳細については、\[キャッシュに関するドキュメント\]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。 | キー   | 必須               | 型   | 説明                                                        | | ---- | ---------------- | --- | --------------------------------------------------------- | | key  | ○ &lt;sup&gt;(1)&lt;/sup&gt; | 文字列 | 復元するキャッシュ キーを 1 つだけ指定します。

| キー   | 必須               | 型      | 説明                                                        |
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

- restore_cache: keys: - v1-myapp-{{ arch }}-{{ checksum "project.clj" }} # `project.clj` の正確なバージョンに対応するキャッシュが存在しない場合は、最新のキャッシュをロードします

For more information on key formatting, see the `key` section of [`save_cache` step](#save_cache).

`keys` リストが検出されると、既存のキャッシュに最初に一致するキャッシュが復元されます。 通常は、より特定度の高いキー (たとえば、`package-lock.json` ファイルの正確なバージョンに対応するキー) を最初に記述し、より汎用的なキー (たとえば、プロジェクトの任意のキャッシュが対象となるキー) をその後に記述します。 キーに該当するキャッシュが存在しない場合は、警告が表示され、ステップがスキップされます。

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

##### **現在は `schedule` を指定する必要があります。**
{: #deploy-deprecated }

**This key is deprecated. For improved control over your deployments use [workflows](#workflows) plus associated filtering and scheduling keys.**

Special step for deploying artifacts.

`deploy` uses the same configuration map and semantics as [`run`](#run) step. Jobs may have more than one `deploy` step.

In general `deploy` step behaves just like `run` with two exceptions:

- ジョブに 2 つ以上の `deploy` ステップを記述できます。 通常、以下の 2 つの例外を除いて、`deploy` ステップは `run` と同じように動作します。 - `parallelism` を指定したジョブにおいて、`deploy` ステップは、すべてのノードが成功した場合にノード #0 でのみ実行されます。 #0 以外のノードは、このステップをスキップします。
- In a job that runs with SSH, the `deploy` step will not execute, and the following action will show instead: > **skipping deploy** > Running in SSH mode.  Avoid deploying.

`deploy` ステップを使用するときには、ワークフローを使用してジョブのオーケストレーションやトリガーを実行する方法を理解しておくことをお勧めします。 ワークフローの使用方法については、以下を参照してください。

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

**メモ:** 既に CircleCI 1.0 バージョンの設定ファイルが存在する場合は、`config.yml` ファイルを使用することで、独立した別のブランチで 2.x ビルドをテストできます。

`In step 3 definition: This type of step does not support compressed syntax`

##### **`store_artifacts`**
{: #storeartifacts }

Web アプリまたは API からアクセスできるアーティファクト (ログ、バイナリなど) を格納するステップです。 詳細については、[アーティファクトに関するドキュメント]({{ site.baseurl }}/ja/2.0/artifacts/)を参照してください。

| キー          | 必須 | 型      | 説明                                                                         |
| ----------- | -- | ------ | -------------------------------------------------------------------------- |
| path        | ○  | String | ジョブ アーティファクトとして保存するプライマリ コンテナ内のディレクトリ。                                     |
| destination | ×  | String | アーティファクト API でアーティファクトの保存先パスに追加するプレフィックス (デフォルトは `path` で指定したファイルのディレクトリ)。 |
{: class="table table-striped"}

1 つのジョブに複数の `store_artifacts` ステップを記述できます。 各ステップで一意のプレフィックスを使用すると、ファイルの上書きを防止できます。

###### 例
{% raw %}```yaml

``` YAML
- run:
    name: Jekyll サイトのビルド
    command: bundle exec jekyll build --source jekyll --destination jekyll/_site/docs/
- store_artifacts:
    path: jekyll/_site/docs/
    destination: circleci-docs
```

##### **`store_test_results`**
version: 2 jobs: build: docker:

ビルドのテスト結果をアップロードおよび保存するための特別なステップです。 テスト結果は、CircleCI Web アプリケーションで各ビルドの「テスト サマリー」セクションに表示されます。 テスト結果を保存すると、テスト スイートのタイミング分析に役立ちます。

deploy-prod: docker:

| キー   | 必須 | 型      | 説明                                                                                                             |
| ---- | -- | ------ | -------------------------------------------------------------------------------------------------------------- |
| path | ○  | String | JUnit XML または Cucumber JSON のテスト メタデータ ファイルが格納されたサブディレクトリを含むディレクトリへのパス (絶対パス、または `working_directory` からの相対パス)。 |
{: class="table table-striped"}

**メモ:** レポートの名前が CircleCI によって正しく推測されるよう、`store_test_results` パスの**サブディレクトリ**にはなるべく特定のテスト スイートの名前と一致する名前を付けてテスト結果を書き込みます。 レポートをサブディレクトリに書き込まないと、「テスト サマリー」セクションに、たとえば、`Your build ran 71 tests in rspec (ビルドは rspec の 71 のテストを実行しました)` ではなく、`Your build ran 71 tests in unknown (ビルドは不明の 71 のテストを実行しました)` のようなレポートが表示されます。

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

`config.yml` 構文

``` YAML
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**
{: #persisttoworkspace }

Special step used to persist a temporary file to be used by another job in the workflow.

**メモ:** ワークスペースは、作成後最大 15 日間保存されます。 作成から 15 日以上が経過したワークスペースを使用するジョブは、すべて失敗します。これには、ワークフローの部分的な再実行や SSH による個別ジョブの再実行も含まれます。

| キー    | 必須 | 型      | 説明                                                                                                                 |
| ----- | -- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| root  | ○  | String | 絶対パス、または現在の作業ディレクトリからの相対パスで参照できます。                                                                                 |
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

`paths` リストは、Go の `Glob` とパターン マッチ [filepath.Match](https://golang.org/pkg/path/filepath/#Match) を使用します。

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

Go のドキュメントによると、パターンには `/usr/*/bin/ed` ('/' は区切り文字) などの階層的な名前を記述できます。 **メモ:** すべての要素はワークスペースのルート ディレクトリからの相対パスです。

##### **`attach_workspace`**
{: #attachworkspace }

ワークフローのワークスペースを現在のコンテナにアタッチするための特別なステップです。 ワークスペースのすべての内容がダウンロードされ、ワークスペースがアタッチされているディレクトリにコピーされます。

| キー | 必須 | 型      | 説明                    |
| -- | -- | ------ | --------------------- |
| at | ○  | String | ワークスペースのアタッチ先のディレクトリ。 |
{: class="table table-striped"}

###### _例_
{: #example }

``` YAML
- attach_workspace:
    at: /tmp/workspace
```

各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。 ジョブ内では、`persist_to_workspace` ステップを使用してワークスペースにファイルを追加でき、`attach_workspace` ステップを使用してワークスペースの内容をファイル システムにダウンロードできます。 ワークスペースは追加専用です。ジョブは、ワークスペースにファイルを追加することはできますが、ワークスペースからファイルを削除することはできません。 各ジョブでは、そのアップストリームのジョブによってワークスペースに追加された内容を参照することのみ可能です。 ワークスペースをアタッチすると、アップストリーム ジョブがワークフロー グラフに現れる順番で、各アップストリーム ジョブからの「レイヤー」が適用されます。 2 つのジョブが同時に実行される場合、それらのレイヤーが適用される順番は不定になります。 複数の同時ジョブが同じファイル名を永続化する場合、ワークスペースのアタッチはエラーになります。

ワークフローが再実行される場合、それは、元のワークフローと同じワークスペースを継承します。 失敗したジョブのみを再実行する場合、再実行されるジョブは、元のワークフロー内のジョブと同じワークスペースの内容を参照することになります。

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| 型        | 存続期間                                 | 用途                                                                                | 例                                                                                                                                                |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| アーティファクト | 数か月                                  | Preserve long-term artifacts.                                                     | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブから参照できます。 `tmp/circle-artifacts.<hash>/container` などのディレクトリの下に格納されています。                      |
| ワークスペース  | Duration of workflow (up to 15 days) | Attach the workspace in a downstream container with the `attach_workspace:` step. | The `attach_workspace` copies and re-creates the entire workspace content when it runs.                                                          |
| キャッシュ    | 15 Days                              | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存する。                                      | `save_cache` ジョブ ステップで、追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定します。   `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

Refer to the [Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/) for additional conceptual information about using workspaces, caching, and artifacts.

##### **`add_ssh_keys`**
{: #addsshkeys }

プロジェクトの設定からコンテナに SSH 鍵を追加するための特別なステップです。 指定する鍵を使用するように SSH を構成します。

| キー           | 必須 | 型   | 説明                                               |
| ------------ | -- | --- | ------------------------------------------------ |
| fingerprints | ×  | リスト | 追加する鍵に対応するフィンガープリントのリスト (デフォルトでは、追加されるすべての鍵が対象)。 |
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

パイプライン値はすべてのパイプライン構成で使用でき、事前の宣言なしに利用できます。 利用可能なパイプライン値は次のとおりです。

| 値                          | 説明                                             |
| -------------------------- | ---------------------------------------------- |
| pipeline.id                | パイプラインを表す、グローバルに一意の ID。                        |
| pipeline.number            | パイプラインを表す、プロジェクトで一意の整数の ID                     |
| pipeline.project.git_url   | E.g. https://github.com/circleci/circleci-docs |
| pipeline.project.type      | E.g. "github" など。                              |
| pipeline.git.tag           | パイプラインをトリガーするタグ。                               |
| pipeline.git.branch        | パイプラインをトリガーするブランチ。                             |
| pipeline.git.revision      | 現在の git リビジョン。                                 |
| pipeline.git.base_revision | 以前の git リビジョン。                                 |
{: class="table table-striped"}

For example:

```yaml
- hold:
          type: approval
          requires:

            - test1
            - test2
      - deploy:
          requires:

            - hold
```

## **`workflows`**
{: #workflows }
すべてのジョブのオーケストレーションに使用します。 各ワークフローは、キーとなるワークフロー名と、値となるマップで構成します。 名前は、その `config.yml` 内で一意である必要があります。 ワークフロー構成の最上位のキーは `version` と `jobs` です。

### **`version`**
{: #version }
The Workflows `version` field is used to issue warnings for deprecation or breaking changes during Beta.

| キー      | 必須 | 型      | 説明                      |
| ------- | -- | ------ | ----------------------- |
| version | ○  | String | Should currently be `2` |
{: class="table table-striped"}

### **<`workflow_name`>**
{: #lessworkflownamegreater }

ワークフローに付与する一意の名前です。

#### **`triggers`**
{: #triggers }
ワークフローを実行するトリガーを指定します。 デフォルトの動作では、ブランチにプッシュされたときにワークフローがトリガーされます。

| キー       | 必須 | 型  | 説明                              |
| -------- | -- | -- | ------------------------------- |
| triggers | ×  | 配列 | Should currently be `schedule`. |
{: class="table table-striped"}

##### **`schedule`**
{: #schedule }
ワークフローに `schedule` を記述し、それを特定の時刻に実行するよう (たとえば、毎日 UTC 午前 0 時に夜間ビルドを実行するなど) 指示できます。

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
`cron` キーは、POSIX の `crontab` 構文で定義します。
The `cron` key is defined using POSIX `crontab` syntax.

| キー   | 必須 | 型              | 説明                                                                                            |
| ---- | -- | -------------- | --------------------------------------------------------------------------------------------- |
| cron | ○  | 文字列、または文字列のリスト | [crontab のマニュアル ページ](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html)を参照してください。 |
{: class="table table-striped"}

###### **`filters`**
{: #filters }
ジョブでは、`requires`、`context`、`type`、`filters` の各キーを使用できます。

| キー      | 必須 | 型   | 説明                |
| ------- | -- | --- | ----------------- |
| filters | ○  | マップ | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

###### **`branches`**
{: #branches }
{:.no_toc}

`branches` キーは、*現在の*ブランチについて、スケジュール実行すべきかどうかを制御します。 この「*現在の*ブランチ」とは、`trigger` スタンザがある `config.yml` ファイルを含むブランチです。 つまり、`master` ブランチでのプッシュは、`master` ブランチでの[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)のみをスケジュールします。

branches では `only` キーと `ignore` キーを使用でき、どちらにもブランチ名を指す 1 つの文字列をマップさせます。 `/` で囲むことで正規表現でブランチに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | 型              | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ○  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ○  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

#### **`jobs`**
{: #jobs }
A job can have the keys `requires`, `context`, `type`, and `filters`.

| キー   | 必須 | 型   | 説明                   |
| ---- | -- | --- | -------------------- |
| jobs | ○  | リスト | 依存関係に従って実行するジョブのリスト。 |
{: class="table table-striped"}

##### **<`job_name`>**
{: #lessjobnamegreater }

`config.yml` 内に存在するジョブの名前を記述します。

###### **`requires`**
{: #requires }
ジョブはデフォルトで並列に実行されるため、依存関係がある場合は、ジョブ名に基づいて明示的に要求する必要があります。

| キー       | 必須 | 型      | 説明                                                                                                                                                                                                                                                                                                   |
| -------- | -- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| requires | ×  | リスト    | そのジョブを開始するために成功する必要があるジョブのリスト。 Note: When jobs in the current workflow that are listed as dependencies are not executed (due to a filter function for example), their requirement as a dependency for other jobs will be ignored by the requires option. しかし、ジョブのすべての依存関係がフィルター処理されると、そのジョブは実行されません。 |
| name     | ×  | String | ジョブ名の代替名。 ジョブを複数回呼び出す場合に便利です。 同じジョブを複数回呼び出したいときや、あるジョブで同じ内容のジョブが必要なときなどに有効です (2.1 のみ)。                                                                                                                                                                                                               |
{: class="table table-striped"}

###### **`context`**
説明
ジョブは、組織に設定されたグローバル環境変数を使用するように構成できます。 アプリケーション設定にコンテキストを追加するには、[コンテキストに関するドキュメント]({{ site.baseurl }}/ja/2.0/contexts)を参照してください。

| キー      | 必須 | 型              | 説明                                                                                                                                       |
| ------- | -- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| context | ×  | 文字列、または文字列のリスト | コンテキストの名前。 初期のデフォルト名は `org-global` です。 各コンテキスト名は一意である必要があります。 If using CircleCI Server, only a single Context per workflow is supported. |
{: class="table table-striped"}

###### **`type`**
型
ジョブで `approval` という `type` を使用できます。 これは、ダウンストリーム ジョブに進む前に手動で承認を行う必要があることを示します。 ワークフローが `type: approval` キーを持つジョブと、そのジョブが依存するジョブを処理するまでは、依存関係の順序でジョブが実行されます。 以下に例を示します。

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
フィルターでは、`branches` キーまたは `tags` キーを使用できます。 **メモ:** ワークフローは、ジョブレベルのブランチを無視します。 ジョブ レベルでブランチを指定していて、後で `config.yml` にワークフローを追加する場合は、ジョブ レベルのブランチを削除し、代わりにそれをワークフロー セクションで宣言する必要があります。

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

これにより、複数のジョブで [1 つのコマンド定義を再利用]({{ site.baseurl }}/ja/2.0/reusing-config/)できます。

###### **`branches`**
{: #branches }
{:.no_toc}
Branches では、`only` キーと `ignore` キーを使用でき、どちらにもブランチ名を指す 1 つの文字列をマップさせます。 スラッシュで囲むことで正規表現でブランチに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。

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

CircleCI では、明示的にタグ フィルターを設定しない限り、タグに対してワークフローは実行されません。 さらに、ジョブが (直接的または間接的に) 他のジョブを必要とする場合は、それらのジョブにタグ フィルターを指定する必要があります。

タグでは、`only` キーと `ignore` キーを使用できます。 スラッシュで囲むことで正規表現でタグに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。 軽量のタグと注釈付きのタグがサポートされています。

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー     | 必須 | Type           | 説明                 |
| ------ | -- | -------------- | ------------------ |
| tags   | ×  | マップ            | 実行するタグを定義するマップ。    |
| only   | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
| ignore | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
{: class="table table-striped"}

For more information, see the [Executing Workflows For a Git Tag]({{ site.baseurl }}/2.0/workflows/#executing-workflows-for-a-git-tag) section of the Workflows document.

###### **`orbs`** (version: 2.1 が必須)
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
- image: ubuntu:14.04
working_directory: /tmp/my-project
steps:
  - run:
      name: テストに合格し、ブランチがステージングならデプロイ
      command: ansible-playbook site.yml -i staging
```

This expands to 9 different `build` jobs, and could be equivalently written as:

```yaml
- image: ubuntu:14.04
working_directory: /tmp/my-project
steps:
  - run:
      name: テストに合格し、ブランチが master ならデプロイ
      command: ansible-playbook site.yml -i production
```

###### Excluding sets of parameters from a matrix
{: #excluding-sets-of-parameters-from-a-matrix }
{:.no_toc}
Sometimes you may wish to run a job with every combination of arguments _except_ some value or values. You can use an `exclude` stanza to achieve this:

```yaml
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

The matrix above would expand into 8 jobs: every combination of the parameters `a` and `b`, excluding `{a: 3, b: 5}`

###### Dependencies and matrix jobs
{: #dependencies-and-matrix-jobs }
{:.no_toc}

To `require` an entire matrix (every job within the matrix), use its `alias`. The `alias` defaults to the name of the job being invoked.

```yaml
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

###### **メモ:** `store_artifacts`、`store_test_results` などの一部のステップは、それより前のステップが失敗しても常に実行されます。
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

CircleCI 設定ファイル v2.1 では、ワークフロー宣言内で真偽値を取る `when` 句を使用して (逆の条件となる `unless` 句も使用可)、そのワークフローを実行するかどうかを決めることができます。

The example configuration below uses a pipeline parameter, `run_integration_tests` to drive the `integration_tests` workflow.

```yaml
以下の構成例では、パイプライン パラメーター <code>run_integration_tests</code> を使用して <code>integration_tests</code> ワークフローの実行を制御しています。
```
 を使用して integration_tests ワークフローの実行を制御しています。
</code>

This example prevents the workflow `integration_tests` from running unless the tests are invoked explicitly when the pipeline is triggered with the following in the `POST` body:

```sh
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

Refer to the [Orchestrating Workflows]({{ site.baseurl }}/2.0/workflows) document for more examples and conceptual information.

## 関連項目
{: #logic-statements }

Certain dynamic configuration features accept logic statements as arguments. Logic statements are evaluated to boolean values at configuration compilation time, that is - before the workflow is run. The group of logic statements includes:

| Type                                                                                                | Arguments             | `true` if                              | Example                                                                  | |-----------------------------------------------------------------------------------------------------+-----------------------+----------------------------------------+--------------------------------------------------------------------------| | YAML literal                                                                                        | None                  | is truthy                              | `true`/`42`/`"a string"`                                                 | | YAML alias                                                                                          | None                  | resolves to a truthy value             | *my-alias                                                                | | [Pipeline Value]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-values)                          | None                  | resolves to a truthy value             | `<< pipeline.git.branch >>`                                              | | [Pipeline Parameter]({{site.baseurl}}/2.0/pipeline-variables/#pipeline-parameters-in-configuration) | None                  | resolves to a truthy value             | `<< pipeline.parameters.my-parameter >>`                                 | | and                                                                                                 | N logic statements    | all arguments are truthy               | `and: [ true, true, false ]`                                             | | or                                                                                                  | N logic statements    | any argument is truthy                 | `or: [ false, true, false ]`                                             | | not                                                                                                 | 1 logic statement     | the argument is not truthy             | `not: true`                                                              | | equal                                                                                               | N values              | all arguments evaluate to equal values | `equal: [ 42, << pipeline.number >>]`                                    | | matches                                                                                             | `pattern` and `value` | `value` matches the `pattern`          | `matches: { pattern: "^feature-.+$", value: << pipeline.git.branch >> }` |
{: class="table table-striped"}

The following logic values are considered falsy:

- false
- 値
- 0
- ```
- 文字列
- statements with no arguments

All other values are truthy. Further, Please also note that using logic with an empty list will cause a validation error.

Logic statements always evaluate to a boolean value at the top level, and coerce as necessary. They can be nested in an arbitrary fashion, according to their argument specifications, and to a maximum depth of 100 levels.

`matches` uses [Java regular expressions](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html) for its `pattern`. It is recommended to enclose a pattern in `^` and `$` to avoid accidental partial matches.

ワークフローを**使用しない**場合は、`jobs` マップに `build` という名前のジョブを含める必要があります。

### 例
{: #logic-statement-examples }

```yaml
詳細については、ワークフローに関するドキュメントの「<a href="{{ site.baseurl }}/ja/2.0/workflows/#git-タグに対応するワークフローを実行する">Git タグに対応するワークフローを実行する</a>」を参照してください。
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
- image: ubuntu:14.04

  - image: mongo:2.6.8
    command: [mongod, --smallfiles]

  - image: postgres:9.4.1
    # 一部のコンテナでは環境変数の設定が必要です
    environment:
      POSTGRES_USER: root

  - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673

  - image: rabbitmq:3.5.4

environment:
  TEST_REPORTS: /tmp/test-reports

working_directory: ~/my-project

steps:

  - checkout

  - run:
      command: echo 127.0.0.1 devhost | sudo tee -a /etc/hosts

  # Postgres のユーザーとデータベースの作成
  # YAML ヒアドキュメント '|' を使用して体裁を整えています

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

  # アーティファクトの保存

  - store_artifacts:
      path: /tmp/artifacts
      destination: build

  # テスト結果のアップロード

  - store_test_results:
      path: /tmp/test-reports
```
{% endraw %}

## 関連項目
{: #see-also }
{:.no_toc}

[設定ファイルの概要]({{site.baseurl}}/2.0/config-intro/)
