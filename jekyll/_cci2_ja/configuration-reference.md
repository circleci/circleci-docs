---
layout: classic-docs
title: "CircleCI を設定する"
short-title: "CircleCI を設定する"
description: ".circleci/config.yml に関するリファレンス"
order: 20
---

`config.yml` ファイルで使用される CircleCI 2.x 構成キーのリファレンス ガイドです。 CircleCI によって承認されたリポジトリ ブランチに `.circleci/config.yml` ファイルが存在するということは、2.x インフラストラクチャを使用することを意味しています。

`config.yml` の全体は「[サンプル コード](#サンプル-コード)」で確認できます。

**メモ:** 既に CircleCI 1.0 バージョンの設定ファイルが存在する場合は、`config.yml` ファイルを使用することで、独立した別のブランチで 2.x ビルドをテストできます。このとき、古い `circle.yml` スタイルの既存の構成は変更する必要がなく、CircleCI 1.0 インフラストラクチャの `.circleci/config.yml` を含まないブランチで実行できます。

* * *

## 目次
{:.no_toc}

- 目次
{:toc}

* * *

## **`version`**

| キー      | 必須 | 型   | 説明                                                                                                                                                                        |
| ------- | -- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version | ○  | 文字列 | `2`、`2.0`、または `2.1`。`.circleci/config.yml` ファイルの簡素化、再利用、パラメータ化ジョブの利用に役立つバージョン 2.1 の新しいキーの概要については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)を参照してください。 |
{: class="table table-striped"}

`version` フィールドは、非推奨または互換性を損なう変更について注意を促すために使用します。

## **`orbs`** (version: 2.1 が必須)

| キー        | 必須 | 型   | 説明                                                                                                                                                                                      |
| --------- | -- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orbs      | ×  | マップ | ユーザー指定の名前によるマップ。Orb の参照名 (文字列) または Orb の定義名 (マップ) を指定します。 Orb 定義は、バージョン 2.1 の設定ファイルの Orb 関連サブセットである必要があります。詳細については [Orb の作成に関するドキュメント]({{ site.baseurl }}/ja/2.0/creating-orbs/)を参照してください。 |
| executors | ×  | マップ | Executor を定義する文字列のマップ。 このページの [executors]({{ site.baseurl }}/ja/2.0/configuration-reference/#executors-version-21-が必須) セクションを参照してください。                                                     |
| commands  | ×  | マップ | コマンドを定義するコマンド名のマップ。 このページの [commands]({{ site.baseurl }}/ja/2.0/configuration-reference/#commands-version-21-が必須) セクションを参照してください。                                                          |
{: class="table table-striped"}

以下の例では、承認済みの `circleci` 名前空間に格納された `hello-build` という名前の Orb を呼び出します。

    version: 2.1
    orbs:
        hello: circleci/hello-build@0.0.5
    workflows:
        "Hello Workflow":
            jobs:
              - hello/hello-build


上の例で、`hello` は Orb の参照名と見なされます。`circleci/hello-build@0.0.5` は完全修飾の Orb 参照です。

## **`commands`** (version: 2.1 が必須)

commands では、ジョブ内で実行する一連のステップをマップとして定義します。これにより、複数のジョブで [1 つのコマンド定義を再利用]({{ site.baseurl }}/ja/2.0/reusing-config/)できます。

| キー          | 必須 | 型     | 説明                                                                                                                                                              |
| ----------- | -- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス | コマンドの呼び出し元のジョブ内で実行する一連のステップ。                                                                                                                                    |
| parameters  | ×  | マップ   | パラメーター キーのマップ。 詳細については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)の「[パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#パラメーターの構文)」を参照してください。 |
| description | ×  | 文字列   | コマンドの目的を記述する文字列。                                                                                                                                                |
{: class="table table-striped"}

例

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

設定ファイル内で使用するパイプライン パラメーターを定義します。 使用方法の詳細については、[パイプライン変数に関するドキュメント]({{ site.baseurl }}/ja/2.0/pipeline-variables#設定ファイルにおけるパイプライン-パラメーター)を参照してください。

| キー         | 必須 | 型   | 説明                                                                                                                         |
| ---------- | -- | --- | -------------------------------------------------------------------------------------------------------------------------- |
| parameters | ×  | マップ | パラメーター キーのマップ。 `文字列`、`ブール値`、`整数`、`列挙型`がサポートされています。 [パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#パラメーターの構文)を参照してください。 |
{: class="table table-striped"}

## **`executors`** (version: 2.1 が必須)

executors では、ジョブのステップを実行する環境を定義します。これにより、複数のジョブで 1 つの Executor 定義を再利用できます。

| キー                | 必須               | 型   | 説明                                                                                                                                                                                 |
| ----------------- | ---------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト | [docker Executor](#docker) 用のオプション。                                                                                                                                                |
| resource_class    | ×                | 文字列 | ジョブ内の各コンテナに割り当てられる CPU と RAM の量。 **メモ:** この機能を利用するには有料アカウントが必要です。 有料のコンテナベース プランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能を利用できるようリクエストしてください。 |
| machine           | ○ <sup>(1)</sup> | マップ | [machine Executor](#machine) 用のオプション。                                                                                                                                              |
| macos             | ○ <sup>(1)</sup> | マップ | [macOS Executor](#macos) 用のオプション。                                                                                                                                                  |
| windows           | ○ <sup>(1)</sup> | マップ | [windows Executor](#windows) 用のオプション。                                                                                                                                              |
| shell             | ×                | 文字列 | すべてのステップのコマンド実行に使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                                                                 |
| working_directory | ×                | 文字列 | ステップを実行するディレクトリ。                                                                                                                                                                   |
| environment       | ×                | マップ | 環境変数の名前と値のマップ。                                                                                                                                                                     |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

例

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.5.1-node-browsers

jobs:
  my-job:
    executor: my-executor
    steps:

      - run: echo outside the executor
```

パラメーター化された Executor の使用例については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)の「[Executor でのパラメーターの使用](https://circleci.com/ja/docs/2.0/reusing-config/#executor-でのパラメーターの使用)」を参照してください。

## **`jobs`**

実行処理は 1 つ以上の名前付きジョブで構成し、 それらのジョブは `jobs` マップで指定します。[2.0 config.yml のサンプル]({{ site.baseurl }}/ja/2.0/sample-config/)で `jobs` マップの例を紹介しています。 ジョブの名前がマップのキーとなり、ジョブを記述するマップが値となります。

[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を使用している場合は、`.circleci/config.yml` ファイル内でジョブの名前が一意である必要があります。

ワークフローを**使用しない**場合は、`jobs` マップに `build` という名前のジョブを含める必要があります。 この `build` ジョブは、VCS プロバイダーへのプッシュによってトリガーされる実行のデフォルトのエントリポイントです。 さらにその他のジョブを指定したり、CircleCI API からジョブを実行したりできます。

**メモ:** ジョブの最大実行時間は 5 時間です。 ジョブがタイムアウトになる場合は、並列実行も検討してください。

### **<`job_name`>**

各ジョブは、キーとなるジョブ名と、値となるマップで構成されます。 名前は、その `jobs` リスト内で一意である必要があります。 値となるマップでは以下の属性を使用できます。

| キー                | 必須               | 型   | 説明                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ---------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト | [docker Executor](#docker) 用のオプション。                                                                                                                                                                                                                                                                                                                                 |
| machine           | ○ <sup>(1)</sup> | マップ | [machine Executor](#machine) 用のオプション。                                                                                                                                                                                                                                                                                                                               |
| macos             | ○ <sup>(1)</sup> | マップ | [macOS Executor](#macos) 用のオプション。                                                                                                                                                                                                                                                                                                                                   |
| shell             | ×                | 文字列 | すべてのステップのコマンド実行に使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                                                                                                                                                                                                                                                  |
| steps             | ○                | リスト | 実行する[ステップ](#steps)のリスト。                                                                                                                                                                                                                                                                                                                                             |
| working_directory | ×                | 文字列 | ステップを実行するディレクトリ。 デフォルトは `~/project` となります (この `project` は特定のプロジェクトの名前ではなく、リテラル文字列)。 ジョブ内で実行するプロセスでは、`$CIRCLE_WORKING_DIRECTORY` 環境変数を介してこのディレクトリを参照できます。 **メモ:** YAML 設定ファイルに記述したパスは*展開されません*。`store_test_results.path` を `$CIRCLE_WORKING_DIRECTORY/tests` と設定しても、CircleCI は文字どおり「`$CIRCLE_WORKING_DIRECTORY`」という、`$` 記号を含む名前のディレクトリ内に、サブディレクトリ `test` を格納しようとします。 |
| parallelism       | ×                | 整数  | このジョブを実行する並列インスタンスの数 (デフォルトは 1)。                                                                                                                                                                                                                                                                                                                                    |
| environment       | ×                | マップ | 環境変数の名前と値のマップ。                                                                                                                                                                                                                                                                                                                                                      |
| branches          | ×                | マップ | ワークフローまたはバージョン 2.1 の設定ファイル**以外**の構成に含まれる 1 つのジョブに対して特定のブランチでの実行を許可またはブロックするルールを定義するマップ (デフォルトではすべてのブランチでの実行が許可されます)。 ワークフロー内またはバージョン 2.1 の設定ファイル内のジョブに対するブランチ実行の設定については、[workflows](#workflows) セクションを参照してください。                                                                                                                                                     |
| resource_class    | ×                | 文字列 | ジョブ内の各コンテナに割り当てられる CPU と RAM の量。 **メモ:** この機能を利用するには有料アカウントが必要です。 有料のコンテナベース プランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能を利用できるようリクエストしてください。                                                                                                                                                                                  |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

#### `environment`

環境変数の名前と値のマップです。 これらは、CircleCI アプリケーションで設定した環境変数をオーバーライドします。

#### `parallelism`

`parallelism` を 2 以上に設定すると、設定した数の Executor がそれぞれセットアップされ、そのジョブのステップを並列に実行します。 これにより、テスト ステップを最適化できます。CircleCI CLI を使用して並列コンテナにテスト スイートを分割すると、ジョブの実行時間を短縮できます。 並列処理を設定していても、特定のステップでは並列処理がオプトアウトされ、1 つの Executor でのみ実行される場合があります (たとえば [`deploy` ステップ](#deploy) など)。 詳細については、[並列ジョブのドキュメント]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を参照してください。

`working_directory` で指定したディレクトリが存在しない場合は、自動的に作成されます。

例

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large
    working_directory: ~/my-app
    steps:
      - run: go test -v $(go list ./... | circleci tests split)
```

#### **`docker`** / **`machine`** / **`macos`** / **`windows`** (*Executor*)

Executor とは、簡単に言うと「ステップの実行環境」です。 CircleCI 2.0 では、必要な数の Docker コンテナを一度にローンチすることによって必要な環境を構築するか、完全な仮想マシンを使用します。 Executor の種類については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

#### `docker`
{:.no_toc}

`docker` キーは、以下のマップのリストで構成します。

| キー          | 必須 | 型         | 説明                                                             |
| ----------- | -- | --------- | -------------------------------------------------------------- |
| image       | ○  | 文字列       | 使用するカスタム Docker イメージの名前。                                       |
| name        | ×  | 文字列       | 他から参照するためのコンテナの名前。 デフォルトでは、`localhost` を通してコンテナ サービスにアクセスできます。 |
| entrypoint  | ×  | 文字列またはリスト | コンテナのローンチ時に実行するコマンド。                                           |
| command     | ×  | 文字列またはリスト | コンテナのローンチ時にルート プロセスとなる PID 1 として使用するコマンド (または entrypoint の引数)。 |
| user        | ×  | 文字列       | Docker コンテナ内でコマンドを実行するユーザー。                                    |
| environment | ×  | マップ       | 環境変数の名前と値のマップ。                                                 |
| auth        | ×  | マップ       | 標準の `docker login` 認証情報を用いたレジストリの認証情報。                         |
| aws_auth    | ×  | マップ       | AWS EC2 Container Registry (ECR) の認証情報。                        |
{: class="table table-striped"}

ファイル内で最初に記述する `image` が、すべてのステップを実行するプライマリ コンテナ イメージとなります。

`entrypoint` は、Dockerfile のデフォルトのエントリポイントをオーバーライドします。

`command` は、エントリポイントが Dockerfile に指定されている場合、イメージのエントリポイントに渡す引数として扱われます。あるいは、このスコープにも Dockerfile ファイルにもエントリポイントが指定されていない場合は、実行するコマンドとして扱われます。

[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container) (最初に記述したもの) に対して `command` を指定しない場合、`command` とイメージ エントリポイントは無視されます。これにより、エントリポイントの実行可能ファイルによる大量のリソース消費や予期しない終了によって発生するエラーが回避されます。 現時点では、`steps` はすべてプライマリ コンテナでのみ実行されます。

`name` では、セカンダリ サービス コンテナにアクセスするための名前を定義します。 デフォルトでは、すべてのサービスが `localhost` で直接アクセスできる状態になっています。 たとえば、同じサービスのバージョン違いを複数立ち上げるときなど、ローカル ホスト以外のホスト名を使用したい場合に、このフィールドは適しています。

`environment` 設定は、初期化用の `command` だけでなく、この Executor で実行されるすべてのコマンドに適用されます。 この `environment` は、前述のジョブ マップでの設定よりも優先されます。

タグまたはダイジェストを使用して、イメージのバージョンを指定できます。 任意の公式 Docker レジストリ (デフォルトは Docker Hub) にある任意のパブリック イメージを使用できます。 詳細については、[イメージの指定に関するドキュメント]({{ site.baseurl }}/ja/2.0/executor-types)を参照してください。

例

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty # プライマリ コンテナ
        environment:
          ENV: CI

      - image: mongo:2.6.8
        command: [--smallfiles]

      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
```

プライベート イメージを使用する場合は、`auth` フィールドを使用してユーザー名とパスワードを指定できます。 パスワードを保護するために、プロジェクトの設定値として設定しておいて、以下のように参照することも可能です。

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # 文字列リテラル値を指定するか
          password: $DOCKERHUB_PASSWORD  # UI から設定したプロジェクトの環境変数を参照するように指定します
```

[AWS ECR](https://aws.amazon.com/ecr/) でホストされているイメージを使用するには、AWS 認証情報を使用した認証が必要です。 デフォルトでは、CircleCI アプリケーションの [Project (プロジェクト)] > [Settings (設定)] > [AWS Permissions (AWS 権限)] ページで追加した AWS 認証情報、またはプロジェクト環境変数の `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を使用します。 以下の例のように、`aws_auth` フィールドを使用して認証情報を設定することも可能です。

    jobs:
      build:
        docker:
          - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
            aws_auth:
              aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定するか
              aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # UI から設定したプロジェクトの環境変数を参照するように指定します


バージョン 2.1 を使用している場合、[宣言済みのコマンド]({{ site.baseurl }}/ja/2.0/reusing-config/)をジョブで再利用できます。以下の例では `sayhello` コマンドを呼び出しています。

    jobs:
      myjob:
        docker:
          - image: "circleci/node:9.6.1"
        steps:
          - sayhello:
              to: "Lev"


#### **`machine`**
{:.no_toc}

[machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) は、`machine` キーと以下のマップを用いて構成します。

| キー                     | 必須 | 型    | 説明                                                                                                                                                                                                                                       |
| ---------------------- | -- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image                  | ○  | 文字列  | 使用する VM イメージ。 [使用可能なイメージ](#使用可能な-machine-イメージ)を参照してください。 **メモ:** このキーは、オンプレミス環境では**サポートされません**。 ユーザーのサーバーにインストールされた CircleCI 上の `machine` Executor イメージをカスタマイズする方法については、[VM サービスに関するドキュメント]({{ site.baseurl }}/ja/2.0/vm-service)を参照してください。 |
| docker_layer_caching | ×  | ブール値 | `true` に設定すると、[Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)が有効になります。 **メモ:** お使いのアカウントでこの有料の機能を有効化するには、サポート チケットをオープンしてください。CircleCI 営業担当者から連絡を差し上げます。                                                                |
{: class="table table-striped"}


例

```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
    steps:
      - checkout
      - run:
          name: "テスト"
          command: echo "Hi"
```

##### 使用可能な `machine` イメージ

CircleCI ではいくつかの machine イメージをサポートしており、`image` フィールドで指定できます。

- `ubuntu-1604:201903-01` - Ubuntu 16.04、docker 18.09.3、docker-compose 1.23.1
- `circleci/classic:latest` (以前のデフォルト) - Ubuntu バージョン `14.04` イメージ。Docker バージョン `17.09.0-ce`、docker-compose バージョン `1.14.0` に加え、CircleCI 1.0 ビルド イメージに含まれる共通言語ツールを含みます。 `latest` イメージに変更があるときには、1 週間前までに[告知](https://discuss.circleci.com/t/how-to-subscribe-to-announcements-and-notifications-from-circleci-email-rss-json/5616)します。 Ubuntu 14.04 のサポートは終了しました。 Ubuntu 16.04 イメージの使用をお勧めします。
- `circleci/classic:edge` - Ubuntu バージョン `14.04` イメージ。Docker バージョン `17.10.0-ce`、docker-compose バージョン `1.16.1` に加え、CircleCI 1.0 ビルド イメージに含まれる共通言語ツールを含みます。
- `circleci/classic:201703-01` – docker 17.03.0-ce、docker-compose 1.9.0
- `circleci/classic:201707-01` – docker 17.06.0-ce、docker-compose 1.14.0
- `circleci/classic:201708-01` – docker 17.06.1-ce、docker-compose 1.14.0
- `circleci/classic:201709-01` – docker 17.07.0-ce、docker-compose 1.14.0
- `circleci/classic:201710-01` – docker 17.09.0-ce、docker-compose 1.14.0
- `circleci/classic:201710-02` – docker 17.10.0-ce、docker-compose 1.16.1
- `circleci/classic:201711-01` – docker 17.11.0-ce、docker-compose 1.17.1
- `circleci/classic:201808-01` – docker 18.06.0-ce、docker-compose 1.22.0

machine Executor は、ジョブまたはワークフローで Docker イメージをビルドするときに便利な [Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)をサポートします。

##### 使用可能な Linux GPU イメージ

[Linux GPU Executor](#gpu-executor-linux) では、次のイメージが使用可能です。

- `ubuntu-1604-cuda-10.1:201909-23` - CUDA 10.1、docker 19.03.0-ce、nvidia-docker 2.2.2
- `ubuntu-1604-cuda-9.2:201909-23` - CUDA 9.2、docker 19.03.0-ce、nvidia-docker 2.2.2

##### 使用可能な Windows GPU イメージ

[Windows GPU Executor](#gpu-executor-windows) では、次のイメージが使用可能です。

- `windows-server-2019-nvidia:stable` - Windows Server 2019、CUDA 10.1 （このイメージがデフォルトです)

**例**

```yaml
version: 2.1
workflows:
  main:
    jobs:
      - build
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # デフォルトは false
```

#### **`macos`**
{:.no_toc}

CircleCI は [macOS](https://developer.apple.com/macos/) 上でのジョブ実行をサポートしており、macOS、[iOS](https://developer.apple.com/jp/ios/)、[tvOS](https://developer.apple.com/jp/tvos/)、および [watchOS](https://developer.apple.com/jp/watchos/) 用のアプリのビルド、テスト、デプロイが可能です。 macOS 仮想マシンでジョブを実行するには、`macos` キーをジョブ構成の最上位に追加し、使用する Xcode のバージョンを指定します。

| キー    | 必須 | 型   | 説明                                                                                                                                               |
| ----- | -- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| xcode | ○  | 文字列 | 仮想マシンにインストールする Xcode のバージョン。iOS でのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」を参照してください。 |
{: class="table table-striped"}

**例:** macOS 仮想マシンを Xcode バージョン 11.3 で使用する場合

```yaml
jobs:
  build:
    macos:
      xcode: "11.3.0"
```

#### **`windows`**
{:.no_toc}

CircleCI は、Windows 上でのジョブ実行をサポートしています。 Windows マシンでジョブを実行するには、`windows` キーをジョブ構成の最上位に追加する必要があります。 Orb を使用すると、Windows ジョブを簡単にセットアップできます。 Windows ジョブを実行する際の前提条件と、Windows マシンで提供される機能の詳細については、「[Windows での Hello World]({{ site.baseurl }}/ja/2.0/hello-world-windows)」を参照してください。

**例:** Windows Executor を使用して単純なジョブを実行する場合

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

#### **`branches`**

ワークフローを**構成せず**、2.1 ではなく 2.0 の設定ファイルを使用している場合に、一部のブランチの実行を許可またはブロックするルールを定義できます。[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)を使用している場合、ジョブ レベルのブランチは無視されるため、`config.yml` ファイルの workflows セクションで構成する必要があります。 2.1 の設定ファイルを使用している場合にフィルターを使用するには、ワークフローを追加する必要があります。 詳細については、[workflows](#workflows) セクションを参照してください。 ジョブ レベルの `branch` キーは、以下のマップで構成します。

| キー     | 必須 | 型   | 説明              |
| ------ | -- | --- | --------------- |
| only   | ×  | リスト | 実行するブランチのみのリスト。 |
| ignore | ×  | リスト | 無視するブランチのリスト。   |
{: class="table table-striped"}

`only` と `ignore` のリストには、完全一致のフル ネームと正規表現のどちらでも記述できます。 正規表現は、文字列**全体**に一致する必要があります。 たとえば、以下のようになります。

```YAML
jobs:
  build:
    branches:
      only:
        - master
        - /rc-.*/
```

この場合は、"master" ブランチと、正規表現 "rc-.*" に一致するブランチのみが実行されます。

```YAML
jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

こちらの例では、"develop" ブランチと正規表現 "feature-.*" に一致するブランチを除くすべてのブランチが実行されます。

設定ファイルに `ignore` と `only` の両方を記述している場合は、`ignore` のみが考慮されます。

構成されたルールによって実行されなかったジョブは、UI のジョブ一覧にスキップのマーク付きで表示されます。

**すべての**ブランチで確実にジョブを実行するには、`branches` キーを使用しないか、`only` キーに正規表現 `/.*/` を指定してすべてのブランチを対象にします。

#### **`resource_class`**

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 下表に示すように、Executor ごとにさまざまなリソース クラスが提供されています。 **CircleCI Server をオンプレミスでホスティングしている場合は、利用可能なリソース クラスについてシステム管理者に問い合わせてください**。

CircleCI では、すべてのお客様がシステムを安定した状態で利用できるよう、リソース クラスごとに同時処理数のソフト制限を設けています。 Performance プランまたは Custom プランを使用していて、特定のリソース クラスで待機時間が発生している場合は、このソフト制限に達している可能性があります。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new) にお客様のアカウントの制限値引き上げを依頼してください。

**メモ:** この機能は、Free プランおよび Performance プランで自動的に有効化されています。 Free プランのお客様の場合、利用可能なリソース クラスは Linux が small または medium、Windows が medium に制限されています。 MacOS は Free プランでは利用できません。 コンテナ プランのお客様は、[サポート チケットをオープン](https://support.circleci.com/hc/en-us/requests/new)して、この機能の有効化について CircleCI 営業担当者にお問い合わせください。

##### docker Executor

| クラス                    | vCPU | RAM   |
| ---------------------- | ---- | ----- |
| small                  | 1    | 2 GB  |
| medium (デフォルト)         | 2    | 4 GB  |
| medium+                | 3    | 6 GB  |
| large                  | 4    | 8 GB  |
| xlarge                 | 8    | 16 GB |
| 2xlarge<sup>(2)</sup>  | 16   | 32 GB |
| 2xlarge+<sup>(2)</sup> | 20   | 40 GB |
{: class="table table-striped"}

###### 例

```yaml
jobs:
  build:
    docker:

      - image: buildpack-deps:trusty
    resource_class: xlarge
    steps:
      ... // 他の構成
```

##### machine Executor (Linux)

| クラス            | vCPU | RAM    |
| -------------- | ---- | ------ |
| medium (デフォルト) | 2    | 7.5 GB |
| large          | 4    | 15 GB  |
{: class="table table-striped"}

###### 例

```yaml
jobs:
  build:
    machine: true
    resource_class: large
    steps:
      ... // 他の構成
```

##### macOS Executor

| クラス                 | vCPU | RAM   |
| ------------------- | ---- | ----- |
| medium (デフォルト)      | 4    | 8 GB  |
| large<sup>(2)</sup> | 8    | 16 GB |
{: class="table table-striped"}

###### 例

```yaml
jobs:
  build:
    macos:
      xcode: "11.3.0"
    resource_class: large
    steps:
      ... // 他の構成
```

##### windows Executor

| クラス            | vCPU | RAM   |
| -------------- | ---- | ----- |
| medium (デフォルト) | 4    | 15 GB |
| large          | 8    | 30 GB |
| xlarge         | 16   | 60 GB |
{: class="table table-striped"}

###### 例

```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/default
    steps:

      - run: Write-Host 'Hello, Windows'
```

Windows Executor の詳細と例については、[Windows に関する入門ガイド]({{ site.baseurl }}/ja/2.0/hello-world-windows/) を参照してください。

##### GPU Executor (Linux)

| クラス                             | vCPU | RAM | GPU | GPU モデル         | GPU メモリ (GiB) |
| ------------------------------- | ---- | --- | --- | --------------- | ------------- |
| gpu.nvidia.small<sup>(2)</sup>  | 4    | 15  | 1   | NVIDIA Tesla P4 | 8             |
| gpu.nvidia.medium<sup>(2)</sup> | 8    | 30  | 1   | NVIDIA Tesla T4 | 16            |
{: class="table table-striped"}

###### 例

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

使用可能なイメージの一覧は、[こちらのセクション](#使用可能な-linux-gpu-イメージ)を参照してください。

##### GPU Executor (Windows)

| クラス                                     | vCPU | RAM | GPU | GPU モデル         | GPU メモリ (GiB) |
| --------------------------------------- | ---- | --- | --- | --------------- | ------------- |
| windows.gpu.nvidia.medium<sup>(2)</sup> | 8    | 30  | 1   | NVIDIA Tesla T4 | 16            |
{: class="table table-striped"}

###### 例

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

<sup>(2)</sup> *このリソースは、サポート チームによる確認が必要となります。 ご利用の際は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)してください。*

**メモ:** Java、Erlang など、CPU 数に関する情報を `/proc` ディレクトリから入手する言語では、CircleCI 2.0 のリソース クラス機能を使用するときに、低速化を防ぐために追加の構成が必要になることがあります。 この問題が発生すると、32 個の CPU コアを要求していても、1 コアを要求する場合よりも実行速度が低下する場合があります。 この問題が発生する言語をお使いの場合は、保証された CPU リソースに基づいて CPU 数を固定する必要があります。 割り当てられているメモリ量を確認するには、`grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat` を実行して cgroup メモリ階層制限をチェックしてください。

#### **`steps`**

ジョブ内の `steps` は、キーと値のペアを 1 つずつ列挙する形で設定します。キーはステップの種類を表し、 値は (そのステップの種類の要件に従って) 構成マップまたは文字列で記述します。 たとえば、マップで記述する場合は以下のようになります。

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

一部のステップは省略構文を実装しており、 たとえば `run` を以下のように呼び出すことが可能です。

    jobs:
      build:
        steps:
          - run: make test


省略形式の `run` ステップでは、どの `command` を実行するかを文字列値で直接指定できます。 この場合、他の属性に対しては、自動的に適切なデフォルト値が設定されます (たとえば、`name` は `command` と同じ値になります)。

さらに一部のステップには別の省略表記があり、キーと値のペアの代わりに単なる文字列のステップ名を使用できます。

    jobs:
      build:
        steps:
          - checkout


この例の `checkout` ステップは、プロジェクトのソース コードをジョブの [`working_directory`](#jobs) にチェックアウトします。

通常、ステップは以下のように記述します。

| キー                   | 必須 | 型         | 説明                              |
| -------------------- | -- | --------- | ------------------------------- |
| &lt;step_type> | ○  | マップまたは文字列 | ステップの構成マップ、またはステップによって規定された文字列。 |
{: class="table table-striped"}

定義済みステップについて、以下に詳しく説明します。

##### **`run`**

すべてのコマンドライン プログラムの呼び出しに使用します。構成値のマップを記述するか、省略形式で呼び出した場合には `command` と `name` の両方に使用する文字列を記述します。 run コマンドは、デフォルトでは非ログイン シェルで実行されます。したがって、ドットファイルをコマンドの中で明示的に参照する必要があります。

| キー                  | 必須 | 型    | 説明                                                                                                |
| ------------------- | -- | ---- | ------------------------------------------------------------------------------------------------- |
| command             | ○  | 文字列  | シェルから実行するコマンド。                                                                                    |
| name                | ×  | 文字列  | CircleCI の UI に表示されるステップのタイトル (デフォルトは `command` 文字列全体)。                                           |
| shell               | ×  | 文字列  | コマンド実行に使用するシェル (デフォルトについては「[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照)。                               |
| environment         | ×  | マップ  | コマンドに対するローカル スコープとなる追加の環境変数。                                                                      |
| background          | ×  | ブール値 | このステップをバックグラウンドで実行するかどうかの設定 (デフォルトは false)。                                                       |
| working_directory   | ×  | 文字列  | このステップを実行するディレクトリ (デフォルトはジョブの [`working_directory`](#jobs))。                                      |
| no_output_timeout | ×  | 文字列  | 出力のないままコマンドを実行できる経過時間。 「20m」「1.25h」「5s」のように、数字の後に単位を付けた文字列で記述します (デフォルトは 10 分)                    |
| when                | ×  | 文字列  | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。 |
{: class="table table-striped"}

それぞれの `run` 宣言で新しいシェルが立ち上がります。 複数行の `command` を指定でき、その場合はすべての行が同じシェルで実行されます。

```YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

###### *デフォルトのシェル オプション*

**Linux** で実行するジョブの場合、`shell` オプションのデフォルト値は、`/bin/bash` がビルド コンテナに存在すれば `/bin/bash -eo pipefail`、 存在しなければ `/bin/sh -eo pipefail` になります。 デフォルトのシェルはログイン シェルではありません (`--login` または `-l` は指定されません)。 そのため、このシェルは `~/.bash_profile`、`~/.bash_login`、`~/.profile` といったファイルを**読み込みません**。

**macOS** で実行するジョブの場合、デフォルトのシェルは `/bin/bash --login -eo pipefail` になります。 このシェルは、非対話型のログイン シェルです。 シェルは、`/etc/profile/` を読み込み、続いて `~/.bash_profile` を読み込んでから、各ステップを実行します。

bash を呼び出したときに実行されるファイルの詳細については、[`bash` のマニュアル ページの `INVOCATION` のセクション](https://linux.die.net/man/1/bash)をご覧ください。

`-eo pipefail` オプションについては以下のように説明されています。

`-e`

> パイプライン (1 つのコマンドで構成される場合を含む)、かっこ「()」で囲まれたサブシェル コマンド、または中かっこ「{}」で囲まれたコマンド リストの一部として実行されるコマンドの 1 つが 0 以外のステータスで終了した場合は、直ちに終了します。

したがって、前の例で `mkdir` がディレクトリの作成に失敗し、0 以外のステータスを返した場合は、コマンドの実行が終了し、ステップ全体が失敗として扱われます。 それとは反対の動作にする必要がある場合は、`command` に `set +e` を追加するか、`run` の構成マップでデフォルトの `shell` をオーバーライドします。 たとえば、以下のようになります。

```YAML
<br />- run:
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

```YAML
<br />- run: make test | tee test-output.log
```

この例では、`make test` が失敗した場合、`-o pipefail` オプションによってステップ全体が失敗します。 `-o pipefail` オプションを指定していなければ、パイプライン全体の結果は最後のコマンド (`tee test-output.log`) によって決まり、これは常に 0 のステータスを返すため、ステップの実行は常に成功となります。

`make test` が失敗しても、パイプラインの残りの部分は実行されることに注意してください。

この動作を回避するには、コマンドで `set +o pipefail` を指定するか、`shell` 全体をオーバーライドします (前述の例を参照)。

デフォルト オプション (`-eo pipefail`) を使用すると、途中のコマンドのエラーが表示され、失敗したジョブのデバッグが容易になるため、通常はこちらをお勧めします。 UI には、使用されているシェルと各 `run` ステップのすべての有効なオプションが表示されるため便利です。

詳細については、「[シェル スクリプトの使用]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)」を参照してください。

###### *バックグラウンド コマンド*

`background` 属性を使用すると、コマンドをバックグラウンドで実行するように構成できます。 `background` 属性を `true` に設定した場合、コマンドの終了を待つことなく、ジョブの実行が直ちに次のステップに進みます。 以下は、Selenium テストにおいてよく必要となる、X 仮想フレームバッファをバックグラウンドで実行するための構成例です。

```YAML
- run:
    name: X 仮想フレームバッファの実行
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### *省略構文*

`run` では、たいへん便利な省略構文を使用できます。

```YAML
- run: make test

# 省略形式のコマンドは複数行にわたって記述可能です

- run: |
    mkdir -p /tmp/test-results
    make test
```

この例では、`command` と `name` に `run` の文字列値が割り当てられたことになり、この `run` の構成マップの残りの属性はデフォルト値になります。

###### `when` 属性

CircleCI のデフォルトでは、ジョブ ステップが `config.yml` に定義された順序で一度に 1 つずつ、いずれかのステップが失敗する (0 以外の終了コードを返す) まで実行されます。 コマンドが失敗すると、以降のジョブ ステップは実行されません。

ジョブ ステップに `when` 属性を追加すると、このデフォルトの動作をオーバーライドして、ジョブのステータスに応じてステップを実行するかスキップするかを選択できるようになります。

デフォルト値の `on_success` は、それまでのすべてのステップが成功した (終了コード 0 を返した) 場合にのみ、そのステップが実行されることを意味します。

`always` は、それまでのステップの終了ステータスに関係なく、そのステップが実行されることを意味します。 それまでのステップの成否にかかわらずタスクを実行したい場合に便利です。 例として、ログやコード カバレッジ データをどこかにアップロードする必要があるジョブ ステップが挙げられます。

`on_fail` は、それまでのステップの 1 つが失敗した (0 以外の終了コードを返した) 場合にのみ、そのステップが実行されることを意味します。 失敗したテストのデバッグに役立てるために何らかの診断データを保存したり、失敗に関するカスタム通知 (メールの送信やチャットルームへのアラートのトリガーなど) を実行したりする場合に、よく使用されます。

**メモ:** `store_artifacts`、`store_test_results` などの一部のステップは、それより前のステップが失敗しても常に実行されます。

```YAML
- run:
    name: CodeCov.io データのアップロード
    command: bash <(curl -s https://codecov.io/bash) -F unittests
    when: always # 成功しても失敗しても、コード カバレッジの結果をアップロードします
```

###### `step` 内からのジョブの終了

`run: circleci-agent step halt` を使用することで、ジョブを失敗させずに終了できます。 これは、条件に従ってジョブを実行する必要がある場合に便利です。

以下の例では、`halt` を使用して、`develop` ブランチでジョブが実行されないようにしています。

```YAML
run: |
    if [ "$CIRCLE_BRANCH" = "develop" ]; then
        circleci-agent step halt
    fi
```

###### 例

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

条件付きステップは、`when` キーまたは `unless` キーを含むステップで構成されます。 `when` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `when` ステップの目的は、コマンドやジョブ構成が、ワークフローの実行前にチェックされるカスタム条件 (設定ファイルのコンパイル時に決定) に基づいて実行されるようにカスタマイズすることです。 詳細については、設定ファイルの再利用に関するドキュメントの「[条件付きステップの定義]({{ site.baseurl }}/ja/2.0/reusing-config/#条件付きステップの定義)」を参照してください。

| キー        | 必須 | 型     | 説明                         |
| --------- | -- | ----- | -------------------------- |
| condition | ○  | 文字列   | パラメーター値。                   |
| steps     | ○  | シーケンス | 条件が true のときに実行するステップのリスト。 |
{: class="table table-striped"}

###### *例*

    version: 2.1

    jobs: # 条件付きステップは `commands:` でも定義できます
      job_with_optional_custom_checkout:
        parameters:
          custom_checkout:
            type: string
            default: ""
        machine: true
        steps:

          - when:
              condition: <<parameters.custom_checkout>>
              steps:
                - run: echo "my custom checkout"
          - unless:
              condition: <<parameters.custom_checkout>>
              steps:
                - checkout
    workflows:
      build-test-deploy:
        jobs:
          - job_with_optional_custom_checkout:
              custom_checkout: "any non-empty string is truthy"
          - job_with_optional_custom_checkout


##### **`checkout`**

設定済みの `path` (デフォルトは `working_directory`) にソース コードをチェックアウトするために使用する特別なステップです。 これが特別なステップである理由は、単なるヘルパー関数ではなく、コードを自動的に簡単にチェックアウトできるように設計されているからです。 このステップは SSH でチェックアウトするように git を設定するため、HTTPS で git を実行する必要がある場合は、このステップを使用しないでください。

| キー   | 必須 | 型   | 説明                                                        |
| ---- | -- | --- | --------------------------------------------------------- |
| path | ×  | 文字列 | チェックアウト ディレクトリ (デフォルトはジョブの [`working_directory`](#jobs))。 |
{: class="table table-striped"}

`path` が既に存在する場合、次のように動作します。

- Git リポジトリ - ステップはリポジトリ全体をクローンするのではなく、オリジナルをプルします。
- Git リポジトリ以外 - ステップは失敗します。

`checkout` は、属性のない単なる文字列としてステップを記述します。

```YAML
- checkout
```

**メモ:** CircleCI は、サブモジュールをチェックアウトしません。 サブモジュールが必要なプロジェクトの場合は、以下の例に示すように、適切なコマンドを実行する `run` ステップを追加します。

```YAML
- checkout
- run: git submodule sync
- run: git submodule update --init
```

このコマンドは、SSH 経由で GitHub や Bitbucket を操作するために必要な認証鍵を自動的に挿入します。この詳細は、カスタム チェックアウト コマンドを実装する際に役に立つ[インテグレーション ガイド]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#ssh-ホストの信頼性の確立)で解説しています。

**メモ:** `checkout` ステップは、自動ガベージ コレクションをスキップするように Git を構成します。 [restore_cache](#restore_cache) で `.git` ディレクトリをキャッシュし、そのキャッシュ サイズをガベージ コレクションで縮小したい場合は、その前に `git gc` コマンドを指定した [run](#run) ステップを実行してください。

##### **`setup_remote_docker`**

Docker コマンドを実行するように構成されたリモート Docker 環境を作成します。 詳細については、「[Docker コマンドの実行手順]({{ site.baseurl }}/ja/2.0/building-docker-images/)」を参照してください。

| キー                     | 必須 | 型    | 説明                                                                                                                                                   |
| ---------------------- | -- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker_layer_caching | ×  | ブール値 | `true` に設定すると、リモート Docker 環境で [Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching/) が有効になります (デフォルトは `false`)。                           |
| version                | ×  | 文字列  | 使用する Docker のバージョン文字列 (デフォルトは `17.09.0-ce`)。 サポートされている Docker バージョンについては、[こちら]({{site.baseurl}}/ja/2.0/building-docker-images/#docker-のバージョン)を参照してください。 |
{: class="table table-striped"}

**メモ**

- Docker レイヤー キャッシュを利用するには有料アカウントが必要です。 有料のプランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して機能を利用できるようリクエストしてください。 リクエスト時には、CircleCI 上のプロジェクトへのリンクもお送りください。
- `setup_remote_docker` は、`machine` Executor と互換性がありません。 `machine` Executor で Docker レイヤー キャッシュを有効化する方法については、[こちら]({{ site.baseurl }}/ja/2.0/docker-layer-caching/#machine-executor)を参照してください。
- 現在、プライベート クラウドまたはデータセンターにインストールされている CircleCI では、`version` キーがサポートされていません。 お使いのリモート Docker 環境にインストールされている Docker バージョンについては、システム管理者にお問い合わせください。

##### **`save_cache`**

依存関係やソース コードなどのファイルのキャッシュ、または複数のファイルが入ったディレクトリのキャッシュを生成して、オブジェクト ストレージに格納します。 後続のジョブで、[キャッシュを復元](#restore_cache)できます。 詳細については、[キャッシュに関するドキュメント]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。

| キー    | 必須 | 型   | 説明                                                                                                |
| ----- | -- | --- | ------------------------------------------------------------------------------------------------- |
| paths | ○  | リスト | キャッシュに追加するディレクトリのリスト。                                                                             |
| key   | ○  | 文字列 | このキャッシュの一意の識別子。                                                                                   |
| name  | ×  | 文字列 | CircleCI の UI に表示されるステップのタイトル (デフォルトは「Saving Cache」)。                                             |
| when  | ×  | 文字列 | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。 |
{: class="table table-striped"}

`key` に指定したキャッシュは変更不可です。一度書き込むと変更できません。

**メモ:** `key` に指定した値が既存のキャッシュの識別子と重複する場合、そのキャッシュは変更されないまま、ジョブの実行が次のステップに進みます。

新しいキャッシュを格納する際に、`key` に特別なテンプレートの値を含めることも可能です。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ビルド番号。                                                                                                                                                                                                                                                                                                                           |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                               |
| {% raw %}`{{ .CheckoutKey }}`{% endraw %}              | リポジトリのチェックアウトに使用する SSH 鍵。                                                                                                                                                                                                                                                                                                                        |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                               |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。 リポジトリにコミットするファイルのみを指定できます。絶対パス、または現在の作業ディレクトリからの相対パスで参照できます。 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用をお勧めします。 また、このファイルの内容が、`restore_cache` から `save_cache` までの間に変化しないようにすることが重要です。ファイルの内容が変化した場合、`restore_cache` のタイミングで使用されるファイルとは異なるキャッシュ キーの下でキャッシュが保存されます。 |
| {% raw %}`{{ epoch }}`{% endraw %}                     | UNIX エポックからの秒数で表される現在時刻。                                                                                                                                                                                                                                                                                                                         |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU の情報。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュする場合に便利です (`darwin amd64`、`linux i386/32-bit` など)。                                                                                                                                                                                                                                           |
{: class="table table-striped"}

ステップの実行中に、上記のテンプレートが実行時の値に置き換えられ、その置換後の文字列が `key` として使用されます。

テンプレートの例

- {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変わるたびにキャッシュが再生成されます。このプロジェクトのさまざまなブランチで同じキャッシュ キーが生成されます。
- {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - 上の例と同じように、ファイルの内容が変わるたびにキャッシュが再生成されますが、各ブランチで個別のキャッシュが生成されます。
- {% raw %}`myapp-{{ epoch }}`{% endraw %} - ジョブを実行するごとに個別のキャッシュが生成されます。

キャッシュの `key` に使用するテンプレートを選択するうえでは、キャッシュの保存にはコストがかかること、キャッシュを CircleCI ストレージにアップロードするにはある程度の時間がかかることに留意してください。 したがって、実際に何か変更があった場合にのみ新しいキャッシュが生成されるような `key` を使用し、ジョブを実行するたびに新しいキャッシュが生成されることがないようにします。

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code> など) を付加すると便利です。 こうすれば、プレフィックスのバージョン番号を増やしていくだけで、キャッシュ全体を再生成できます。
</div>

###### *例*
{% raw %}```YAML
<br />- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```

{% endraw %}

##### **`restore_cache`**

以前に保存したキャッシュを `key` に基づいて復元します。 あらかじめ [`save_cache` ステップ](#save_cache)を使用して、そのキーでキャッシュを保存しておく必要があります。 詳細については、[キャッシュに関するドキュメント]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。

| キー   | 必須               | 型   | 説明                                                        |
| ---- | ---------------- | --- | --------------------------------------------------------- |
| key  | ○ <sup>(1)</sup> | 文字列 | 復元するキャッシュ キーを 1 つだけ指定します。                                 |
| keys | ○ <sup>(1)</sup> | リスト | 復元するキャッシュを検索するためのキャッシュ キーのリスト。 最初に一致したキーのみが復元されます。        |
| name | ×                | 文字列 | CircleCI の UI に表示されるステップのタイトル (デフォルトは "Restoring Cache")。 |
{: class="table table-striped"}

<sup>(1)</sup> 少なくとも 1 つの属性を指定する必要があります。 `key` と `keys` の両方を指定すると、最初に `key` がチェックされ、次に `keys` がチェックされます。

既存のキーを対象に前方一致で検索が行われます。

**メモ:** 複数が一致する場合は、一致度の高さに関係なく、**一致する最新のもの**が復元されます。

たとえば、以下のようになります。

```YAML
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

上記の例では、最初のキー (`v1-myapp-cache`) が正確に一致していますが、`v1-myapp-cache` との前方一致となる最新のキャッシュ `v1-myapp-cache-new` が復元されます。

キーの書式の詳細については、[`save_cache` ステップ](#save_cache)の `key` に関する説明を参照してください。

`keys` リストが検出されると、既存のキャッシュに最初に一致するキャッシュが復元されます。 通常は、より特定度の高いキー (たとえば、`package-lock.json` ファイルの正確なバージョンに対応するキー) を最初に記述し、より汎用的なキー (たとえば、プロジェクトの任意のキャッシュが対象となるキー) をその後に記述します。 キーに該当するキャッシュが存在しない場合は、警告が表示され、ステップがスキップされます。

キャッシュは元々保存されていた場所に復元されるため、ここでパスは必要ありません。

###### 例
{% raw %}```YAML
<br />- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # `project.clj` の正確なバージョンに対応するキャッシュが存在しない場合は、最新のキャッシュをロードします
      - v1-myapp-

# ... アプリケーションをビルドおよびテストするステップ ...

# `project.clj` のバージョンごとに一度だけキャッシュを保存します

- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```

{% endraw %}

##### **`deploy`**

アーティファクトをデプロイするための特別なステップです。

`deploy` は、[`run`](#run) ステップと同じ構成マップおよび構文を用います。 ジョブに 2 つ以上の `deploy` ステップを記述できます。

通常、以下の 2 つの例外を除いて、`deploy` ステップは `run` と同じように動作します。

- `parallelism` を指定したジョブにおいて、`deploy` ステップは、すべてのノードが成功した場合にノード #0 でのみ実行されます。 #0 以外のノードは、このステップをスキップします。
- SSH を使用して実行するジョブでは、`deploy` ステップは実行されず、代わりに以下のアクションが表示されます。 > **skipping deploy** > Running in SSH mode. Avoid deploying.

`deploy` ステップを使用するときには、ワークフローを使用してジョブのオーケストレーションやトリガーを実行する方法を理解しておくことをお勧めします。 ワークフローの使用方法については、以下を参照してください。

- [ワークフロー](https://circleci.com/docs/2.0/workflows/)
- [`workflows`](https://circleci.com/docs/2.0/configuration-reference/#section=configuration)

###### 例

```YAML
- deploy:
    command: |
      if [ "${CIRCLE_BRANCH}" == "master" ]; then
        ansible-playbook site.yml
      fi
```

**メモ:** `run` ステップでは `run: my command` のようなショートカットを使用できますが、`deploy` ステップで同様に `deploy: my command` のようにショートカットを使用すると、CircleCI から以下のエラー メッセージが出力されます。

`In step 3 definition: This type of step does not support compressed syntax`

##### **`store_artifacts`**

Web アプリまたは API からアクセスできるアーティファクト (ログ、バイナリなど) を格納するステップです。 詳細については、[アーティファクトに関するドキュメント]({{ site.baseurl }}/ja/2.0/artifacts/)を参照してください。

| キー          | 必須 | 型   | 説明                                                                         |
| ----------- | -- | --- | -------------------------------------------------------------------------- |
| path        | ○  | 文字列 | ジョブ アーティファクトとして保存するプライマリ コンテナ内のディレクトリ。                                     |
| destination | ×  | 文字列 | アーティファクト API でアーティファクトの保存先パスに追加するプレフィックス (デフォルトは `path` で指定したファイルのディレクトリ)。 |
{: class="table table-striped"}

1 つのジョブに複数の `store_artifacts` ステップを記述できます。 各ステップで一意のプレフィックスを使用すると、ファイルの上書きを防止できます。

###### 例

```YAML
- run:
    name: Jekyll サイトのビルド
    command: bundle exec jekyll build --source jekyll --destination jekyll/_site/docs/
- store_artifacts:
    path: jekyll/_site/docs/
    destination: circleci-docs
```

##### **`store_test_results`**

ビルドのテスト結果をアップロードおよび保存するための特別なステップです。 テスト結果は、CircleCI Web アプリケーションで各ビルドの「テスト サマリー」セクションに表示されます。 テスト結果を保存すると、テスト スイートのタイミング分析に役立ちます。

テスト結果をビルド アーティファクトとして保存することもできます。その方法については [**store_artifacts** ステップ](#store_artifacts)を参照してください。

| キー   | 必須 | 型   | 説明                                                                                                             |
| ---- | -- | --- | -------------------------------------------------------------------------------------------------------------- |
| path | ○  | 文字列 | JUnit XML または Cucumber JSON のテスト メタデータ ファイルが格納されたサブディレクトリを含むディレクトリへのパス (絶対パス、または `working_directory` からの相対パス)。 |
{: class="table table-striped"}

**メモ:** レポートの名前が CircleCI によって正しく推測されるよう、`store_test_results` パスの**サブディレクトリ**にはなるべく特定のテスト スイートの名前と一致する名前を付けてテスト結果を書き込みます。 レポートをサブディレクトリに書き込まないと、「テスト サマリー」セクションに、たとえば、`Your build ran 71 tests in rspec (ビルドは rspec の 71 のテストを実行しました)` ではなく、`Your build ran 71 tests in unknown (ビルドは不明の 71 のテストを実行しました)` のようなレポートが表示されます。

###### *例*

ディレクトリ構造

    test-results
    ├── jest
    │   └── results.xml
    ├── mocha
    │   └── results.xml
    └── rspec
        └── results.xml


`config.yml` 構文

```YAML
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**

一時ファイルを永続化してワークフロー内の別のジョブで使用できるようにするための特別なステップです。

**メモ:** ワークスペースは、作成後最大 15 日間保存されます。 作成から 15 日以上が経過したワークスペースを使用するジョブは、すべて失敗します。これには、ワークフローの部分的な再実行や SSH による個別ジョブの再実行も含まれます。

| キー    | 必須 | 型   | 説明                                                                                                                 |
| ----- | -- | --- | ------------------------------------------------------------------------------------------------------------------ |
| root  | ○  | 文字列 | 絶対パス、または `working_directory` からの相対パス。                                                                              |
| paths | ○  | リスト | 共有ワークスペースに追加する、グロブで認識されるファイル、またはディレクトリへの非グロブ パス。 ワークスペースのルート ディレクトリへの相対パスと解釈され、 ワークスペースのルート ディレクトリ自体を指定することはできません。 |
{: class="table table-striped"}

root キーは、ワークスペースのルート ディレクトリとなる、コンテナ上のディレクトリを指定します。 paths の値は、すべてルート ディレクトリからの相対的パスです。

##### *root キーの例*

たとえば、以下のステップ構文は、`/tmp/dir` 内にある paths で指定している内容を、ワークスペースの `/tmp/dir` ディレクトリ内に相対パスで永続化します。

```YAML
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

このステップが完了すると、以下のディレクトリがワークスペースに追加されます。

    /tmp/dir/foo/bar
    /tmp/dir/baz


###### *paths キーの例*

```YAML
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

`paths` リストは、Go の `Glob` とパターン マッチ [filepath.Match](https://golang.org/pkg/path/filepath/#Match) を使用します。

    pattern:
        { term }
term:
            '*'         区切り文字を除く任意の文字シーケンスに一致します
            '?'         区切り文字を除く任意の 1 文字に一致します
            '[' [ '^' ] { character-range }
        ']'
                        文字クラス (空白は不可)
            c           文字 c に一致します ('*'、'?'、'\\'、'[' 以外)
            '\\' c      文字 c に一致します
    character-range:
            c           文字 c に一致します ('\\'、'-'、']' 以外)
            '\\' c      文字 c に一致します
            lo '-' hi   lo <= c <= hi の範囲にある文字 c に一致します


Go のドキュメントによると、パターンには `/usr/*/bin/ed` ('/' は区切り文字) などの階層的な名前を記述できます。 **メモ:** すべての要素はワークスペースのルート ディレクトリからの相対パスです。

##### **`attach_workspace`**

ワークフローのワークスペースを現在のコンテナにアタッチするための特別なステップです。 ワークスペースのすべての内容がダウンロードされ、ワークスペースがアタッチされているディレクトリにコピーされます。

| キー | 必須 | 型   | 説明                    |
| -- | -- | --- | --------------------- |
| at | ○  | 文字列 | ワークスペースのアタッチ先のディレクトリ。 |
{: class="table table-striped"}

###### *例*

```YAML
- attach_workspace:
    at: /tmp/workspace
```

各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用します。 ジョブ内では、`persist_to_workspace` ステップを使用してワークスペースにファイルを追加でき、`attach_workspace` ステップを使用してワークスペースの内容をファイル システムにダウンロードできます。 ワークスペースは追加専用です。ジョブは、ワークスペースにファイルを追加することはできますが、ワークスペースからファイルを削除することはできません。 各ジョブでは、そのアップストリームのジョブによってワークスペースに追加された内容を参照することのみ可能です。 ワークスペースをアタッチすると、アップストリーム ジョブがワークフロー グラフに現れる順番で、各アップストリーム ジョブからの「レイヤー」が適用されます。 2 つのジョブが同時に実行される場合、それらのレイヤーが適用される順番は不定になります。 複数の同時ジョブが同じファイル名を永続化する場合、ワークスペースのアタッチはエラーになります。

ワークフローが再実行される場合、それは、元のワークフローと同じワークスペースを継承します。 失敗したジョブのみを再実行する場合、再実行されるジョブは、元のワークフロー内のジョブと同じワークスペースの内容を参照することになります。

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| 型        | 存続期間     | 用途                                                          | 例                                                                                                                                              |
| -------- | -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 数か月      | アーティファクトを長期間保存する。                                           | **[Job (ジョブ)] ページ**の [Artifacts (アーティファクト)] タブから参照できます。`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に格納されています。                     |
| ワークスペース  | ワークフローの間 | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチする。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                          |
| キャッシュ    | 数か月      | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存する。                | `save_cache` ジョブ ステップで、追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定します。 `restore_cache` と適切な `key` を使用してキャッシュを復元します。 |
{: class="table table-striped"}

ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

##### **`add_ssh_keys`**

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

**メモ:** CircleCI は追加されたすべての SSH 鍵に `ssh-agent` を使用して署名しますが、ユーザーは `add_ssh_keys` キーを使用して実際にコンテナに鍵を追加する**必要があります**。

##### `pipeline.` 値の使用

パイプライン値はすべてのパイプライン構成で使用でき、事前の宣言なしに利用できます。 利用可能なパイプライン値は次のとおりです。

| 値                          | 説明                                            |
| -------------------------- | --------------------------------------------- |
| pipeline.id                | パイプラインを表す、グローバルに一意の ID。                       |
| pipeline.number            | パイプラインを表す、プロジェクトで一意の整数の ID。                   |
| pipeline.project.git_url   | https://github.com/circleci/circleci-docs など。 |
| pipeline.project.type      | "github" など。                                  |
| pipeline.git.tag           | パイプラインをトリガーするタグ。                              |
| pipeline.git.branch        | パイプラインをトリガーするブランチ。                            |
| pipeline.git.revision      | 現在の git リビジョン。                                |
| pipeline.git.base_revision | 以前の git リビジョン。                                |
{: class="table table-striped"}

たとえば、以下のようになります。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/node:latest
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

## **`workflows`**

すべてのジョブのオーケストレーションに使用します。 各ワークフローは、キーとなるワークフロー名と、値となるマップで構成します。 名前は、その `config.yml` 内で一意である必要があります。 ワークフロー構成の最上位のキーは `version` と `jobs` です。

### **`version`**

ワークフローの `version` フィールドは、非推奨またはベータ版での互換性を損なう変更について注意を促すために記述します。

| キー      | 必須 | 型   | 説明                    |
| ------- | -- | --- | --------------------- |
| version | ○  | 文字列 | 現在は `2` を指定する必要があります。 |
{: class="table table-striped"}

### **<`workflow_name`>**

ワークフローに付与する一意の名前です。

#### **`triggers`**

ワークフローを実行するトリガーを指定します。 デフォルトの動作では、ブランチにプッシュされたときにワークフローがトリガーされます。

| キー       | 必須 | 型  | 説明                           |
| -------- | -- | -- | ---------------------------- |
| triggers | ×  | 配列 | 現在は `schedule` を指定する必要があります。 |
{: class="table table-striped"}

##### **`schedule`**

ワークフローに `schedule` を記述し、それを特定の時刻に実行するよう (たとえば、毎日 UTC 午前 0 時に夜間ビルドを実行するなど) 指示できます。

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


###### **`cron`**

`cron` キーは、POSIX の `crontab` 構文で定義します。

| キー   | 必須 | 型   | 説明                                                                                            |
| ---- | -- | --- | --------------------------------------------------------------------------------------------- |
| cron | ○  | 文字列 | [crontab のマニュアル ページ](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html)を参照してください。 |
{: class="table table-striped"}

###### **`filters`**

フィルターでは、`branches` キーを使用できます。

| キー      | 必須 | 型   | 説明                |
| ------- | -- | --- | ----------------- |
| filters | ○  | マップ | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

###### **`branches`**
{:.no_toc}

`branches` キーは、*現在の*ブランチについて、スケジュール実行すべきかどうかを制御します。この「*現在の*ブランチ」とは、`trigger` スタンザがある `config.yml` ファイルを含むブランチです。 つまり、`master` ブランチでのプッシュは、`master` ブランチでの[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#ワークフローにおけるコンテキストとフィルターの使用)のみをスケジュールします。

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

ジョブでは、`requires`、`context`、`type`、`filters` の各キーを使用できます。

| キー   | 必須 | 型   | 説明                   |
| ---- | -- | --- | -------------------- |
| jobs | ○  | リスト | 依存関係に従って実行するジョブのリスト。 |
{: class="table table-striped"}

##### **<`job_name`>**

`config.yml` 内に存在するジョブの名前を記述します。

###### **`requires`**

ジョブはデフォルトで並列に実行されるため、依存関係がある場合は、ジョブ名に基づいて明示的に要求する必要があります。

| キー       | 必須 | 型   | 説明                                                                                     |
| -------- | -- | --- | -------------------------------------------------------------------------------------- |
| requires | ×  | リスト | そのジョブを開始するために成功する必要があるジョブのリスト。                                                         |
| name     | ×  | 文字列 | ジョブ名の代替名。 ジョブを複数回呼び出す場合に便利です。 同じジョブを複数回呼び出したいときや、あるジョブで同じ内容のジョブが必要なときなどに有効です (2.1 のみ)。 |
{: class="table table-striped"}

###### **`context`**

ジョブは、組織に設定されたグローバル環境変数を使用するように構成できます。アプリケーション設定にコンテキストを追加するには、[コンテキストに関するドキュメント]({{ site.baseurl }}/ja/2.0/contexts)を参照してください。

| キー      | 必須 | 型   | 説明                                                            |
| ------- | -- | --- | ------------------------------------------------------------- |
| context | ×  | 文字列・リスト | コンテキストの名前。 初期のデフォルト名は `org-global` です。 各コンテキスト名は一意である必要があります。 |
{: class="table table-striped"}

###### **`type`**

ジョブで `approval` という `type` を使用できます。これは、ダウンストリーム ジョブに進む前に手動で承認を行う必要があることを示します。 ワークフローが `type: approval` キーを持つジョブと、そのジョブが依存するジョブを処理するまでは、依存関係の順序でジョブが実行されます。以下に例を示します。

          - hold:
              type: approval
              requires:
                - test1
                - test2
          - deploy:
              requires:
                - hold


**メモ:** このジョブ名 `hold` がメインの構成に存在してはなりません。

###### **`filters`**

フィルターでは、`branches` キーまたは `tags` キーを使用できます。 **メモ:** ワークフローは、ジョブレベルのブランチを無視します。 ジョブ レベルでブランチを指定していて、後で `config.yml` にワークフローを追加する場合は、ジョブ レベルのブランチを削除し、代わりにそれをワークフロー セクションで宣言する必要があります。

| キー      | 必須 | 型   | 説明                |
| ------- | -- | --- | ----------------- |
| filters | ×  | マップ | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

###### **`branches`**
{:.no_toc}

 Branches では、`only` キーと `ignore` キーを使用でき、どちらにもブランチ名を指す 1 つの文字列をマップさせます。 スラッシュで囲むことで正規表現でブランチに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | 型              | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ×  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

###### **`tags`**
{:.no_toc}
CircleCI では、明示的にタグ フィルターを設定しない限り、タグに対してワークフローは実行されません。 さらに、ジョブが (直接的または間接的に) 他のジョブを必要とする場合は、それらのジョブにタグ フィルターを指定する必要があります。

タグでは、`only` キーと `ignore` キーを使用できます。 スラッシュで囲むことで正規表現でタグに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。 軽量のタグと注釈付きのタグがサポートされています。

- `only` を指定した場合、一致するタグの場合にジョブが実行されます。
- `ignore` を指定した場合、一致するタグの場合にはジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合は、すべてのタグでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー     | 必須 | 型              | 説明                 |
| ------ | -- | -------------- | ------------------ |
| tags   | ×  | マップ            | 実行するタグを定義するマップ。    |
| only   | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
| ignore | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
{: class="table table-striped"}

詳細については、ワークフローに関するドキュメントの「[Git タグに対応するワークフローを実行する]({{ site.baseurl }}/ja/2.0/workflows/#git-タグに対応するワークフローを実行する)」を参照してください。

##### **ワークフローでの `when` の使用**

CircleCI 設定ファイル v2.1 では、ワークフロー宣言内で真偽値を取る `when` 句を使用して (逆の条件となる `unless` 句も使用可)、そのワークフローを実行するかどうかを決めることができます。 最も一般的な `when` の用途は、パラメーターを使用した CircleCI API v2 パイプラインのトリガーです。

以下の構成例では、パイプライン パラメーター `run_integration_tests` を使用して `integration_tests` ワークフローの実行を制御しています。

```yaml
version: 2.1

parameters:
  run_integration_tests:
    type: boolean
    default: false

workflows:
  version: 2
  integration_tests:
    when: << pipeline.parameters.run_integration_tests >>
    jobs:

      - mytestjob

jobs:
...
```

この例では、`POST` 本体に以下が含まれた状態でパイプラインがトリガーされたときに、テストが明示的に呼び出されない限りは `integration_tests` ワークフローは実行されないようにしています。

    {
        "parameters": {
            "run_integration_tests": true
        }
    }


いくつかの例と概念的な情報については、[ワークフローに関するドキュメント]({{ site.baseurl }}/ja/2.0/workflows)を参照してください。

## サンプル コード
{:.no_toc}


{% raw %}```yaml
version: 2
jobs:
  build:
    docker:

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

  deploy-stage:
    docker:

      - image: ubuntu:14.04
    working_directory: /tmp/my-project
    steps:
      - run:
          name: テストに合格し、ブランチがステージングならデプロイ
          command: ansible-playbook site.yml -i staging

  deploy-prod:
    docker:

      - image: ubuntu:14.04
    working_directory: /tmp/my-project
    steps:
      - run:
          name: テストに合格し、ブランチが master ならデプロイ
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
{:.no_toc}

[設定ファイルの概要]({{site.baseurl}}/ja/2.0/config-intro/)
