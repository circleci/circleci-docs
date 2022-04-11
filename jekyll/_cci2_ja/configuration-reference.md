---
layout: classic-docs
title: CircleCI の設定
short-title: CircleCI の設定
description: .circleci/config.yml に関するリファレンス
order: 20
readtime: false
version:
  - クラウド
  - Server v3.x
  - Server v2.x
suggested:
  - 
    title: 6 つの構成オプション
    link: https://circleci.com/ja/blog/six-optimization-tips-for-your-config/
  - 
    title: ダイナミック コンフィグの紹介
    link: https://discuss.circleci.com/t/intro-to-dynamic-config-via-setup-workflows/39868
  - 
    title: ダイナミック コンフィグの使用
    link: https://circleci.com/ja/blog/building-cicd-pipelines-using-dynamic-config/
  - 
    title: ローカル CLI を使用した設定のバリデーション
    link: https://support.circleci.com/hc/ja/articles/360006735753?input_string=configuration+error
  - 
    title: ジョブをトリガーする方法
    link: https://support.circleci.com/hc/en-us/articles/360041503393?input_string=changes+in+v2+api
  - 
    title: ジョブの最大実行時間の更新について
    link: https://support.circleci.com/hc/ja/articles/4411086979867
    isExperiment: true
  - 
    title: アカウントのパーミッションの更新について
    isExperiment: true
    link: https://support.circleci.com/hc/ja/articles/360048210711
---

このドキュメントは、`.circleci/config.yml` ファイルで使用される CircleCI 2.x 設定キーのリファレンスガイドです。

`config.yml` の全体は「[サンプルコード](#サンプル-コード)」で確認できます。

---

* 目次
{:toc}


## **`setup`**
{: #setup }

| キー    | 必須 | タイプ   | 説明                                                                                  |
| ----- | -- | ----- | ----------------------------------------------------------------------------------- |
| setup | ×  | ブール値型 | config.yaml で[ダイナミック コンフィグ]({{ site.baseurl }}/ja/2.0/dynamic-config/)機能を使用するように指定します。 |
{: class="table table-striped"}

`setup` フィールドを指定すると、プライマリ .circleci 親ディレクトリ外部にある設定ファイルのトリガー、パイプライン パラメーターの更新、およびカスタマイズされた設定ファイルの生成を、条件に従って実行できます。

## **`version`**
{: #version }

| キー      | 必須 | タイプ  | 説明                                                                                                                                                                           |
| ------- | -- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version | ○  | 文字列型 | `2`、`2.0`、または `2.1`。`.circleci/config.yml` ファイルの簡素化、再利用、パラメータ化ジョブの利用に役立つバージョン 2.1 の新しいキーの概要については、[設定ファイルの再利用に関するドキュメント]({{ site.baseurl }}/ja/2.0/reusing-config/)を参照してください。 |
{: class="table table-striped"}

`version` フィールドは、将来的にサポートの終了や 破壊的変更に対して警告するかどうかの判断に用いられます。

## **`orbs`** (version: 2.1 が必須)
{: #orbs-requires-version-21 }

| キー        | 必須 | 型   | 説明                                                                                                                                                                         |
| --------- | -- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orbs      | ×  | マップ | ユーザーが選択した名前から Orb 参照 (文字列) または Orb 定義 (マップ) へのマップ。 Orb 定義は、2.1 設定ファイルの Orb 関連サブセットである必要があります。 詳細については、[Orb の作成に関するドキュメント]({{ site.baseurl }}/ja/2.0/creating-orbs/)を参照してください。 |
| executors | ×  | マップ | Executor 定義への文字列のマップ。 後述の [executors]({{ site.baseurl }}/ja/2.0/configuration-reference/#executors-requires-version-21) セクションも参照してください。                                    |
| commands  | ×  | マップ | コマンドを定義するコマンド名のマップ。 下記 [commands]({{ site.baseurl }}/ja/2.0/configuration-reference/#commands-requires-version-21) のセクションを参照してください。                                        |
{: class="table table-striped"}

以下の例は、承認済みの `circleci` 名前空間に置かれた `hello-build` という名前の Orb を呼び出します。

```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
`circleci/hello-build@0.0.5` がそもそもの Orb の参照先ですが、この例では `hello` がその Orb の参照名となります。 Orb の詳細については[こちら](https://circleci.com/ja/orbs/)を参照してください。

## **`commands`** (version: 2.1 が必須)
{: #commands-requires-version-21 }

commands では、ジョブ内で実行する一連のステップをマップとして定義します。これにより、複数のジョブで [1 つのコマンド定義を再利用]({{ site.baseurl }}/ja/2.0/reusing-config/)できます。

| キー          | 必須 | タイプ   | 説明                                                                                                                                                               |
| ----------- | -- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| steps       | ○  | シーケンス | コマンドの呼び出し元のジョブ内で実行される一連のステップ。                                                                                                                                    |
| parameters  | ×  | マップ   | パラメーター キーのマップ。 詳細は「[コンフィグを再利用する]({{ site.baseurl }}/ja/2.0/reusing-config/)」内の「[パラメーター構文]({{ site.baseurl }}/ja/2.0/reusing-config/#parameter-syntax)」を参照してください。 |
| description | ×  | 文字列型  | コマンドの目的を記述する文字列。                                                                                                                                                 |
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
{: #parameters-requires-version-21 }
設定ファイル内で使用するパイプライン パラメーターを定義します。 使用方法の詳細については、[パイプライン変数に関するドキュメント]({{ site.baseurl }}/ja/2.0/pipeline-variables#pipeline-marameters-in-configuration)を参照してください。

| キー         | 必須 | タイプ | 説明                                                                                                                            |
| ---------- | -- | --- | ----------------------------------------------------------------------------------------------------------------------------- |
| parameters | ×  | マップ | パラメーター キーのマップ。 `文字列`、`ブール値`、`整数`、`列挙型`がサポートされています。 [パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#パラメーターの構文)を参照してください。 |
{: class="table table-striped"}

## **`executors`** (version: 2.1 が必須)
{: #executors-requires-version-21 }

Executors は、ジョブステップの実行環境を定義するものです。executor を 1 つ定義するだけで複数のジョブで再利用できます。

| キー                | 必須               | 型    | 説明                                                                                                                                 |
| ----------------- | ---------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト  | [docker Executor](#docker) 用のオプション。                                                                                                |
| resource_class    | ×                | 文字列型 | ジョブ内の各コンテナに割り当てられる CPU と RAM の量                                                                                                    |
| machine           | ○ <sup>(1)</sup> | マップ  | [machine Executor](#machine) 用のオプション。                                                                                              |
| macos             | ○ <sup>(1)</sup> | マップ  | [macOS Executor](#macos) 用のオプション。                                                                                                  |
| windows           | ○ <sup>(1)</sup> | マップ  | 現在、[Windows Executor](#windows) は Orb に対応しています。 [こちらの Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) を参照してください。 |
| shell             | ×                | 文字列型 | すべてのステップで実行コマンドに使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                 |
| working_directory | ×                | 文字列型 | ステップを実行するディレクトリ。 絶対パスとして解釈されます。                                                                                                    |
| environment:      | ×                | マップ  | 環境変数の名前と値のマップです。                                                                                                                   |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

例

```yaml
version: 2.1
executors:
  my-executor:
    docker:
      - image: cimg/ruby:3.0.3-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor
```

パラメーター付き Executor の例は「[コンフィグを再利用する]({{ site.baseurl }}/ja/2.0/reusing-config/)」の「[Executor でパラメーターを使う](https://circleci.com/docs/ja/2.0/reusing-config/#using-parameters-in-executors)」をご覧ください。

## **`jobs`**
{: #jobs }

ワークフローは 1 つ以上の一意の名前付きジョブで構成し、 それらのジョブは `jobs` マップで指定します。[2.0 config.yml のサンプル]({{ site.baseurl }}/ja/2.0/sample-config/)で `jobs` マップの例を 2 つ紹介しています。 マップにおけるキーがジョブの名前となり、値はジョブの中身を記述するマップとします。

**注:** ジョブの最大実行時間は、Free プランは 1 時間、Performance プランは 3 時間、Scale プランは 5 時間となります。 ジョブがタイムアウトする場合は、より大きな[リソースクラス]({{site.baseurl}}/ja/2.0/configuration-reference/#resourceclass)の使用や、[並列実行]({{site.baseurl}}/ja/2.0/parallelism-faster-jobs)を検討してください。  また、料金プランのアップグレードや、[ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)を利用した複数ジョブの同時実行も可能です。

### **<`job_name`>**
{:job-name}

1 つ 1 つのジョブはそれぞれ名前となるキーと、値となるマップからなります。 名前は、その `jobs` リスト内で一意である必要があります。 値となるマップでは下記の属性を使用できます。

| キー                | 必須               | タイプ  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ---------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker            | ○ <sup>(1)</sup> | リスト  | [docker Executor](#docker) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                     |
| machine           | ○ <sup>(1)</sup> | マップ  | [machine Executor](#machine) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                   |
| macos             | ○ <sup>(1)</sup> | マップ  | [macOS Executor](#macos) 用のオプション。                                                                                                                                                                                                                                                                                                                                                                                                       |
| shell             | ×                | 文字列型 | すべてのステップで実行コマンドに使用するシェル。 各ステップ内の `shell` でオーバーライドできます (デフォルト設定については、[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照してください)。                                                                                                                                                                                                                                                                                                                      |
| parameters        | ×                | マップ  | `ワークフロー`において `job` を明示的に構成可能にする[パラメーター](#parameters)。                                                                                                                                                                                                                                                                                                                                                                                   |
| steps             | ○                | リスト  | 実行する[ステップ](#steps)のリスト。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| working_directory | ×                | 文字列型 | ステップを実行するディレクトリ。 絶対パスとして解釈されます。 デフォルトは `~/project` となります（この `project` は文字列リテラルで、特定のプロジェクト名ではありません）。 ジョブ内の実行プロセスは、このディレクトリを参照するために環境変数 `$CIRCLE_WORKING_DIRECTORY` を使えます。 **注:** YAML 設定ファイルに記述したパスは展開_されません_。`store_test_results.path` を `$CIRCLE_WORKING_DIRECTORY/tests` と設定しても、CircleCI は文字どおり "`$CIRCLE_WORKING_DIRECTORY`" という、`$` 記号を含む名前のディレクトリ内に、サブディレクトリ `test` を格納しようとします。 `working_directory` で指定したディレクトリが存在しないときは自動で作成されます。 |
| parallelism       | ×                | 整数型  | このジョブを実行する並列インスタンスの数 (デフォルトは 1)。                                                                                                                                                                                                                                                                                                                                                                                                        |
| environment:      | ×                | マップ  | 環境変数の名前と値のマップです。                                                                                                                                                                                                                                                                                                                                                                                                                        |
| branches          | ×                | マップ  | ワークフローまたはバージョン 2.1 の設定ファイル**以外**の構成に含まれる 1 つのジョブに対し、特定のブランチでの実行を許可またはブロックするルールを定義するマップ (デフォルトではすべてのブランチでの実行が許可されます)。 Workflows やバージョン 2.1 のコンフィグにおけるジョブやブランチに関する設定については [Workflows](#workflows) を参照してください。                                                                                                                                                                                                                              |
| resource_class    | ×                | 文字列型 | ジョブ内の各コンテナに割り当てられる CPU と RAM の量                                                                                                                                                                                                                                                                                                                                                                                                         |
{: class="table table-striped"}

<sup>(1)</sup> 各ジョブにいずれか 1 つの Executor タイプを指定する必要があります。 2 つ以上指定するとエラーが発生します。

#### `environment`
{: #environment }
環境変数の名前と値のマップです。 CircleCI の設定画面でセットした環境変数を上書きするのに使えます。


#### `parallelism`
{: #parallelism }

`parallelism` を 2 以上に設定すると、設定した数の Executor がそれぞれセットアップされ、そのジョブのステップを並列に実行します。 これにより、テストステップを最適化できます。CircleCI CLI を使用して並列コンテナにテストスイートを分割すると、ジョブの実行時間を短縮できます。 ただし、並列実行をするように設定していても 1 つの Executor でしか実行されない場合もあります。 詳しくは[パラレルジョブ]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を参照してください。

例

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
`parameters` は、[この`ジョブ`を`ワークフロー`で呼び出す](#jobs-in-workflow)ときに使用できます。

予約されているパラメーター名は以下のとおりです。

* `name`
* `requires`
* `context`
* `type`
* `filters`
* `matrix`
<!-- Others? -->
<!-- branches & type pass `circleci config validate`. Strange -->

詳細については、「[パラメーターの構文]({{ site.baseurl }}/ja/2.0/reusing-config/#parameter-syntax)」<!-- この参照先では、job-parameters に許可されている型については触れていません。-->を参照してください。


#### **`docker`**/**`machine`**/**`macos`**/**`windows`** (_Executor_)
{: #docker-machine-macos-windows-executor }

「Executor」は、端的に言えば「ステップを処理する場所」です。 CircleCI では Executor として一度に必要な分の Docker コンテナを起動するか、仮想マシンを利用することで、最適な環境を構築できます。 詳しくは「[Executor タイプの選び方]({{ site.baseurl}}/ja/2.0/executor-types/)」を参照してください。

#### `docker`
{: #docker }
{:.no_toc}

`docker` キーは下記の要素を用いて設定します。

| キー           | 必須 | タイプ       | 説明                                                              |
| ------------ | -- | --------- | --------------------------------------------------------------- |
| image        | ○  | 文字列型      | 使用するカスタム Docker イメージの名前。                                        |
| name         | ×  | 文字列型      | 他から参照するためのコンテナの名前。  デフォルトでは、`localhost` を通してコンテナ サービスにアクセスできます。 |
| entrypoint   | ×  | 文字列またはリスト | コンテナのローンチ時に実行するコマンド。                                            |
| command      | ×  | 文字列またはリスト | コンテナのローンチ時にルート プロセスとなる PID 1 として使用するコマンド (または entrypoint の引数)。  |
| user         | ×  | 文字列型      | Docker コンテナ内でコマンドを実行するユーザー。                                     |
| environment: | ×  | マップ       | 環境変数の名前と値のマップ。                                                  |
| auth         | ×  | マップ       | 標準の `docker login` 認証情報を用いたレジストリの認証情報。                          |
| aws_auth     | ×  | マップ       | AWS Elastic Container Registry (ECR) の認証情報。                     |
{: class="table table-striped"}

ジョブで最初に記述した `image` は、すべてのステップを実行するプライマリコンテナとなります。

`entrypoint` は、イメージの `ENTRYPOINT` をオーバーライドします。

ファイル内で最初に記述する `image` が、すべてのステップを実行するプライマリ コンテナ イメージとなります。

[プライマリ コンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container) (リストの最初にあるコンテナ) については、設定ファイルで `command` も `entrypoint` も指定されていない場合、イメージ内のすべての `ENTRYPOINT` と `CMD` が無視されます。 というのも、プライマリ コンテナは通常 `steps` の実行のみに使用されるもので `ENTRYPOINT` 用ではなく、`ENTRYPOINT` は大量のリソースを消費したり、予期せず終了したりする可能性があるためです ([カスタム イメージはこの挙動を無効にし、`ENTRYPOINT` を強制的に実行する場合があります]({{ site.baseurl }}/ja/2.0/custom-images/#adding-an-entrypoint))。 ジョブの `steps` はプライマリ コンテナでのみ実行されます。

`name` では、セカンダリサービスコンテナにアクセスする際の名前を定義します。   デフォルトはどのサービスも `localhost` 上で直接見える状態になっています。  これは、例えば同じサービスのバージョン違いを複数立ち上げるときなど、localhost とは別のホスト名を使いたい場合に役立ちます。

`environment` 設定は、ジョブ ステップではなく Docker コンテナによって実行される ENTRYPOINT と CMD に適用されます。

タグやハッシュ値でイメージのバージョンを指定することもできます。 公式の Docker レジストリ（デフォルトは Docker Hub）のパブリックイメージはどんなものでも自由に使えます。 詳しくは 「[Executor タイプ]({{ site.baseurl }}/ja/2.0/executor-types)」を参照してください。

Docker Hub など、一部のレジストリでは、匿名ユーザーによる Docker のプル回数に上限が設定されている場合があります。  こうした場合にプライベート イメージとパブリック イメージをプルするには、認証を行うことをお勧めします。 ユーザー名とパスワードは `auth` フィールドで指定できます。  詳細については、「[Docker の認証付きプルの使用]({{ site.baseurl }}/ja/2.0/private-images/)」を参照してください。

例

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

[AWS ECR](https://aws.amazon.com/ecr/) にホストしているイメージを使うには AWS 認証情報での認証が必要です。 デフォルトでは、CircleCI はプロジェクト環境変数で指定した `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を AWS 認証情報に使用します。 下記のように [`aws_auth` フィールド]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker-machine-macos-windows-executor)を用いて認証情報をセットすることも可能です。

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
      - image: cimg/node:17.2.0
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

[machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) は `machine` キーとともに下記の要素を用いて設定します。

| キー                     | 必須 | 種類    | 説明                                                                                                                                                                                                                                            |
| ---------------------- | -- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| image                  | ○  | 文字列型  | 使用する VM イメージ。 [使用可能なイメージ](#使用可能な-machine-イメージ)を参照してください。 **注:** このキーは、オンプレミス環境では**サポートされません**。 ユーザーのサーバーにインストールされた CircleCI 上の `machine` Executor イメージをカスタマイズする方法については、\[VM サービスに関するドキュメントを参照してください\] ({{ site.baseurl }}/ja/2.0/vm-service)。 |
| docker_layer_caching | ×  | ブール値型 | `true` に設定すると、[Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)が有効になります。                                                                                                                                                       |
{: class="table table-striped"}


例

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

**設定ファイルでイメージを指定することを強くおすすめします。**CircleCI は、`image` フィールドで指定可能なマシン イメージを複数サポートしています。 イメージの一覧は、developer hub の [Ubuntu 20.04 ページ](https://circleci.com/developer/ja/machine/image/ubuntu-2004)で確認できます。 最新の利用可能なイメージの一覧については、[Discuss](https://discuss.circleci.com/t/linux-machine-executor-images-october-q4-update/37847) を参照してください。

* `ubuntu-2004:202111-02` - Ubuntu 20.04, Docker v20.10.11, Docker Compose v1.29.2, log4j updates
* `ubuntu-2004:202111-01` - Ubuntu 20.04, Docker v20.10.11, Docker Compose v1.29.2,
* `ubuntu-2004:202107-02` - Ubuntu 20.04, Docker v20.10.7, Docker Compose v1.29.2,
* `ubuntu-2004:202104-01` - Ubuntu 20.04、Docker v20.10.6、Docker Compose v1.29.1
* `ubuntu-2004:202101-01` - Ubuntu 20.04、Docker v20.10.2、Docker Compose v1.28.2
* `ubuntu-2004:202010-01` - Ubuntu 20.04、Docker v19.03.13、Docker Compose v1.27.4 (`ubuntu-2004:202008-01` はエイリアス)

* `ubuntu-1604:202104-01` - Ubuntu 16.04、Docker v19.03.15、Docker Compose v1.29.1 (最終版のリリース)
* `ubuntu-1604:202101-01` - Ubuntu 16.04、Docker v19.03.14、Docker Compose v1.28.2 (最新版の 1 つ前のリリース)
* `ubuntu-1604:202010-01` - Ubuntu 16.04、Docker v19.03.13、Docker Compose v1.27.4
* `ubuntu-1604:202007-01` - Ubuntu 16.04、Docker v19.03.12、Docker Compose v1.26.1
* `ubuntu-1604:202004-01` - Ubuntu 16.04、Docker v19.03.8、Docker Compose v1.25.5
* `ubuntu-1604:201903-01` - Ubuntu 16.04、Docker v18.09.3、Docker Compose v1.23.1

***注:*** *Ubuntu 16.04 LTS は 2021 年 4 月にサポート期間が終了し、Canonical によるサポートが終了します。 その結果、`ubuntu-1604:202104-01`が CircleCI がリリースする最後の Ubuntu 16.04 イメージとなります。*

Ubuntu 14.04 および 16.04 マシンイメージはすでにサポートが終了し、[2022 年 5 月 31 日に提供を終了します。](https://circleci.com/blog/ubuntu-14-16-image-deprecation/) この 2 つのイメージは、2022 年の 3 月 29 日と 4 月 26 日に、提供を一時的に中断します。 [14.04]({{ site.baseurl }}/ja/2.0/images/linux-vm/14.04-to-20.04-migration/) および [16.04]({{ site.baseurl }}/ja/2.0/images/linux-vm/16.04-to-20.04-migration/) イメージからの移行をお願いいたします。
{: class="alert alert-warning"}

machine Executor は、ジョブまたはワークフローで Docker イメージをビルドするときに便利な [Docker レイヤー キャッシュ](https://circleci.com/docs/ja/2.0/managing-api-tokens/)をサポートします。

##### 使用可能な Linux GPU イメージ
{: #available-linux-gpu-images }

[Linux GPU Executor](#gpu-executor-linux) では、次のイメージが使用可能です。

* `ubuntu-2004-cuda-11.4:202110-01` - CUDA v11.4.2, Docker v20.10.7, nvidia-container-toolkit v1.5.1-1
* `ubuntu-2004-cuda-11.2:202103-01` - CUDA v11.2.1, Docker v20.10.5, nvidia-container-toolkit v1.4.2-1
* `ubuntu-1604-cuda-11.1:202012-01` - CUDA v11.1、Docker v19.03.13、nvidia-container-toolkit v1.4.0-1
* `ubuntu-1604-cuda-10.2:202012-01` - CUDA v10.2、Docker v19.03.13、nvidia-container-toolkit v1.3.0-1
* `ubuntu-1604-cuda-10.1:201909-23` - CUDA v10.1、Docker v19.03.0-ce、nvidia-docker v2.2.2
* `ubuntu-1604-cuda-9.2:201909-23` - CUDA v9.2、Docker v19.03.0-ce、nvidia-docker v2.2.2

##### 使用可能な Windows GPU イメージ
{: #available-windows-gpu-image }

[Windows GPU Executor](#gpu-executor-windows) では、次のイメージが使用可能です。

* `windows-server-2019-nvidia:stable` - Windows Server 2019、CUDA 10.1。 このイメージはデフォルトです。

**例**

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: windows-server-2019-nvidia:stable
```

#### **`macos`**
{: #macos }
{:.no_toc}

CircleCI は [macOS](https://developer.apple.com/macos/) 上でのジョブ実行をサポートしています。macOS アプリケーションや [iOS](https://developer.apple.com/ios/) アプリ、[tvOS](https://developer.apple.com/tvos/) アプリ、さらには [watchOS](https://developer.apple.com/watchos/) アプリのビルド、テスト、デプロイが可能です。 macOS 仮想マシン上でジョブを実行するには、ジョブ設定の最上位に `macos` キーを追加し、使いたい Xcode のバージョンを指定します。

| キー    | 必須 | タイプ  | 説明                                                                                                                                               |
| ----- | -- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| xcode | ○  | 文字列型 | 仮想マシンにインストールする Xcode のバージョン。iOS でのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」を参照してください。 |
{: class="table table-striped"}

**例:** macOS 仮想マシンを Xcode バージョン 12.5.1 で使用する場合


```yaml
jobs:
  build:
    macos:
      xcode: "12.5.1"
```

#### **`windows`**
{: #windows }
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

#### **`branches` – 廃止予定**
{: #branches-deprecated }

**このキーは廃止されます。 [ワークフローのフィルタリング](#jobfilters)機能を使用して、どのジョブがどのブランチに対して実行されるかを制御することができます。**

ワークフローを**設定せず**、バージョン 2.1 ではなく 2.0 の設定ファイルを使用している場合は、一部のブランチの実行を許可またはブロックするルールを定義できます。 [ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#using-contexts-and-filtering-in-your-workflows)を使用している場合、ジョブレベルのブランチは無視されるため、`config.yml` ファイルの workflows セクションで設定する必要があります。 バージョン 2.1 の設定では、ワークフローを追加することでフィルタリングが可能です。 詳しくは後述の [ワークフロー](#workflows) を参照してください。 ジョブレベルの `branches` キーは下記の要素を用いて設定します。

| キー     | 必須 | タイプ | 説明              |
| ------ | -- | --- | --------------- |
| only   | ×  | リスト | 実行するブランチのみのリスト。 |
| ignore | ×  | リスト | 無視するブランチのリスト。   |
{: class="table table-striped"}

`only` や `ignore` に記述する内容は、完全一致のフルネームおよび正規表現で表すことができます。 正規表現は、文字列**全体**に一致する必要があります。 例えば下記のようにします。

```yml
jobs:
  build:
    branches:
      only:
        - main
        - /rc-.*/
```

この場合は、"main" ブランチと、正規表現 "rc-.*" に一致するブランチのみが実行されます。

```yml
jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

上記の例では「develop」と正規表現「feature-.*」にマッチしたもの以外のすべてのブランチが実行されます。

`ignore` と `only` の両方が同時に指定されていた場合は、`ignore` に関するフィルターのみが考慮されます。

コンフィグのルール設定によって実行されなかったジョブは、実行がスキップされたとして CircleCI の画面上に履歴表示されます。

**すべての**ブランチで確実にジョブを実行するには、`branches` キーを使用しないか、`only` キーに正規表現 `/.*/` を指定してすべてのブランチを対象にします。

#### **`resource_class`**
{: #resourceclass }

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 下表に示すように、Executor ごとにさまざまなリソース クラスが提供されています。

CircleCI では、すべてのお客様がシステムを安定した状態で利用できるよう、リソースクラスごとに同時実行数のソフト制限を設けています。 Performance プランまたは Custom プランを使用していて、特定のリソース クラスで待機時間が発生している場合は、このソフト制限に達している可能性があります。 [CircleCI サポート](https://support.circleci.com/hc/ja/requests/new) にお客様のアカウントの制限値引き上げを依頼してください。

**注:** 2021 年 9 月 1 日以降に作成され、リソースクラスが指定されていない新しいプロジェクトに対しては、 お客様の組織に適したデフォルト値を決定します。 デフォルトの使用を避けるには、各ジョブの設定でリソースクラスサイズを明示的に指定してください。

**CircleCI Server をオンプレミスでホスティングしている場合は、利用可能なリソースクラスについてシステム管理者に問い合わせてください**。 詳細については、サーバーの管理に関するドキュメントの[Nomad クライアントのシステム要件]({{ site.baseurl }}/ja/2.0/server-ports/#nomad-clients)と[サーバーのリソースクラス]({{ site.baseurl }}/ja/2.0/customizations/#resource-classes)のセクションを参照してください。

##### Docker Executor
{: #docker-executor }

| クラス                    | vCPU | RAM   |
| ---------------------- | ---- | ----- |
| small                  | 1    | 2 GB  |
| medium                 | 2    | 4 GB  |
| medium+                | 3    | 6 GB  |
| large                  | 4    | 8 GB  |
| xlarge                 | 8    | 16 GB |
| 2xlarge<sup>(2)</sup>  | 16   | 32 GB |
| 2xlarge+<sup>(2)</sup> | 20   | 40 GB |
{: class="table table-striped"}

###### 例
{: #example-usage }
{:.no_toc}

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    resource_class: xlarge
    steps:
      ... // other config
```

`resource_class` を使用して[ランナー インスタンス](https://circleci.com/docs/ja/2.0/runner-overview/#referencing-your-runner-on-a-job)を構成することもできます。

たとえば、以下のように記述します。

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### Machine Executor (Linux)
{: #machine-executor-linux }

{% include snippets/ja/machine-resource-table.md %}

###### 例
{: #example-usage }
{:.no_toc}

```yaml
jobs:
  build:
    machine:
      image: ubuntu-2004:202010-01 # 推奨 Linux イメージ
    resource_class: large
    steps:
      ... // 他の構成
```

`machine` クラスを使用して[ランナー インスタンス](https://circleci.com/docs/ja/2.0/runner-overview/#referencing-your-runner-on-a-job)を設定することも可能です。

例えば下記のようにします。

```yaml
jobs:
  job_name:
    machine: true
    resource_class: my-namespace/my-runner
```

##### macOS Executor
{: #macos-executor }

| クラス                                | vCPU         | RAM   |
| ---------------------------------- | ------------ | ----- |
| medium (デフォルト)                     | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2              | 4 @ 3.2 GHz  | 8 GB  |
| large<sup>(3)</sup>                | 8 @ 2.7 GHz  | 16 GB |
| macos.x86.metal.gen1<sup>(4)</sup> | 12 @ 3.2 GHz | 32 GB |
{: class="table table-striped"}

###### 例
{: #example-usage }
{:.no_toc}

```yaml
jobs:
  build:
    macos:
      xcode: "12.5.1"
    resource_class: large
    steps:
      ... // その他の設定
```

##### Windows Executor
{: #windows-executor }

| クラス            | vCPU | RAM    |
| -------------- | ---- | ------ |
| medium (デフォルト) | 4    | 15 GB  |
| large          | 8    | 30 GB  |
| xlarge         | 16   | 60 GB  |
| 2xlarge        | 32   | 128 GB |
{: class="table table-striped"}

###### 例
{: #example-usage }
{:.no_toc}

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

Executor が Windows Orb 内で定義されているため、`windows` ではリソース クラスの設定方法が異なっていることに注意してください。

Windows Executor の詳細と例については、[Windows に関する入門ガイド]({{ site.baseurl }}/ja/2.0/hello-world-windows/) を参照してください。

##### GPU Executor (Linux)
{: #gpu-executor-linux }

| クラス                             | vCPU | RAM | GPU | GPU モデル           | GPU メモリ (GiB) |
| ------------------------------- | ---- | --- | --- | ----------------- | ------------- |
| gpu.nvidia.small<sup>(2)</sup>  | 4    | 15  | 1   | NVIDIA Tesla P4   | 8             |
| gpu.nvidia.medium<sup>(2)</sup> | 8    | 30  | 1   | NVIDIA Tesla T4   | 16            |
| gpu.nvidia.large<sup>(2)</sup>  | 8    | 30  | 1   | NVIDIA Tesla V100 | 16            |
{: class="table table-striped"}

###### 例
{: #example-usage }
{:.no_toc}

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: ubuntu-1604-cuda-10.1:201909-23
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
      - run: docker run --gpus all nvidia/cuda:9.0-base nvidia-smi

```

使用可能なイメージの一覧は、[こちらのセクション](#使用可能な-linux-gpu-イメージ)を参照してください。

##### GPU Executor (Windows)
{: #gpu-executor-windows }

| クラス                                     | vCPU | RAM | GPU | GPU モデル         | GPU メモリ (GiB) |
| --------------------------------------- | ---- | --- | --- | --------------- | ------------- |
| windows.gpu.nvidia.medium<sup>(2)</sup> | 16   | 60  | 1   | NVIDIA Tesla T4 | 16            |
{: class="table table-striped"}

###### 例
{: #example-usage }
{:.no_toc}

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

<sup>(2)</sup> _このリソースは、サポート チームによる確認が必要となります。 ご利用の際は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)してください。_

<sup>(3)</sup> _このリソースは、年間契約をご購入のお客様のみ使用可能です。 年間プランの詳細については、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)しお問い合わせください。

<sup>(4)</sup> _このリソースは、最低 24 時間のリースが必要です。 このリソースクラスの詳細は、[macOS の専有ホスト]({{ site.baseurl }}/ja/2.0/dedicated-hosts-macos)を参照して下さい。</p>

**注:** Java、Erlang など、CPU 数に関する情報を `/proc` ディレクトリから入手する言語では、CircleCI のリソースクラス機能を使用するときに、低速化を防ぐために追加の設定が必要になることがあります。 この問題は使用する CPU コアを 32 個要求したときに発生するもので、1 コアをリクエストしたときよりも実行速度が低下します。 該当する言語を使用しているユーザーは、問題が起こらないよう CPU コア数を決まった範囲に固定するなどして対処してください。


**注:** 割り当てられているメモリ量を確認するには、`grep hierarchical_memory_limit /sys/fs/cgroup/memory/memory.stat` を実行して cgroup メモリ階層制限をチェックしてください。

#### **`steps`**
{: #steps }

ジョブにおける `steps` の設定は、キーと値のペアを 1 つずつ列挙する形で行います。キーはステップのタイプを表し、 値は設定内容を記述するマップか文字列（ステップのタイプによって異なる）のどちらかになります。 下記はマップを記述する場合の例です。

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

ここでは `run` がステップのタイプとなります。 `name` 属性は CircleCI 上での表示に使われるものです。 `command` 属性は `run` ステップに特有の、実行するコマンドを定義するものです。

場合によっては steps をより簡便に記述できます。 例えば `run` ステップを下記のように記述することが可能です。

```yml
jobs:
  build:
    steps:
      - run: make test
```

簡略化した表記方法では、実行する `command` を文字列値のようにして、`run` ステップをダイレクトに指定できるようになります。 このとき、省略された他の属性に対してはデフォルトの値が自動で設定されます（例えば `name` 属性には `command` と同じ値が設定されます）。

もう 1 つ、キーと値のペアの代わりにステップ名を文字列として使うシンプルな方法もあります。

```yml
jobs:
  build:
    steps:
      - checkout
```

この例の `checkout` ステップは、プロジェクトのソースコードをジョブの [`working_directory`](#jobs) にチェックアウトします。

通常、ステップは下記にある通りに記述します。

| キー                   | 必須 | タイプ       | 説明                              |
| -------------------- | -- | --------- | ------------------------------- |
| &lt;step_type> | ○  | マップまたは文字列 | ステップの構成マップ、またはステップによって規定された文字列。 |
{: class="table table-striped"}

ステップのなかで利用可能な要素の詳細は下記の通りです。

##### **`run`**
{: #run }

あらゆるコマンドラインプログラムを呼び出すのに使います。設定値を表すマップを記述するか、簡略化した表記方法では、`command` や `name` として扱われる文字列を記述します。 run コマンドはデフォルトでは非ログインシェルで実行されます。そのため、いわゆる dotfiles をコマンド内で明示的に指定するといった工夫が必要になります。

**注: ** `run` ステップは、廃止予定の `deploy` ステップに代わるものです。 ジョブの並列実行が 1 つの場合、廃止予定の `deploy` ステップは、 `run` ステップに直接スワップアウトできます。 並列実行が 2 以上の場合は、[`deploy` から `run` への移行](#migration-from-deploy-to-run)を参照してください。
{: class="alert alert-info"}

| キー                  | 必須 | タイプ   | 説明                                                                                                                                                                        |
| ------------------- | -- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| command             | ○  | 文字列型  | シェルから実行するコマンド。                                                                                                                                                            |
| name                | ×  | 文字列型  | CircleCI の UI に表示されるステップのタイトル (デフォルトは `command` 文字列全体)。                                                                                                                   |
| shell               | ×  | 文字列型  | コマンド実行に使用するシェル (デフォルトについては「[デフォルトのシェル オプション](#デフォルトのシェル-オプション)を参照)。                                                                                                       |
| environment         | ×  | マップ   | コマンドに対するローカル スコープとなる追加の環境変数。                                                                                                                                              |
| background          | ×  | ブール値型 | このステップをバックグラウンドで実行するかどうかの設定 (デフォルトは false)。                                                                                                                               |
| working_directory   | ×  | 文字列型  | このステップを実行するディレクトリ。 ジョブの [`working_directory`](#jobs) からの相対パスとして解釈されます。  (デフォルトは `.`)                                                                                      |
| no_output_timeout | ×  | 文字列型  | 出力のないままコマンドを実行できる経過時間。 「20m」「1.25h」「5s」のように、数字の後に単位を付けた文字列で記述します。 「20m」「1.25h」「5s」のように、数字の後に単位を付けた文字列で記述します (デフォルトは 10 分) デフォルトは10分で、最大値は[ジョブの実行が許される最大時間](#jobs)に制限されます。 |
| when                | ×  | 文字列型  | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。                                                                         |
{: class="table table-striped"}

`run` を宣言するたびに新たなシェルが立ち上がることになります。 複数行の `command` を指定でき、その場合はすべての行が同じシェルで実行されます。

```yml
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

あるステップの完了を待つことなく後続の run ステップを実行したい場合は、[バックグラウンド](#background-commands)でコマンドを実行するように設定することもできます。

###### _デフォルトのシェル オプション_
{: #default-shell-options }

**Linux** で実行するジョブの場合、`shell` オプションのデフォルト値は、`/bin/bash`がビルド コンテナに存在すれば`/bin/bash -eo pipefail`です。 存在しなければ `/bin/sh -eo pipefail` になります。 デフォルトのシェルはログイン シェルではありません (`--login` または `-l` は指定されません)。 そのため、このシェルは `~/.bash_profile`、`~/.bash_login`、`~/.profile` といったファイルを**読み込みません**。

**macOS** で実行するジョブの場合、デフォルトのシェルは `/bin/bash --login -eo pipefail` になります。 このシェルは、非対話型のログイン シェルです。 シェルは、`/etc/profile/` を読み込み、続いて `~/.bash_profile` を読み込んでから、各ステップを実行します。

bash を呼び出したときに実行されるファイルの詳細については、[`bash` のマニュアル ページの `INVOCATION` のセクション](https://linux.die.net/man/1/bash)をご覧ください。

`-eo pipefail` というオプションの意味については下記の通りです。

`-e`

> パイプライン (1 つのコマンドで構成される場合を含む)、かっこ「()」で囲まれたサブシェル コマンド、または中かっこ「{}」で囲まれたコマンド リストの一部として実行されるコマンドの 1 つが 0 以外のステータスで終了した場合は、直ちに終了します。

つまり、先述の例で `mkdir` によるディレクトリ作成が失敗し、ゼロ以外の終了ステータスを返したときは、コマンドの実行は中断され、ステップ全体としては失敗として扱われることになります。 それとは反対の挙動にしたいときは、`command` に `set +e` を追加するか、`run` のコンフィグマップでデフォルトの `shell` を上書きします。 例えば下記のようにします。
```yml
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

例えば下記のようにします。
```yml
- run: make test | tee test-output.log
```

ここで仮に `make test` が失敗したとすると、`-o pipefail` オプションによりステップ全体が失敗したことになります。 `-o pipefail` がなければ、このステップは常に成功することになります。パイプ全体の結果としては、必ずゼロを返す最後のコマンド（`tee test-output.log`）の返り値で決まるためです。

`make test` が失敗したとしても、パイプの残りの部分が実行されることに注意してください。

このような動作に不都合があるときは、コマンドで `set +o pipefail` を指定するか、`shell` 全体を（最初の例のように）書き換えてください。

通常はデフォルトのオプション（`-eo pipefail`）を使うことを推奨しています。こうすることで、途中のコマンドでエラーがあっても気付くことができ、ジョブが失敗したときのデバッグも容易になります。 CircleCI 上では `run` ステップごとに使用したシェルとアクティブなオプションを表示するのも好都合です。

詳細は[シェルスクリプトを使う]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)を参照してください。

###### _バックグラウンド コマンド_
{: #background-commands }

`background` 属性はコマンドをバックグラウンドで実行するように設定するものです。 `background` 属性を `true` にセットすることで、ジョブ実行においてコマンドの終了を待つことなく、即座に次のステップへと処理を移します。 下記の例は Web の UI 検証に用いるツール Selenium のテスト時によく必要とされる、バックグラウンドにおける X virtual framebuffer の実行に関するコンフィグです。

```yml
- run:
    name: X 仮想フレームバッファの実行
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _省略構文_
{: #shorthand-syntax }

`run` ステップでは大変便利な簡略化構文を利用できます。

```yml
- run: make test

# 簡略化したうえで複数行のコマンドを実行
- run: |
    mkdir -p /tmp/test-results
    make test
```
この例では、`command` と `name` には `run` の文字列値が割り当てられたのと同等となり、`run` におけるコンフィグマップの残りにはデフォルト値が設定されます。

###### `when` 属性
{: #the-when-attribute }

デフォルトでは、CircleCI は `config.yml` で定義された順序通り、ステップが失敗するまで（ゼロ以外の終了コードを返すまで）ジョブステップを 1 つずつ実行します。 コマンドが失敗すると、それ以降のジョブステップは実行されません。

`when` 属性を追加することで、このデフォルトのジョブステップの挙動を変えることができます。ジョブのステータスに応じてステップを続行するか、スキップするかを選択することも可能になります。

デフォルト値である `on_success` は、それまでのステップが全て成功している（終了コード 0 を返した）ときのみ処理を続けます。

`always` はそれまでのステップの終了ステータスにかかわらず処理を続けます。 前のステップが成功したか否かに関係なく処理を続けたいタスクがあるときに都合の良い設定です。 例えば、ログやコードカバレッジのデータをどこかのサーバーにアップロードするようなジョブステップに利用できます。

`on_fail` は直前のステップが失敗した（ゼロ以外の終了コードを返した）ときにのみ処理を続行するものです。 デバッグを支援するなんらかの診断データを保存したいとき、あるいはメールやチャットなどで失敗に関する通知をしたいときなどに `on_fail` が使えます。

**注:** `store_artifacts`、`store_test_results` などの一部のステップは、**それより前のステップが失敗しても** (0 以外の終了コードが返された場合でも) 常に実行されます。 ただし、ジョブがキャンセル要求により**強制終了**された場合、または実行時間がグローバル タイムアウト上限である 5 時間に達した場合、`when` 属性、`store_artifacts`、`store_test_results` は実行されません。

```yml
- run:
    name: CodeCov.io データのアップロード
    command: bash <(curl -s https://codecov.io/bash) -F unittests
    when: always # 成功しても失敗しても、コード カバレッジの結果をアップロードします
```



###### `step` 内からのジョブの終了
{: #ending-a-job-from-within-a-step }

`run: circleci-agent step halt` を使用することで、ジョブを失敗させずに終了できます。 これは、条件に従ってジョブを実行する必要がある場合に便利です。

以下の例では、`halt` を使用して、`develop` ブランチでジョブが実行されないようにしています。

```yml
run: |
    if [ "$CIRCLE_BRANCH" = "develop" ]; then
        circleci-agent step halt
    fi
```

###### 例
{: #example }
{:.no_toc}

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

`when` キーや `unless` キーを使うことで条件付きのステップを作ることができます。 `when` キーの下に、`condition` サブキーと `steps` サブキーを記述します。 `when` ステップの用途として考えられるのは、事前に Workflows を実行して確認した（コンパイルの時点で決定される）条件に基づいて実行するために、コマンドとジョブの設定をカスタマイズする、といったものです。 詳細は「コンフィグを再利用する」の[「条件付きステップ」]({{ site.baseurl }}/ja/2.0/reusing-config/#defining-conditional-steps)を参照してください。

| キー        | 必須 | タイプ   | 説明                                                                                      |
| --------- | -- | ----- | --------------------------------------------------------------------------------------- |
| condition | ○  | ロジック  | [ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements) |
| steps     | ○  | シーケンス | 条件が true のときに実行されるステップの一覧                                                               |
{: class="table table-striped"}

###### *例*
{: #example }
{:.no_toc}

```yml
version: 2.1

jobs: # conditional steps may also be defined in `commands:`
  job_with_optional_custom_checkout:
    parameters:
      custom_checkout:
        type: string
        default: ""
    machine:
      image: ubuntu-2004:202107-02
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
```

##### **`checkout`**
{: #checkout }

設定済みの `path` (デフォルトは `working_directory`) にソース コードをチェックアウトするために使用する特別なステップです。 コードのチェックアウトを簡便にすることを目的にしたヘルパー関数である、というのが特殊としている理由です。 HTTPS 経由で git を実行する場合はこのステップは使えません。ssh 経由でチェックアウトするのと同じ設定を行う必要があります。

| キー   | 必須 | タイプ  | 説明                                                                                |
| ---- | -- | ---- | --------------------------------------------------------------------------------- |
| path | ×  | 文字列型 | チェックアウト ディレクトリ。 ジョブの [`working_directory`](#jobs) からの相対パスとして解釈されます。  (デフォルトは `.`) |
{: class="table table-striped"}

`path` が既に存在する場合、次のように動作します。
 * Ubuntu 16.04、Docker v18.09.3、Docker Compose v1.23.1
 * Git リポジトリ以外 - ステップは失敗します。

単純に `checkout` する場合は、ステップタイプは属性なしで文字列を記述するだけです。

```yml
- checkout
```

**注:** CircleCI は、サブモジュールをチェックアウトしません。 そのプロジェクトにサブモジュールが必要なときは、下記の例のように適切なコマンドを実行する `run` ステップを追加してください。

```yml
- checkout
- run: git submodule sync
- run: git submodule update --init
```

このコマンドは、SSH 経由で GitHub や Bitbucket を操作するために必要な認証キーを自動的に挿入します。この詳細は、カスタム チェックアウト コマンドを実装する際に役に立つ[インテグレーション ガイド]({{ site.baseurl }}/ja/2.0/gh-bb-integration/#ssh-ホストの信頼性の確立)で解説しています。

**注:** `checkout` ステップは、自動ガベージ コレクションをスキップするように Git を構成します。 [restore_cache](#restore_cache) キーで `.git` ディレクトリをキャッシュしていて、そのディレクトリ配下のデータ量を最小限にするのにガベージコレクションも実行したい場合は、先に [run](#run) ステップで `git gc` コマンドを実行しておく方法があります。

##### **`setup_remote_docker`**
{: #setupremotedocker }

Docker コマンド実行用のリモート Docker 環境を作成します。 詳細は [Docker コマンドを実行する]({{ site.baseurl }}/ja/2.0/building-docker-images/)を参照してください。

| キー                     | 必須 | タイプ  | 説明                                                                                                                                                   |
| ---------------------- | -- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| docker_layer_caching | ×  | ブール値 | `True` に設定すると、リモート Docker 環境で [Docker レイヤー キャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching/) が有効になります (デフォルトは `false`)。                           |
| version                | ×  | 文字列型 | 使用する Docker のバージョン文字列 (デフォルトは `17.09.0-ce`)。 サポートされている Docker バージョンについては、[こちら]({{site.baseurl}}/ja/2.0/building-docker-images/#docker-のバージョン)を参照してください。 |
{: class="table table-striped"}

**注:**

- `setup_remote_docker` は、`machine` Executor と互換性がありません。 `machine` Executor における Docker レイヤーキャッシングの方法について、詳細は「Docker レイヤーキャッシング」の「[Machine Executor]({{ site.baseurl }}/ja/2.0/docker-layer-caching/#machine-executor)」を参照してください。
- 現在、プライベート クラウドまたはデータセンターにインストールされている CircleCI では、`version` キーがサポートされていません。 リモート環境にインストールされている Docker のバージョンについては、システム管理者に問い合わせてください。

##### **`save_cache`**
{: #savecache }

CircleCI のオブジェクトストレージにある、依存関係やソースコードのようなファイル、ディレクトリのキャッシュを生成し、保存します。 キャッシュはその後のジョブで[復元](#restore_cache)することができます。 詳細については、[依存関係のキャッシュ]({{site.baseurl}}/ja/2.0/caching/)を参照してください。

保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。

| キー    | 必須 | タイプ  | 説明                                                                                                |
| ----- | -- | ---- | ------------------------------------------------------------------------------------------------- |
| paths | ○  | リスト  | キャッシュに追加するディレクトリのリスト。                                                                             |
| key   | ○  | 文字列型 | このキャッシュの一意の識別子。                                                                                   |
| name  | ×  | 文字列型 | CircleCI の UI に表示されるステップのタイトル (デフォルトは「Saving Cache」)。                                             |
| when  | ×  | 文字列型 | [このステップを有効または無効にする条件](#when-属性)。 値は `always`、`on_success`、または `on_fail` です (デフォルトは `on_success`)。 |
{: class="table table-striped"}

`key` で割り当てたキャッシュは、一度書き込むと書き換えられません。

**注:** `key` に指定した値が既存のキャッシュの識別子と重複する場合、そのキャッシュは変更されないまま、ジョブの実行が次のステップに進みます。

新しいキャッシュを格納する際に、`key` に特別なテンプレートの値を含めることも可能です。

| テンプレート                                                 | 説明                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| {% raw %}`{{ .Branch }}`{% endraw %}                   | 現在ビルド中の VCS ブランチ。                                                                                                                                                                                                                                                                                                                     |
| {% raw %}`{{ .BuildNum }}`{% endraw %}                 | このビルドの CircleCI ビルド番号。                                                                                                                                                                                                                                                                                                                |
| {% raw %}`{{ .Revision }}`{% endraw %}                 | 現在ビルド中の VCS リビジョン。                                                                                                                                                                                                                                                                                                                    |
| {% raw %}`{{ .CheckoutKey }}`{% endraw %}              | リポジトリのチェックアウトに使用する SSH キー。                                                                                                                                                                                                                                                                                                            |
| {% raw %}`{{ .Environment.variableName }}`{% endraw %} | 環境変数 `variableName` ([CircleCI からエクスポートされる環境変数](https://circleci.com/ja/docs/2.0/env-vars/#circleci-environment-variable-descriptions)、または特定の[コンテキスト](https://circleci.com/ja/docs/2.0/contexts)に追加した環境変数がサポートされ、任意の環境変数は使用できません)。                                                                                                    |
| {% raw %}`{{ checksum "filename" }}`{% endraw %}       | filename で指定したファイルの内容の SHA256 ハッシュを Base64 エンコードした値。 リポジトリにコミットするファイルのみを指定できます。絶対パス、または現在の作業ディレクトリからの相対パスで参照できます。 依存関係マニフェスト ファイル (`package-lock.json`、`pom.xml`、`project.clj` など) の使用をお勧めします。 `restore_cache` と `save_cache` の間でこのファイルが変化しないのが重要なポイントです。ファイル内容が変化すると、`restore_cache` のタイミングで使われるファイルとは異なるキャッシュキーを元にしてキャッシュを保存するためです。 |
| {% raw %}`{{ epoch }}`{% endraw %}                     | UNIX エポックからの秒数で表される現在時刻。                                                                                                                                                                                                                                                                                                              |
| {% raw %}`{{ arch }}`{% endraw %}                      | OS と CPU の情報。  OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin amd64` あるいは `linux i386/32-bit` のような文字列になります。                                                                                                                                                                                                               |
{: class="table table-striped"}

ステップの処理では、以上のようなテンプレートの部分は実行時に値が置き換えられ、その置換後の文字列が`キー`の値として使われます。

テンプレートの例
 * {% raw %}`myapp-{{ checksum "package-lock.json" }}`{% endraw %} - `package-lock.json` ファイルの内容が変わるたびにキャッシュが再生成されます。 このプロジェクトのさまざまなブランチで同じキャッシュ キーが生成されます。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package-lock.json" }}`{% endraw %} - 上の例と同じように、ファイルの内容が変わるたびにキャッシュが再生成されますが、各ブランチで個別のキャッシュが生成されます。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ジョブを実行するごとに個別のキャッシュが生成されます。

キャッシュの `key` にテンプレート値を埋め込む場合、キャッシュの保存に制限がかかることに注意してください。CircleCI のストレージにキャッシュをアップロードするのに通常より時間がかかります。 そのため、実際に変更があったときにのみ新しいキャッシュを生成し、ジョブ実行のたびに新たなキャッシュを作らないように `key` を使うのがコツです。

<div class="alert alert-info" role="alert">
<b>ヒント:</b> キャッシュは変更不可なので、すべてのキャッシュ キーの先頭にプレフィックスとしてバージョン名 (<code class="highlighter-rouge">v1-...</code> など) を付加すると便利です。 こうすれば、プレフィックスのバージョン番号を増やしていくだけで、キャッシュ全体を再生成できます。
</div>

###### _例_
{: #example }
{:.no_toc}

{% raw %}
```yml
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

**注:**
- `save_cache` パスは現在のところ、ワイルドカードをサポートしていません。 お客様やお客様の組織にとってワイルドカードが有益でしたら、[Ideas board](https://ideas.circleci.com/cloud-feature-requests/p/support-wildcards-in-savecachepaths) にご意見をお寄せください。

- インスタンスによっては、特定のワークスペースをキャッシュに保存する回避策もあります。

{% raw %}
```yml
- save_cache:
    key: v1-{{ checksum "yarn.lock" }}
    paths:
      - node_modules/workspace-a
      - node_modules/workspace-c
```
{% endraw %}

##### **`restore_cache`**
{: #restorecache }

`key` に設定されている内容を元に、あらかじめ保存されていたキャッシュを復元します。 先に [`save_cache` ステップ](#save_cache)を利用して、この key に該当するキャッシュを保存しておかなければなりません。 詳細については、[キャッシュに関するドキュメント]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。

| キー   | 必須               | タイプ  | 説明                                                        |
| ---- | ---------------- | ---- | --------------------------------------------------------- |
| key  | ○ <sup>(1)</sup> | 文字列型 | 復元するキャッシュ キーを 1 つだけ指定します。                                 |
| keys | ○ <sup>(1)</sup> | リスト  | 復元するキャッシュを検索するためのキャッシュ キーのリスト。 最初に一致したキーのみが復元されます。        |
| name | ×                | 文字列型 | CircleCI の UI に表示されるステップのタイトル (デフォルトは "Restoring Cache")。 |
{: class="table table-striped"}

<sup>(1)</sup> 少なくとも 1 つの属性を指定する必要があります。 `key` と `keys` の両方が指定されたときは、`key` の内容がまず始めに検証され、次に `keys` の内容が検証されます。

既存のキーを対象に前方一致で検索が行われます。

**注 :** 複数が一致する場合は、一致度の高さに関係なく、**一致する最新のもの**が使われます。

以下に例を示します。

```yml
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

この例では、`v1-myapp-cache-new` で示したキャッシュがリストアされます。最初のキー（`v1-myapp-cache`）にもマッチはしていますが、これが`v1-myapp-cache` というプレフィックスで検索したときに一番最後にマッチしたからです。

key の詳しい書式については、[`save_cache` ステップ](#save_cache)の `key` セクションをご覧ください。

CircleCI が `keys` のリストを処理するときは、最初にマッチした既存のキャッシュを復元します。 通常は、より特定度の高いキー (たとえば、`package-lock.json` ファイルの正確なバージョンに対応するキー) を最初に記述し、より汎用的なキー (たとえば、プロジェクトの任意のキャッシュが対象となるキー) をその後に記述します。 キーに該当するキャッシュが存在しない場合は、警告が表示され、ステップがスキップされます。

元々のキャッシュの保存場所に復元されるため、restore_cache では path の指定は不要です。

###### 例
{: #example }
{:.no_toc}

{% raw %}
```yml
- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # if cache for exact version of `project.clj` is not present then load any most recent one
      - v1-myapp-

# ... Steps building and testing your application ...

# cache will be saved only once for each version of `project.clj`
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

##### **`deploy` - 廃止予定**
{: #deploy-deprecated }
{:.no_toc}

現在のプロセスに関しては、[実行](#run)をご覧ください。 並列処理が 2 以上の場合は、[`deploy` から `run` への移行](#migration-from-deploy-to-run)を参照してください。

##### **`deploy` から `run` への移行**

**注: **廃止予定の `deploy` ステップが使われている設定ファイルは、変更_する必要があります_。ジョブに並列処理が使われているかいないかに関わらず、`deploy` ステップの_すべての_インスタンスを削除する必要があります。

*[並列処理](https://circleci.com/docs/ja/2.0/parallelism-faster-jobs/)が 1 つの場合*、`deploy`キーと[`run`](#run) キーをスワップアウトします。 移行に必要な処理はこれだけです。

*ジョブの [並列処理](https://circleci.com/docs/ja/2.0/parallelism-faster-jobs/)が 2 つ以上の場合*、 1 つのワークフローで、テストジョブとデプロイジョブの 2 つのジョブを別々に作成することを推奨します。 テストジョブではテストをが並列で実行され、デプロイジョブはテストジョブに依存します。 テストジョブの並列処理が 2 つ以上の場合、以前の `deploy` ステップのコマンドが ‘run’  に置き換えられ 、並列処理は行われません。 以下のサンプルをご覧ください。

###### *サンプル*

以下の例では 2 つ以上の並列実行を含む設定ファイルで、廃止予定の `deploy` ステップを置き換えています。(このコードは廃止されるため、コピーしないでください)。

```yml
# Example of deprecated syntax, do not copy
version: 2.1
jobs:
  deploy-step-job:
    docker:
      - image: cimg/base:stable
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
      - deploy: #deprecated deploy step, do not copy
          command: |
            echo "this is a deploy step which needs data from the rand"
            cat rand_*.txt

workflows:
  deploy-step-workflow:
    jobs:
      - deploy-step-job
```

完全に外部リソースに依存している場合 (たとえば、Docker コンテナがレジストリにプッシュされるなど)、上記の `deploy` ステップをジョブとして抽出します。これには`doing-things-job` を完了させる必要があります。 `doing-things-job` では 並列処理を 3 つ使用し、`deploy-step-job` では実際のデプロイを実行します。 以下のサンプルを参照してください。

```yml
version: 2.1
jobs:
  doing-things-job:
    docker:
      - image: cimg/base:stable
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
  # create a new job with the deploy step in it
  deploy-job:
    docker:
      - image: cimg/base:stable
    steps:
      - run: # change "deploy" to "run"
          command: |
            echo "this is a deploy step"

workflows:
  deploy-step-workflow:
    jobs:
      - doing-things-job
      # add your new job and make it depend on the 
      # "doing-things-job"
      - deploy-job:
          requires:
            - doing-things-job
```

`deploy-job` の `doing-things-job` からファイルが必要な場合は、[ワークスペース](https://circleci.com/docs/ja/2.0/workspaces/)を使います。 これにより、2つジョブでファイルを共用でき、 `deploy-job` がファイルにアクセスできるようになります。 以下のサンプルを参照してください。

```yml
version: 2.1
jobs:
  doing-things-job:
    docker:
      - image: cimg/base:stable
    parallelism: 3
    steps:
      - checkout
      - run:
          name: "Say hello"
          command: "echo Hello, World!"
      - run:
          name: "Write random data"
          command: openssl rand -hex 4 > rand_${CIRCLE_NODE_INDEX}.txt
      - run:
          name: "Emulate doing things"
          command: |
            if [[ "$CIRCLE_NODE_INDEX" != "0" ]]; then
              sleep 30
            fi
      # save the files your deploy step needs
      - save_workspace:
          root: .     # relative path to our working directory
          paths:      # file globs which will be persisted to the workspace
           - rand_*

  deploy-job:
    docker:
      - image: cimg/base:stable
    steps:
      # attach the files you persisted in the doing-things-job
      - attach_workspace:
          at: . # relative path to our working directory
      - run:
          command: |
            echo "this is a deploy step"

workflows:
  deploy-step-workflow:
    jobs:
      - doing-things-job
      - deploy-job:
          requires:
            - doing-things-job
```

このサンプルでは "fan-in" ワークフロー (詳細は、[ワークフロー](https://circleci.com/docs/2.0/workflows/#fan-outfan-in-workflow-example) を参照)を効果的に使用しています。 廃止される `deploy` ステップは、近い将来のある時点でサポートが終了する予定です。 お客様が設定を移行するのに十分な時間が提供する予定です。

##### **`store_artifacts`**
{: #storeartifacts }

Web アプリまたは API からアクセスできるアーティファクト (ログ、バイナリなど) を格納するステップです。 詳細については、[アーティファクトに関するドキュメント]({{ site.baseurl }}/ja/2.0/artifacts/)を参照してください。

| キー          | 必須 | タイプ  | 説明                                                                         |
| ----------- | -- | ---- | -------------------------------------------------------------------------- |
| path        | ○  | 文字列型 | ジョブ アーティファクトとして保存するプライマリ コンテナ内のディレクトリ。                                     |
| destination | ×  | 文字列型 | アーティファクト API でアーティファクトの保存先パスに追加するプレフィックス (デフォルトは `path` で指定したファイルのディレクトリ)。 |
{: class="table table-striped"}

ジョブでは複数の `store_artifacts` ステップを指定することもできます。 各ステップで一意のプレフィックスを使用すると、ファイルの上書きを防止できます。

アーティファクトの保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。

###### 例
{: #example }
{:.no_toc}

```yml
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

テスト結果をビルドアーティファクトとして保存することもできます。その方法については [**store_artifacts** ステップ](#storeartifacts)を参照してください。

| キー   | 必須 | タイプ  | 説明                                                                                                                         |
| ---- | -- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| path | ○  | 文字列型 | JUnit XML または Cucumber JSON のテスト メタデータ ファイルが格納されたサブディレクトリを含むディレクトリ、またはシングル テストへのパス (絶対パス、または `working_directory` からの相対パス)。 |
{: class="table table-striped"}

###### _例_
{: #example }
{:.no_toc}

ディレクトリ構造

```
test-results
├── jest
│   └── results.xml
├── mocha
│   └── results.xml
└── rspec
    └── results.xml
```

`config.yml` の構文

```yml
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**
{: #persisttoworkspace }

一時ファイルを永続化してワークフロー内の別のジョブで使用できるようにするための特別なステップです。 `persist_to_workspace` により、CircleCI Web アプリのストレージカスタマイズコントロールのストレージ設定が適用されます。 カスタマイズ設定がない場合は、`persist_to_workspace` によりデフォルトで 15 日に設定されます。

ワークスペースのストレージ保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。

| キー    | 必須 | タイプ  | 説明                                                                                                                 |
| ----- | -- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| root  | ○  | 文字列型 | 絶対パス、または `working_directory` からの相対パス。                                                                              |
| paths | ○  | リスト  | 共有ワークスペースに追加する、グロブで認識されるファイル、またはディレクトリへの非グロブ パス。 ワークスペースのルート ディレクトリへの相対パスと解釈され、 ワークスペースのルート ディレクトリ自体を指定することはできません。 |
{: class="table table-striped"}

root キーは、ワークスペースのルート ディレクトリとなる、コンテナ上のディレクトリを指定します。 paths の値は、すべてルート ディレクトリからの相対的パスです。

##### _root キーの使用例_
{: #example-for-root-key }

下記の構文は `/tmp/dir` 内にある paths で指定している内容を、ワークスペースの `/tmp/dir` ディレクトリ内に相対パスで保持します。

```yml
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

このステップが完了すると、以下のディレクトリがワークスペースに追加されます。

```
/tmp/dir/foo/bar
/tmp/dir/baz
```

###### _paths キーの例_
{: #example-for-paths-key }

```yml
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

`paths` では、Go 言語の `Glob` 関数をベースにした、[filepath.Match](https://golang.org/pkg/path/filepath/#Match) によるパターンマッチングに対応します。

```
pattern:
        { term }
term:
        '*'　区切り文字を含まない文字シーケンスの全てにマッチする
        '?'　区切り文字を含まないあらゆる文字 1 つにマッチする
        '[' [ '^' ] { character-range } ']'
　　　　　　　　文字クラス（空文字は不可）
        c　文字 c にマッチする（'*'　'?'　'\\'　'[' 以外）
        '\\'c　文字 c にマッチする
character-range:
        c　文字 c にマッチする（'\\'　'-'　']' 以外)
        '\\'c　文字 c にマッチする
        lo '-' hi　lo <= c <= hi の範囲にある文字 c にマッチする
```

Go 言語のドキュメントでは、`/usr/*/bin/ed` のように階層名でパターンを記述できるとしています（/ は区切り文字です）。 **注 :** どのような指定方法でもワークスペースのルートディレクトリへの相対パスとなります。

##### **`attach_workspace`**
{: #attachworkspace }

ワークフローで使用しているワークスペースを現在のコンテナにアタッチするのに利用する特殊なステップです。 ワークスペースのすべての内容がダウンロードされ、ワークスペースがアタッチされているディレクトリにコピーされます。

| キー | 必須 | タイプ  | 説明                    |
| -- | -- | ---- | --------------------- |
| at | ○  | 文字列型 | ワークスペースのアタッチ先のディレクトリ。 |
{: class="table table-striped"}

ワークスペースのストレージ保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。

###### _例_
{: #example }
{:.no_toc}

```yml
- attach_workspace:
    at: /tmp/workspace
```

各ワークフローには、それぞれに一時的なワークスペースが関連付けられています。 ワークスペースは、ジョブの実行中にビルドした固有のデータを、同じワークフローの他のジョブに渡すために使用されます。 ジョブ内では、`persist_to_workspace` ステップを使用してワークスペースにファイルを追加でき、`attach_workspace` ステップを使用してワークスペースの内容をファイル システムにダウンロードできます。 ワークスペースは追加専用です。ジョブは、ワークスペースにファイルを追加することはできますが、ワークスペースからファイルを削除することはできません。 各ジョブでは、そのアップストリームのジョブによってワークスペースに追加された内容を参照することのみ可能です。 ワークスペースをアタッチすると、アップストリーム ジョブがワークフロー グラフに現れる順番で、各アップストリーム ジョブからの「レイヤー」が適用されます。 しかし、2 つのジョブを同時に実行すると、そのレイヤーの適用順序は確定できません。 同時に実行した複数のジョブが同じファイル名でデータを保持し ワークスペースにアタッチするようなケースでは、エラーが発生しますのでご注意ください。

ワークフローを再度実行すると、元のワークフローと同じワークスペースを引き継ぎます。 失敗したジョブを再度実行したときも、そのジョブは元のワークフローで実行したジョブと同じワークスペースの内容を使えることになります。

アーティファクト、ワークスペース、キャッシュの各機能には下記のような違いがあります。

| タイプ      | 用途                                                           | 例                                                                                                                                             |
| -------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト | 長期アーティファクトを保存します。                                            | **[Job (ジョブ)]** ページの [Artifacts (アーティファクト)] タブから参照できます。`tmp/circle-artifacts.<hash>/container` などのディレクトリの下に格納されています。                    |
| ワークスペース  | `attach_workspace:` ステップを使用して、ダウンストリーム コンテナにワークスペースをアタッチします。 | `attach_workspace` を実行すると、ワークスペースの内容全体がコピーされ、再構築されます。                                                                                         |
| キャッシュ    | ジョブ実行の高速化に役立つ非必須データ (npm、Gem パッケージなど) を保存します。                | 追加するディレクトリのリストへの `path` と、キャッシュを一意に識別する `key` (ブランチ、ビルド番号、リビジョンなど) を指定した `save_cache` ジョブ ステップ。   `restore_cache` と 適切な `key` を使ってキャッシュを復元する。 |
{: class="table table-striped"}

アーティファクト、ワークスペース、キャッシュの保存期間は、[CircleCI Web アプリ](https://app.circleci.com/)の **Plan > Usage Controls** からカスタマイズ可能です。 ここからこれらのオブジェクトのストレージ保存期間をコントロールすることができます。 ストレージ期間が設定されていない場合、デフォルトのストレージ保存期間はアーティファクトは 30 日間、ワークスペースとキャッシュは 15 日間です。
{: class="alert alert-info" }

ワークスペース、キャッシュ、アーティファクトに関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces (ワークフローでデータを保持するには: キャッシュ、アーティファクト、ワークスペース活用のヒント)](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

##### **`add_ssh_keys`**
{: #add-ssh-keys }

プロジェクト設定でコンテナに対して SSH キーを登録する特殊なステップです。 下記のキーを使って SSH に関する設定を行えます。

| キー           | 必須 | タイプ | 説明                                                 |
| ------------ | -- | --- | -------------------------------------------------- |
| fingerprints | ×  | リスト | 追加するキーに対応するフィンガープリントのリスト (デフォルトでは、追加されるすべてのキーが対象)。 |
{: class="table table-striped"}

```yaml
steps:
  - add_ssh_keys:
      fingerprints:
        - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

**注:** CircleCI は追加されたすべての SSH キーに `ssh-agent` を使用して署名しますが、ユーザーは `add_ssh_keys` キーを使用して実際にコンテナにキーを追加する**必要があります**。

##### `pipeline.` 値の使用
{: #using-pipeline-values }

パイプライン値はすべてのパイプライン構成で使用でき、事前の宣言なしに利用できます。 利用可能なパイプライン値は次のとおりです。

| 値                          | 説明                                            |
| -------------------------- | --------------------------------------------- |
| pipeline.id                | パイプラインを表す、グローバルに一意の ID。                       |
| pipeline.number            | パイプラインを表す、プロジェクトで一意の整数の ID                    |
| pipeline.project.git_url   | 例:  https://github.com/circleci/circleci-docs |
| pipeline.project.type      | 例:  "github"                                  |
| pipeline.git.tag           | パイプラインをトリガーするタグ。                              |
| pipeline.git.branch        | パイプラインをトリガーするブランチ。                            |
| pipeline.git.revision      | 現在の git リビジョン。                                |
| pipeline.git.base_revision | 以前の git リビジョン。                                |
{: class="table table-striped"}

例えば下記のようにします。

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:17.2.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      IMAGETAG: latest
    working_directory: ~/main
    steps:
      - run: echo "This is pipeline ID << pipeline.id >>"
```

#### **`circleci_ip_ranges`**
{: #circleciipranges }

ジョブで使用される IP アドレスを、明確に定義された範囲のみに限定できます。 詳しくは [IP アドレスの範囲機能]({{ site.baseurl }}/ja/2.0/ip-ranges/)をご確認ください。

###### _例_
{: #example }
{:.no_toc}

```yaml
version: 2.1

jobs:
  build:
    circleci_ip_ranges: true # opts the job into the IP ranges feature
    docker:
      - image: curlimages/curl
    steps:
      - run: echo “Hello World”
workflows:
  build-workflow:
    jobs:
      - build
```

**注:**

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- IP アドレスの範囲機能は現在、有料プランのお客様にオープンプレビューでご利用いただけます。 具体的な料金や詳細については、機能の一般公開時にお知らせします。

## **`workflows`**
{: #workflows }
あらゆるジョブの自動化に用います。 各ワークフローは、キーとなるワークフロー名と、値となるマップで構成します。 名前は、その `config.yml` 内で一意である必要があります。 ワークフロー構成の最上位のキーは `version` と `jobs` です。

### **`バージョン`**
{: #workflow-version }
ワークフローの `version` フィールドは、非推奨またはベータ版での互換性を損なう変更について注意を促すために記述します。

| キー      | 必須 | タイプ  | 説明                    |
| ------- | -- | ---- | --------------------- |
| version | ○  | 文字列型 | 現在は `2` を指定する必要があります。 |
{: class="table table-striped"}

### **<`workflow_name`>**
{: #lessworkflownamegreater }

ワークフローに付与する一意の名前です。

#### **`triggers`**
{: #triggers }
ワークフローを実行するトリガーを指定します。 デフォルトの動作では、ブランチにプッシュされたときにワークフローがトリガーされます。

| キー       | 必須 | タイプ | 説明                           |
| -------- | -- | --- | ---------------------------- |
| triggers | ×  | 配列  | 現在は `schedule` を指定する必要があります。 |
{: class="table table-striped"}

##### **`schedule`**
{: #schedule }
ワークフローでは、一定時刻に実行を指示する `schedule` を記述することもできます。利用者の少ない毎日夜12時にビルドする、といったことが可能です。

```yml
workflows:
   version: 2
   nightly:
     triggers:
       - schedule:
           cron: "0 0 * * *"
           filters:
             branches:
               only:
                 - main
                 - beta
     jobs:
       - test
```
###### **`cron`**
{: #cron }
`cron` キーは POSIX 準拠の `crontab` の構文で定義します。

| キー   | 必須 | タイプ  | 説明                                                                                            |
| ---- | -- | ---- | --------------------------------------------------------------------------------------------- |
| cron | ○  | 文字列型 | [crontab のマニュアル ページ](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html)を参照してください。 |
{: class="table table-striped"}

###### **`filters`**
{: #filters }
トリガーのフィルターでは、`branches` キーを使用できます。

| キー      | 必須 | タイプ | 説明                |
| ------- | -- | --- | ----------------- |
| filters | ○  | マップ | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

###### **`branches`**
{: #branches }
{:.no_toc}

`branches` キーは、*現在のブランチ*について、スケジュール実行すべきかどうかを制御します。この*現在のブランチ*とは、`trigger` スタンザがある `config.yml` ファイルを含むブランチです。 つまり、`main` ブランチにプッシュすると、`main` の [ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/#using-contexts-and-filtering-in-your-workflows)のみをスケジュール実行します。

branches では、ブランチ名を指す文字列をマップさせるための `only` キーと `ignore` キーが使えます。 文字列を `/` で囲み、正規表現を使ってブランチ名をマッチさせたり、文字列のリストを作ってマップさせることも可能です。 正規表現は、文字列**全体**に一致する必要があります。

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | タイプ            | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ○  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ○  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

#### **`jobs`**
{: #jobs-in-workflow }
ジョブでは、`requires`、`name`、`context`、`type`、`filters` の各キーを使用できます。

| キー   | 必須 | タイプ | 説明                   |
| ---- | -- | --- | -------------------- |
| jobs | ○  | リスト | 依存関係に従って実行するジョブのリスト。 |
{: class="table table-striped"}

##### **<`job_name`>**
{: #job-name-in-workflow }

`config.yml` ファイルで定義するジョブの名前です。

###### **`requires`**
{: #requires }
デフォルトでは、複数のジョブは並行処理されます。そのため、ジョブ名を使って必要な依存関係の処理を明確にしておく必要があります。

| キー       | 必須 | タイプ | 説明                                                                                                                                                                                   |
| -------- | -- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| requires | ×  | リスト | そのジョブを開始するために成功する必要があるジョブのリスト。 メモ: 現在のワークフローで依存関係としてリストされているジョブが (フィルター機能などの影響で) 実行されなかった場合、他のジョブの requires オプションでは、これらのジョブの必須設定は無視されます。 しかし、ジョブのすべての依存関係がフィルター処理されると、そのジョブは実行されません。 |
{: class="table table-striped"}

###### **`name`**
{: #name }
`name` キーを使用すると、任意の数のワークフローで再利用可能なジョブを呼び出すことができます。 このキーを使うと、ジョブ名に番号は付与されません (例: sayhello-1、sayhello-2)。 この `name` キーに割り当てる名前は一意である必要があります。重複する場合は、ジョブ名に数字が付与されます。

| キー   | 必須 | タイプ  | 説明                                                                                                  |
| ---- | -- | ---- | --------------------------------------------------------------------------------------------------- |
| name | ×  | 文字列型 | ジョブ名の代替名。 何度もジョブを実行する際に都合の良い名前を指定することが可能です。 同じジョブを複数回呼び出したいとき、あるジョブで同じ内容のジョブが必要なときなどに有効です (2.1 のみ)。 |
{: class="table table-striped"}

###### **`context`**
{: #context }
ジョブは、組織において設定したグローバル環境変数を使えるようにすることも可能です。設定画面で context を追加する方法については[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)を参照してください。

| キー      | 必須 | タイプ     | 説明                                                                                                                                                                      |
| ------- | -- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| context | ×  | 文字列/リスト | コンテキストの名前。 初期のデフォルト名は `org-global` です。 各コンテキスト名は一意である必要があります。 CircleCI Server を使用している場合、ワークフローごとに使用できるコンテキストは 1 つのみです。 **注:** 一意のコンテキストは、すべてのワークフローを合わせて 100 個まで使用できます。 |
{: class="table table-striped"}

###### **`type`**
{: #type }
`approval` の `type` を指定することで、その後のジョブを続行する前に手動の承認操作を求めることができるようになります。 下記の例にある通り、Workflow が `type: approval` キーを処理するまで、ジョブは依存関係通りの順番で実行されます。

```yml
      - hold:
          type: approval
          requires:
            - test1
            - test2
      - deploy:
          requires:
            - hold
```
**注 :** `hold` というジョブ名は、メインの設定に入れないようにしてください。

###### **`filters`**
{: #jobfilters }
ジョブのフィルタリングでは、`branches` キーまたは `tags` キーを使用できます。 **注 :** ワークフローではジョブレベルのブランチは無視されます。 ジョブレベルでブランチを指定していて後でワークフローを追加する場合は、ジョブレベルのブランチを削除し、代わりにそれを `config.yml` のワークフローセクションで以下のように宣言する必要があります。

| キー      | 必須 | タイプ | 説明                |
| ------- | -- | --- | ----------------- |
| filters | ×  | マップ | 実行するブランチを定義するマップ。 |
{: class="table table-striped"}

以下に、CircleCI ドキュメントに含まれるサンプルから、正規表現を使用して PDF ドキュメントの作成ワークフローのみを実行するフィルターの使い方を示します。

```yaml
# ...
workflows:
  build-deploy:
    jobs:
      - js_build
      - build_server_pdfs: # << ブランチ名フィルターに応じて実行されるジョブ
          filters:
            branches:
              only: /server\/.*/
```

上記のスニペットでは、`build_server_pdfs` ジョブは、ビルド対象のブランチのパスが "server/" から始まる場合にのみ実行されます。

設定ファイルでの正規表現の使い方の詳細については、[ワークフローに関するページ]({{ site.baseurl }}/ja/2.0/workflows/#using-regular-expressions-to-filter-tags-and-branches)を参照してください。

###### **`branches`**
{: #branches }
{:.no_toc}
branches では、ブランチ名を指す文字列をマップさせるための `only` キーと `ignore` キーが使えます。 スラッシュで囲むことで正規表現でブランチに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。

- `only` を指定した場合、一致するブランチでジョブが実行されます。
- `ignore` を指定した場合、一致するブランチではジョブは実行されません。
- `only` と `ignore` のいずれも指定していない場合、すべてのブランチでジョブが実行されます。
- `only` と `ignore` の両方を指定した場合、`ignore` よりも `only` が先に処理されます。

| キー       | 必須 | タイプ            | 説明                     |
| -------- | -- | -------------- | ---------------------- |
| branches | ×  | マップ            | 実行するブランチを定義するマップ。      |
| only     | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
| ignore   | ×  | 文字列、または文字列のリスト | 単一のブランチ名、またはブランチ名のリスト。 |
{: class="table table-striped"}

###### **`tags`**
{: #tags }
{:.no_toc}

CircleCI は明示的にタグフィルターを指定しない限り、タグに対してワークフローは実行しません。 また、（直接にしろ間接的にしろ）他のジョブの実行が必要なジョブの場合、そのジョブにはタグフィルターの指定が必須となります。

tags では `only` キーと `ignore` キーが使えます。 スラッシュで囲むことで正規表現でタグに一致させたり、そのような文字列のリストでマップさせたりできます。 正規表現は、文字列**全体**に一致する必要があります。 CircleCI では軽量版と注釈付き版のどちらのタグにも対応しています。

- `only` の値にマッチするタグはすべてジョブを実行します。
- `ignore` の値にマッチするタグはすべてジョブを実行しません。
- `only` と `ignore` のどちらも指定していない場合、すべてのタグのジョブがスキップされます。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

| キー     | 必須 | タイプ            | 説明                 |
| ------ | -- | -------------- | ------------------ |
| tags   | ×  | マップ            | 実行するタグを定義するマップ。    |
| only   | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
| ignore | ×  | 文字列、または文字列のリスト | 単一のタグ名、またはタグ名のリスト。 |
{: class="table table-striped"}

詳細については、ワークフローに関するドキュメントの [Git タグを用いてワークフローを実行する]({{ site.baseurl }}/ja/2.0/workflows/#executing-workflows-for-a-git-tag) を参照してください。

###### **`matrix`** (version: 2.1 が必須)
{: #matrix-requires-version-21 }
`matrix` スタンザを使用すると、パラメーター化したジョブを、引数を変えながら複数回実行できます。

**説明**

マトリックス全体（マトリックス内のすべてのジョブ）を `require` とするには、その `alias` を使用します。 `alias`のデフォルトは、起動されるジョブの名前です。

| キー         | 必須 | タイプ  | 説明                                                               |
| ---------- | -- | ---- | ---------------------------------------------------------------- |
| parameters | ○  | マップ  | ジョブの呼び出しで使用するすべてのパラメーター名と値のマップ                                   |
| exclude    | ×  | リスト  | マトリックスから除外する引数マップのリスト                                            |
| alias      | ×  | 文字列型 | マトリックスのエイリアス。別のジョブの `requires` スタンザで使用できます。 デフォルト値は実行するジョブの名前です。 |
{: class="table table-striped"}

**説明:**

以下に、マトリックス ジョブの基本的な使用例を示します。

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

上記コードは 9 つの `build` ジョブに展開されます。

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

###### マトリックスから一部のパラメーターを除外する
{: #excluding-sets-of-parameters-from-a-matrix }
{:.no_toc}
一部の値を_除き_、あらゆる引数の組み合わせについてジョブを実行したいことがあります。 これを行うには、`exclude` スタンザを使用します。

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

上記のマトリックスは、パラメーター `a` と `b` の組み合わせのうち、`{a: 3, b: 5}` の組み合わせを除いた 8 個のジョブに展開されます。

###### 依存関係とマトリックスジョブ
{: #dependencies-and-matrix-jobs }
{:.no_toc}

マトリックス全体 (マトリックス内のすべてのジョブ) に `requires` キーを適用するには、マトリックスの `alias` を指定します。 `alias` のデフォルト値は、呼び出すジョブの名前です。

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

上記の場合、`another-job` を実行するには、マトリックス内の deploy ジョブが完了している必要があります。

また、マトリックス ジョブのパラメーター値を `<< matrix.* >>` で公開し、より複雑なワークフローを作成することもできます。 たとえば、次のコードでは、`deploy` ジョブをマトリックス化したうえで、それぞれのジョブが、`build` マトリックス内の対応するジョブが完了してから実行されるようにしています。

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

上記ワークフローは次のように展開されます。

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

###### **`pre-steps`** と **`post-steps`** (version: 2.1 が必須)
{: #pre-steps-and-post-steps-requires-version-21 }
ワークフローでは、すべてのジョブ呼び出しは、オプションで 2つの特別な引数 `pre-steps` と `post-steps` を受け取ることができます。

`pre-steps` の下のステップは、ジョブ内の他のすべてのステップよりも前に実行されます。 `post-steps` の下のステップは、他のすべてのステップよりも後に実行されます。

事前・事後ステップを使用すると、特定のジョブ内で、そのジョブを変更せずにいくつかのステップを実行できます。 これは、たとえば、ジョブの実行前にカスタムのセットアップステップを実行したいときに便利です。

```yaml
version: 2.1

jobs:
  bar:
    machine:
      image: ubuntu-2004:202107-02
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

CircleCI v2.1 設定ファイルでは、ワークフロー宣言内で真偽値を取る `when` 句を[ロジック ステートメント](https://circleci.com/docs/2.0/configuration-reference/#logic-statements)と共に使用して (逆の条件となる `unless` 句も使用可)、そのワークフローを実行するかどうかを決めることができます。

以下の構成例では、パイプライン パラメーター `run_integration_tests` を使用して `integration_tests` ワークフローの実行を制御しています。

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

この例では、`POST` 本体に以下が含まれた状態でパイプラインがトリガーされたときに、テストが明示的に呼び出されない限りは `integration_tests` ワークフローは実行されないようにしています。

```json
{
    "parameters": {
        "run_integration_tests": true
    }
}
```

Workflows の詳細な例と概念については「[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。

## ロジック ステートメント
{: #logic-statements }

一部のダイナミック コンフィグ機能では、ロジック ステートメントを引数として使用できます。 ロジック ステートメントとは、設定ファイルのコンパイル時 (ワークフローの実行前) に真偽の評価が行われるステートメントです。 ロジック ステートメントには次のものがあります。

| Type                                                                                                | Arguments             | `true` if                              | Example                                                                  |
|-----------------------------------------------------------------------------------------------------+-----------------------+----------------------------------------+--------------------------------------------------------------------------|
| YAML literal                                                                                        | None                  | is truthy                              | `true`/`42`/`"a string"`                                                 |
| YAML alias                                                                                          | None                  | resolves to a truthy value             | *my-alias                                                                |
| [Pipeline Value]({{site.baseurl}}/ja/2.0/pipeline-variables/#pipeline-values)                          | None                  | resolves to a truthy value             | `<< pipeline.git.branch >>`                                              |
| [Pipeline Parameter]({{site.baseurl}}/ja/2.0/pipeline-variables/#pipeline-parameters-in-configuration) | None                  | resolves to a truthy value             | `<< pipeline.parameters.my-parameter >>`                                 |
| and                                                                                                 | N logic statements    | all arguments are truthy               | `and: [ true, true, false ]`                                             |
| or                                                                                                  | N logic statements    | any argument is truthy                 | `or: [ false, true, false ]`                                             |
| not                                                                                                 | 1 logic statement     | the argument is not truthy             | `not: true`                                                              |
| equal                                                                                               | N values              | all arguments evaluate to equal values | `equal: [ 42, << pipeline.number >>]`                                    |
| matches                                                                                             | `pattern` and `value` | `value` matches the `pattern`          | `matches: { pattern: "^feature-.+$", value: << pipeline.git.branch >> }` |
{: class="table table-striped"}

次の論理値は偽とみなされます。

- false
- null
- 0
- NaN
- 空の文字列 ("")
- 引数を持たないステートメント

上記以外の値はすべて真とみなされます。 ただし、空のリストを引数とするロジック ステートメントはバリデーション エラーとなるので注意してください。

ロジック ステートメントの真偽の評価は常に最上位レベルで行われ、必要に応じて強制することもできます。 また、最大 100 レベルの深さまで、引数の仕様に応じた任意の方法でネストできます。

`matches` の `pattern` には、[Java 正規表現](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)を使用します。 パターンは完全一致で指定する必要があります。前方一致は使用できません。 意図せぬ部分一致を防ぐため、パターンは `^` と `$` で囲むことをお勧めします。

**注:** ワークフロー レベルでロジック ステートメントを使用する場合、`condition:` キーは含めないようにしてください (`condition` キーは`ジョブ` レベルのロジック ステートメント以外では必要ありません)。

### ロジック ステートメントの例
{: #logic-statement-examples }

```yaml
workflows:
  my-workflow:
      when:
        or:
          - equal: [ main, << pipeline.git.branch >> ]
          - equal: [ staging, << pipeline.git.branch >> ]

```

```yaml
workflows:
  my-workflow:
    when:
      and:
        - not:
            matches:
              pattern: "^main$"
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

## サンプル設定ファイル全文
{: #example-full-configuration }

{% raw %}
```yaml
version: 2.1
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
          create_jars.sh << pipeline.number >>
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
          name: Deploy if tests pass and branch is Main
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
              only: main

```
{% endraw %}

## 関連項目
{: #see-also }
{:.no_toc}

[イントロダクション]({{site.baseurl}}/ja/2.0/config-intro/)
