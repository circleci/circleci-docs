---
layout: classic-docs
title: "CircleCI を設定する"
short-title: "CircleCI を設定する"
description: ".circleci/config.yml の設定リファレンス"
categories: [configuring-jobs]
order: 20
---

このページでは `config.yml` ファイル内で使える CircleCI 2.0 のコンフィグ用のキーについて解説しています。CircleCI と連携したリポジトリのブランチに `.circleci/config.yml` ファイルが含まれていれば、それは CircleCI 2.x の環境で利用することを意味します。

`config.yml` ファイルの全容はこのページ内の[サンプルコード](#サンプルコード)にありますので、参考にしてください。

**注 :** CircleCI 1.0 から利用していたユーザーは、新たに `config.yml` ファイルを使うことで、以前とは異なるブランチで 2.x 環境におけるビルドを試すことができます。従来の `circle.yml` の設定内容は残るため、`.circleci/config.yml` のないブランチである CircleCI 1.0 環境の実行にも支障はありません。

---

## 目次
{:.no_toc}

* 目次
{:toc}

---

## **`version`**

キー | 必須 | 型 | 説明
----|-----------|------|------------
version | ○ | String | `2`、`2.0`、`2.1` のうちのどれかを指定します。`.circleci/config.yml` ファイルの単純化やコードの再利用、パラメーター付きジョブを実現する 2.1 の新しいキーの解説は「[コンフィグを再利用する]({{ site.baseurl }}/ja/2.0/reusing-config/)」を参照してください。
{: class="table table-striped"}

`version` フィールドは、将来的に非推奨になった場合、もしくは大きな変更があった場合に警告するかどうかの判断に用いられます。

## **`orbs`**（version：2.1 が必須）

キー | 必須 | 型 | 説明
----|-----------|------|------------
orbs | - | Map | ユーザー指定の名前によるマップです。Orb の参照名（文字列）または Orb の定義名（マップ）を指定します。Orb の定義はバージョン 2.1 のコンフィグにおけるサブセットです。詳細は「[Orb を作成する]({{ site.baseurl }}/ja/2.0/creating-orbs/)」を参照してください。
executors | - | Map | Executor の定義文字列のマップです。後述の [executors]({{ site.baseurl }}/ja/2.0/configuration-reference/#executorsversion21-が必須) セクションも参照してください。
commands | - | Map | command を定義するコマンド名のマップです。下記 [commands]({{ site.baseurl }}/ja/2.0/configuration-reference/#commandsversion21-が必須) のセクションを参照してください。
{: class="table table-striped"}

以下の例は認証済みの名前空間 `circleci` 配下にある `hello-build` という Orb のものです。

```
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
`circleci/hello-build@0.0.5` がそもそもの Orb の参照先ですが、この例では `hello` がその Orb の参照名となります。

## **`commands`**（version：2.1 が必須）

commands は、ジョブ内で実行するステップシーケンスをマップとして定義します。これを活用することで、複数のジョブ間で [コマンド定義の再利用]({{ site.baseurl }}/ja/2.0/reusing-config/)が可能になります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
steps | ○ | Sequence | コマンド呼び出し元のジョブ内で実行するステップシーケンスです。
parameters | - | Map | パラメーターキーのマップです。詳細は「[コンフィグを再利用する]({{ site.baseurl }}/ja/2.0/reusing-config/)」内の「[パラメーター構文]({{ site.baseurl }}/ja/2.0/reusing-config/#parameter-syntax)」を参照してください。
description | - | String | コマンドの内容を説明する文章です。
{: class="table table-striped"}

例：

```yaml
commands:
  sayhello:
    description: "デモ用のごく簡単なコマンドです"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

## **`executors`**（version：2.1 が必須）

Executors は、ジョブステップの実行環境を定義するものです。executor を 1 つ定義するだけで複数のジョブで再利用できます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
docker | ○<sup>(1)</sup> | List | docker executor を使用します。指定可能なオプションは[こちら](#docker)。
resource_class | - | String | ジョブの各コンテナに割り当てる CPU の数とメモリ容量を指定します （`docker` Executor でのみ有効）。**注 :** この機能を利用するには有償アカウントが必要です。有償プランをお使いの方は[サポートチケットを作成して](https://support.circleci.com/hc/en-us/requests/new)利用できるようリクエストしてください。
machine | ○<sup>(1)</sup> | Map | machine Executor を使用します。指定可能なオプションは[こちら](#machine)。
macos | ○<sup>(1)</sup> | Map | macOS Executor を使用します。指定可能なオプションは[こちら](#macos)。
shell | - | String | ステップ内のコマンド実行に用いるシェルです。ステップごとに使用する `shell` を変えることもできます（デフォルト：[デフォルトのシェルオプション](#デフォルトのシェルオプション)を参照してください）。
working_directory | - | String | steps を実行する際のディレクトリを指定します。
environment | - | Map | 環境変数の名前と値のマップです。
{: class="table table-striped"}

例：

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
      - run: echo Executor の“外”で定義しました
```

パラメーター付き Executor の例は「[コンフィグを再利用する]({{ site.baseurl }}/ja/2.0/reusing-config/)」の「[Executor でパラメーターを使う](https://circleci.com/docs/ja/2.0/reusing-config/#using-parameters-in-executors)」をご覧ください。

## **`jobs`**

実行処理は 1 つ以上の名前の付いたジョブで構成され、それらのジョブの指定は `jobs` マップで行います。「[config.yml のサンプル]({{ site.baseurl }}/ja/2.0/sample-config/)」では `job` マップの 2 通りの例を紹介しています。マップにおけるキーがジョブの名前となり、値はジョブの中身を記述するマップとします。

[Workflows]({{ site.baseurl }}/ja/2.0/workflows/) を利用する際は、`.circleci/config.yml` ファイル内でユニークなジョブ名を設定してください。

Workflows を **使わない** 場合は、`jobs` マップ内に `build` という名前のジョブを用意します。`build` ジョブは GitHub など VCS によるプッシュをトリガーとして実行する際のデフォルトのエントリーポイントとなります。あるいは、CircleCI API を利用して別のジョブを実行することも可能です。

**注 :**
ジョブの実行可能時間は最大 5 時間となります。ジョブがタイムアウトするようなら、ジョブを並列処理させることも検討してください。

### **<`job_name`>**

1 つ 1 つのジョブはそれぞれ名前となるキーと、値となるマップからなります。ジョブの名前は現在ある `jobs` リスト内でユニークでなければなりません。値となるマップでは下記の属性を使用できます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
docker | ○<sup>(1)</sup> | List | docker Executor を使います。指定可能なオプションは[こちら](#docker)。
machine | ○<sup>(1)</sup> | Map | machine Executor を使います。指定可能なオプションは[こちら](#machine)。
macos | ○<sup>(1)</sup> | Map | macOS Executor を使います。指定可能なオプションは[こちら](#macos)。
shell | - | String | すべてのステップ内のコマンド実行に用いるシェルです。ステップごとに使用する `shell` を変えることも可能です（デフォルト：[デフォルトのシェルオプション](#デフォルトのシェルオプション)を参照してください）。
steps | ○ | List | [実行内容](#steps)のリストを設定します。
working_directory | - | String | steps を実行する際のディレクトリを指定します。デフォルトは `~/project` となります（この `project` は文字列リテラルで、特定のプロジェクト名ではありません）。ジョブ内の実行プロセスは、このディレクトリを参照するために環境変数 `$CIRCLE_WORKING_DIRECTORY` を使えます。**注 :** YAML ファイルに記述したパスは展開 *されません*。仮に `store_test_results.path` が `$CIRCLE_WORKING_DIRECTORY/tests` と設定されていたとしても、CircleCI はそのまま `$CIRCLE_WORKING_DIRECTORY` という `$` 記号付きの文字列のディレクトリ内に、サブディレクトリ `test` を格納しようとします。
parallelism | – | Integer | このジョブの並列処理の数を指定します（デフォルト：1）。
environment | - | Map | 環境変数の名前と値のマップを設定します。
branches | - | Map | Workflows でもバージョン 2.1 のコンフィグでも **ない** 単一のジョブにおいて、ホワイトリスト・ブラックリスト方式で特定のブランチの実行ルールを決めるためのマップを設定します（デフォルト：すべてホワイトリストとして扱います）。 Workflows やバージョン 2.1 のコンフィグにおけるジョブやブランチに関する設定については [Workflows](#workflows) を参照してください。
resource_class | - | String | ジョブの各コンテナに割り当てる CPU の数とメモリ容量を指定します。（`docker` Executor でのみ有効）。**注 :** この機能を利用するには有償アカウントが必要です。 有償プランをお使いの方は[サポートチケットを作成して](https://support.circleci.com/hc/en-us/requests/new)利用できるようリクエストしてください。
{: class="table table-striped"}

<sup>(1)</sup> 指定できるのはこれらのうちいずれか 1 つです。2 つ以上指定した場合はエラーとなります。

#### `environment`
環境変数の名前と値のマップです。CircleCI の設定画面でセットした環境変数を上書きするのに使えます。

#### `parallelism`

`parallelism` の値を 2 以上に設定すると、Executor が設定した数だけ起動し、そのジョブのステップを並列実行します。ただし、並列処理するように設定していても 1 つの Executor でしか実行されない場合もあります（[`deploy` ステップ](#deploy) がその一例です）。詳しくは[パラレルジョブ]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)を参照してください。

`working_directory` で指定したディレクトリが存在しないときは自動で作成されます。

例：

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
    branches:
      only:
        - master
        - /rc-.*/
    steps:
      - run: make test
      - run: make
```

#### **`docker`** / **`machine`** / **`macos`**（*Executor*）

「Executor」は、端的に言えば「ステップを処理する場所」です。CircleCI 2.0 では Executor として一度に必要な分の Docker コンテナを起動するか、仮想マシンを利用することで、最適な環境を構築できます。詳しくは「[Executor タイプを選択する]({{ site.baseurl }}/ja/2.0/executor-types/)」を参照してください。

#### `docker`
{:.no_toc}

`docker` キーは下記の要素を用いて設定します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
image | ○ | String | 使用するカスタム Docker イメージの名前を指定します。
name | - | String | 他から参照する際のコンテナの名前を指定します。デフォルトではコンテナサービスには `localhost` 経由でアクセスできます。
entrypoint | - | String / List | コンテナ起動時に実行するコマンドを指定します。
command | - | String / List | コンテナ起動時にルートプロセスとなる PID 1（または entrypoint の引数）にするコマンドを指定します。
user | - | String | Docker コンテナにおいてコマンドを実行するユーザー名を指定します。
environment | - | Map | 環境変数の名前と値のマップを設定します。
auth | - | Map | 標準の `docker login` 証明書によるレジストリの認証情報を記述します。
aws_auth | - | Map | AWS EC2 Container Registry（ECR）の認証情報を記述します。
{: class="table table-striped"}

一番最初に記述した `image` は、すべてのステップを実行するプライマリコンテナとなります。

`entrypoint` は Dockerfile のデフォルトのエントリーポイントを上書きします。

`command` は、（Dockerfile で指定していれば）イメージのエントリーポイントに対する引数として使われます。もしくは、（このスコープや Dockerfile 内にエントリーポイントがない場合は）実行形式として扱われます。

[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)（最初に宣言されたもの）において `command` の指定がない場合は、`command` とイメージエントリーポイントは無視されます。これは、エントリーポイントの実行可能ファイルがリソースを過大に消費したり、予期せず終了したりするのを防ぐためです。現在のところは、`steps` は常にプライマリコンテナ内でのみ実行されます。

`name` では、セカンダリサービスコンテナにアクセスする際の名前を定義します。デフォルトはどのサービスも `localhost` 上で直接見える状態になっています。これは、例えば同じサービスのバージョン違いを複数立ち上げるときなど、localhost とは別のホスト名を使いたい場合に役立ちます。

`environment` の設定は、初期化用の `command` も含め、この Executor におけるすべてのコマンド実行で有効です。`environment` による設定はジョブのマップにおいて何よりも優先されます。

タグやハッシュ値でイメージのバージョンを指定することもできます。公式の Docker レジストリ（デフォルトは Docker Hub）のパブリックイメージはどんなものでも自由に使えます。詳しくは「[Executor タイプ]({{ site.baseurl }}/ja/2.0/executor-types)」を参照してください。

例：

```yaml
obs:
  build:
    docker:
      - image: buildpack-deps:trusty # プライマリコンテナ
        environment:
          ENV: CI

      - image: mongo:2.6.8
        command: [--smallfiles]

      - image: postgres:9.4.1
        environment:
          POSTGRES_USER: root

      - image: redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673
```

プライベートな Docker イメージを利用するときは、`auth` を使ってユーザー名とパスワードを指定できます。パスワード保護を目的に、下記のようにプロジェクトの設定値としてセットしておくこともできます。

```yaml
jobs:
  build:
    docker:
      - image: acme-private/private-image:321
        auth:
          username: mydockerhub-user  # 文字列リテラル値を指定するか
          password: $DOCKERHUB_PASSWORD  # プロジェクト設定の環境変数を指定する
```

[AWS ECR](https://aws.amazon.com/ecr/) にホストしているイメージを使うには AWS 認証情報での認証が必要です。デフォルトでは CircleCI のプロジェクト設定画面にある「AWS Permissions」に追加した AWS 認証情報、またはプロジェクト環境変数 `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を使います。下記のように `aws_auth` フィールドを用いて認証情報をセットすることも可能です。

```
jobs:
  build:
    docker:
      - image: account-id.dkr.ecr.us-east-1.amazonaws.com/org/repo:0.1
        aws_auth:
          aws_access_key_id: AKIAQWERVA  # 文字列リテラル値を指定するか
          aws_secret_access_key: $ECR_AWS_SECRET_ACCESS_KEY  # プロジェクト設定の環境変数を指定する
```

バージョン 2.1 のコンフィグでは、ジョブにおいて[宣言済みコマンド]({{ site.baseurl }}/ja/2.0/reusing-config/)の再利用が可能です。下記の例では `sayhello` コマンドを呼び出しています。

```
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

#### **`machine`**
{:.no_toc}

[machine Executor]({{ site.baseurl }}/ja/2.0/executor-types) は `machine` キーとともに下記の要素を用いて設定します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
enabled | - | Boolean | `machine` Executor 使用時は必ず true とします。他に値の指定がないときは必須です。
image | – | String | 使用するイメージを指定します（デフォルト：`circleci/classic:latest`）。**注 :** プライベート環境の CircleCI はこのキーをサポートして **いません**。プライベート環境における `michine` Executor のイメージカスタマイズに関する詳細は、「[VM サービス]({{ site.baseurl }}/ja/2.0/vm-service)」を参照してください。
docker_layer_caching | - | Boolean | [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)を有効にするには `true` とします。**注 :** Docker レイヤーキャッシュの利用には追加の料金がかかります。この機能を有効にするには、サポートチケットを使って CircleCI のセールスチームに問い合わせてください。
{: class="table table-striped"}

`machine` キーに `true` をセットする際には、より簡単な記述方法が使えます。

例：

```YAML
jobs:
  build:
    machine:
      enabled: true

# もしくは単に以下のようにします

jobs:
  build:
    machine: true
```

CircleCI は `image` フィールドにおいて複数の machine イメージの指定をサポートしています。

* `circleci/classic:latest`（デフォルト）：Docker v`17.09.0-ce` と docker-compose v`1.14.0`、それと CircleCI 1.0 のビルドイメージに含まれる共通言語ツールを含んだ Ubuntu v`14.04` のイメージです。`latest` イメージに更新があるときは 1 週間前までに[アナウンス](https://discuss.circleci.com/t/how-to-subscribe-to-announcements-and-notifications-from-circleci-email-rss-json/5616)されます。
* `circleci/classic:edge` – Docker v`17.10.0-ce` と docker-compose v`1.16.1`、それと CircleCI 1.0 のビルドイメージに含まれる共通言語ツールを含んだ Ubuntu v`14.04` のイメージです。
* `circleci/classic:201703-01` – docker 17.03.0-ce, docker-compose 1.9.0
* `circleci/classic:201707-01` – docker 17.06.0-ce, docker-compose 1.14.0
* `circleci/classic:201708-01` – docker 17.06.1-ce, docker-compose 1.14.0
* `circleci/classic:201709-01` – docker 17.07.0-ce, docker-compose 1.14.0
* `circleci/classic:201710-01` – docker 17.09.0-ce, docker-compose 1.14.0
* `circleci/classic:201710-02` – docker 17.10.0-ce, docker-compose 1.16.1
* `circleci/classic:201711-01` – docker 17.11.0-ce, docker-compose 1.17.1
* `circleci/classic:201808-01` – docker 18.06.0-ce, docker-compose 1.22.0
* `ubuntu-1604:201903-01` – Ubuntu 16.04, docker 18.09.3, docker-compose 1.23.1


**例 :** Docker v`17.06.1-ce` と docker-compose v`1.14.0` を含む Ubuntu v`14.04` のイメージを使う場合

```yaml
version: 2
jobs:
  build:
    machine:
      image: circleci/classic:201708-01
```

machine Executor は、ジョブや Workflows で Docker イメージをビルドする際に効果的な [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching)をサポートしています。

**例 :**

```yaml
version: 2
jobs:
  build:
    machine:
      docker_layer_caching: true    # デフォルト：false
```

#### **`macos`**
{:.no_toc}

CircleCI は [macOS](https://developer.apple.com/macos/) 上でのジョブ実行をサポートしています。macOS アプリケーションや [iOS](https://developer.apple.com/ios/) アプリ、[tvOS](https://developer.apple.com/tvos/) アプリ、さらには [watchOS](https://developer.apple.com/watchos/) アプリのビルド、テスト、デプロイが可能です。macOS 仮想マシン上でジョブを実行するには、ジョブ設定の最上位に `macos` キーを追加し、使いたい Xcode のバージョンを指定します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
xcode | ○ | String | 仮想マシンにインストールしている Xcode のバージョンを指定します。利用可能なバージョンについては「iOS アプリをテストする」の「[サポートしている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」を参照してください。
{: class="table table-striped"}

**例 :** macOS 仮想マシンを Xcode v`9.0` で使う場合

```yaml
jobs:
  build:
    macos:
      xcode: "9.0"
```

#### **`branches`**

Workflows を利用 **せず**、バージョン 2.0（2.1 ではなく）のコンフィグを使っているケースでは、ブランチの実行をホワイトリスト・ブラックリスト方式で定義できます。[Workflows]({{ site.baseurl }}/ja/2.0/workflows/#workflows-におけるコンテキストとフィルターの使い方) を使っている場合はジョブレベルの branches は無視されるため、利用する `config.yml` ファイルの Workflows セクション内で設定します。バージョン 2.1 のコンフィグでは、Workflows を追加することでフィルタリングが可能です。詳しくは後述の [workflows](#workflows) を参照してください。ジョブレベルの `branches` キーは下記の要素を用いて設定します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
only | - | List | 実行するブランチのみを列挙します。
ignore | - | List | 実行しないブランチを列挙します。
{: class="table table-striped"}

`only` や `ignore` に記述する内容は、完全一致のフルネームおよび正規表現で表すことができます。正規表現では文字列 **全体** にマッチさせる形にしなければなりません。例えば下記のようにします。

``` YAML
jobs:
  build:
    branches:
      only:
        - master
        - /rc-.*/
```

このケースでは「master」ブランチと正規表現 "rc-.*" にマッチするブランチのみが実行されます。

``` YAML
jobs:
  build:
    branches:
      ignore:
        - develop
        - /feature-.*/
```

上記の例では "develop" と正規表現 "feature-.*" にマッチしたもの以外のすべてのブランチが実行されます。

`ignore` と `only` の両方が同時に指定されていた場合は、`ignore` に関するフィルターのみが考慮されます。

コンフィグのルール設定によって実行されなかったジョブは、実行がスキップされたとして CircleCI の画面上に履歴表示されます。

#### **`resource_class`**

**注 :** この機能を有効にするには、[サポートチケットを使って](https://support.circleci.com/hc/en-us/requests/new) CircleCI のセールスチームに問い合わせてください。

お使いの有償プランにこの機能が追加されると、ジョブごとに CPUの数 とメモリ容量を設定できるようになります。利用可能なマシンリソースは下記の表の通りです。`resource_class` を指定しない場合、もしくは指定した class が正しくないときは、デフォルトの `resource_class: medium` が指定されたものとみなされます。`resource_class` キーは現在のところ `docker` Executor との組み合わせのみサポートしています。

クラス | 仮想CPU数 | メモリ容量
------------|-----------|------
small | 1 | 2GB
medium（デフォルト） | 2 | 4GB
medium+ | 3 | 6GB
large | 4 | 8GB
xlarge | 8 | 16GB
{: class="table table-striped"}

`/proc` ディレクトリをチェックして CPU 数を取得する Java や Erlang などの言語においては、CircleCI 2.0 の resource_class 機能の使用時にパフォーマンスが低下する問題があることから、これを回避するため追加の設定が必要になる場合があります。 この問題は使用する CPU コアを 32 個要求したときに発生するもので、1 コアをリクエストしたときよりも実行速度が低下します。 該当する言語を使用しているユーザーは、問題が起こらないよう CPU コア数を決まった範囲に固定するなどして対処してください。

#### **`steps`**

ジョブにおける `steps` の設定は、キーと値のペアを 1 つずつ列挙する形で行います。キーはステップのタイプを表し、値は設定内容を記述するマップか文字列（ステップのタイプによって異なる）のどちらかになります。 下記はマップを記述する場合の例です。

```yaml
jobs:
  build:
    working_directory: ~/canary-python
    environment:
      FOO: bar
    steps:
      - run:
          name: Running tests
          command: make test
```

ここでは `run` がステップのタイプとなります。 `name` 属性は CircleCI 上での表示に使われるものです。`command` 属性は `run` ステップに特有の、実行するコマンドを定義するものです。

場合によっては steps をより簡便に記述できます。例えば `run` ステップを下記のように記述することが可能です。

```
jobs:
  build:
    steps:
      - run: make test
```

簡略化した表記方法では、実行する `command` を文字列値のようにして、`run` ステップをダイレクトに指定できるようになります。このとき、省略された他の属性に対してはデフォルトの値が自動で設定されます（例えば `name` 属性には `command` と同じ値が設定されます）。

もう 1 つ、キーと値のペアの代わりにステップ名を文字列として使うシンプルな方法もあります。

```
jobs:
  build:
    steps:
      - checkout
```

この例の `checkout` ステップは、プロジェクトのソースコードをジョブの [`working_directory`](#jobs) にチェックアウトします。

通常、ステップは下記にある通りに記述します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
&lt;step_type> | ○ | Map / String | ステップの設定マップ、またはステップで定義された内容を表す文字列を設定します。
{: class="table table-striped"}

ステップのなかで利用可能な要素の詳細は下記の通りです。

##### **`run`**

あらゆるコマンドラインプログラムを呼び出すのに使います。設定値を表すマップを記述するか、簡略化した表記方法では、`command` や `name` として扱われる文字列を記述します。run コマンドはデフォルトでは非ログインシェルで実行されます。そのため、いわゆる dotfiles をコマンド内で明示的に指定するといった工夫が必要になります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
command | ○ | String | シェルを通じて実行するコマンドを指定します。
name | - | String | CircleCI 上で表示するステップのタイトル名を指定します（デフォルト：`command` 文字列全体)。
shell | - | String | コマンド実行に用いるシェルを指定します（デフォルト：[デフォルトのシェルオプション](#デフォルトのシェルオプション)）。
environment | - | Map | コマンドへのローカルスコープとなる追加の環境変数を設定します。
background | - | Boolean | このステップをバックグラウンドで実行するかどうかを設定します（デフォルト：false）。
working_directory | - | String | このステップを実行するディレクトリを指定します（デフォルト：当該ジョブの[`working_directory`](#jobs)）。
no_output_timeout | - | String | 出力のないコマンドの実行持続可能時間を指定します。「20m」「1.25h」「5s」のように、時間単位付きの十進数で指定します（デフォルト：10分間）。
when | - | String | [ステップの実行を有効・無効にする条件を指定します](#when-属性)。次の値のうちいずれかを指定してください。`always`/`on_success`/`on_fail`（デフォルト：`on_success`）
{: class="table table-striped"}

`run` を宣言するたびに新たなシェルが立ち上がることになります。複数行の `command` を指定し、それらを同一のシェル内で実行することも可能です。

``` YAML
- run:
    command: |
      echo Running test
      mkdir -p /tmp/test-results
      make test
```

###### _デフォルトのシェルオプション_

ビルドコンテナに `/bin/bash` がある場合、シェルオプションのデフォルト値は `/bin/bash -eo pipefail` となります。それ以外のパターンでは `/bin/sh -eo pipefail` がデフォルト値となります。 デフォルトは非ログインシェルです（`--login` や `-l` はデフォルトでは付加されません）。そのため、デフォルトのシェルは `~/.bash_profile` や `~/.bash_login`、`~/.profile` といったファイルを読み込み **ません**。`-eo pipefail` というオプションの意味については下記の通りです。

`-e`

> （単一のコマンドからなる）パイプやカッコ「()」で囲まれたサブシェルコマンドが実行されたら、あるいは中カッコ「{}」で囲まれたコマンドリストの一部がゼロ以外の終了ステータスを返したら、即座に終了します。

つまり、先述の例で `mkdir` によるディレクトリ作成が失敗し、ゼロ以外の終了ステータスを返したときは、コマンドの実行は中断され、ステップ全体としては失敗として扱われることになります。それとは反対の挙動にしたいときは、`command` に `set +e` を追加するか、`run` のコンフィグマップでデフォルトの `shell` を上書きします。例えば下記のようにします。
```YAML
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

> pipefail を有効にした場合は、パイプの返り値は最後に実行されたコマンド（通常は最も右に記述したもの）のゼロ以外の終了ステータス値となります。全てのコマンドが成功したときはゼロが返ります。シェルは値を返す前に、パイプにある全てのコマンドが終了するまで待機します。

例えば下記のようにします。
```YAML
- run: make test | tee test-output.log
```

ここで仮に `make test` が失敗したとすると、`-o pipefail` オプションによりステップ全体が失敗したことになります。`-o pipefail` がなければ、このステップは常に成功することになります。パイプ全体の結果としては、必ずゼロを返す最後のコマンド（`tee test-output.log`）の返り値で決まるためです。

`make test` が失敗したとしても、パイプの残りの部分が実行されることに注意してください。

このような動作を避けたい場合は、コマンドで `set +o pipefail` を指定するか、`shell` 全体を（最初の例のように）書き換えてください。

通常はデフォルトのオプション（`-eo pipefail`）を使うことを推奨しています。こうすることで、途中のコマンドでエラーがあっても気付くことができ、ジョブが失敗したときのデバッグも容易になります。CircleCI 上では `run` ステップごとに使用したシェルとアクティブなオプションを表示する便利な機能もあります。

詳細は「[シェルスクリプトを使う]({{ site.baseurl }}/ja/2.0/using-shell-scripts/)」を参照してください。

###### _background コマンド_

`background` 属性はコマンドをバックグラウンドで実行するように設定するものです。`background` 属性を `true` にセットすることで、ジョブ実行においてコマンドの終了を待つことなく、即座に次のステップへと処理を移します。下記の例は Selenium のテスト時によく必要となる、バックグラウンドで X virtual framebuffer を実行するためのコンフィグです。

```YAML
- run:
    name: Running X virtual framebuffer
    command: Xvfb :99 -screen 0 1280x1024x24
    background: true

- run: make test
```

###### _簡略化した構文_

`run` ステップでは大変便利な簡略化構文を利用できます。

```YAML
- run: make test

# 簡略化したうえで複数行のコマンドを実行
- run: |
    mkdir -p /tmp/test-results
    make test
```
この例では、`command` と `name` には `run` の文字列値が割り当てられたのと同等となり、`run` におけるコンフィグマップの残りにはデフォルト値が設定されます。

###### `when` 属性

デフォルトでは、CircleCI は `config.yml` で定義された順序通り、ステップが失敗するまで（ゼロ以外の終了コードを返すまで）ジョブステップを 1 つずつ実行します。コマンドが失敗すると、それ以降のジョブステップは実行されません。

`when` 属性を追加することで、このデフォルトのジョブステップの挙動を変えることができます。ジョブのステータスに応じてステップを続行するか、スキップするかを選択することも可能になります。

デフォルト値である `on_success` は、それまでのステップが全て成功している（終了コード 0 を返した）ときのみ処理を続けます。

`always` はそれまでのステップの終了ステータスにかかわらず処理を続けます。前のステップが成功したか否かに関係なく処理を続けたいタスクがあるときに役立つ設定です。例えば、ログやコードカバレッジのデータをどこかのサーバーにアップロードするようなジョブ
ステップに利用できます。

`on_fail` は直前のステップが失敗した（ゼロ以外の終了コードを返した）ときにのみ処理を続行するものです。デバッグを支援するなんらかの診断データを保存したいとき、あるいはメールやチャットなどで失敗に関する通知をしたいときなどに `on_fail` が使えます。

###### 例

```yaml
steps:
  - run:
      name: Testing application
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
      name: Upload Failed Tests
      command: curl --data fail_tests.log http://example.com/error_logs
      when: on_fail
```

##### **`when` ステップ**（version：2.1 が必須）

`when` キーや `unless` キーを使うことで条件付きのステップを作ることができます。`when` キー配下ではサブキーとして `condition` と `steps` が使えます。`when` ステップの用途として考えられるのは、事前に Workflows を実行して確認した（コンパイルの時点で決定される）条件に基づいて実行するために、コマンドとジョブの設定をカスタマイズする、といったものです。詳細は「コンフィグを再利用する」の[「条件付きステップ」]({{ site.baseurl }}/ja/2.0/reusing-config/#defining-conditional-steps)を参照してください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
condition | ○ | String | パラメーター値を指定します。
steps | ○ | Sequence | condition が true の時に実行するステップの内容を設定します。
{: class="table table-striped"}

###### *例*

```
version: 2.1

jobs: # 条件付きステップは「commands:」でも定義できる
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

設定済み `path`（デフォルトは `working_directory`）にあるソースコードのチェックアウトに用いる特殊なステップです。コードのチェックアウトを簡単にすることを目的にしたヘルパー関数である、というのが特殊としている理由です。HTTPS 経由で git を実行する場合はこのステップは使えません。ssh 経由でチェックアウトするのと同じ設定を行う必要があります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
path | - | String | チェックアウトディレクトリを指定します（デフォルト：ジョブの [`working_directory`](#jobs)）。
{: class="table table-striped"}

`path` が存在し、かつソースコードが git リポジトリの場合：
 * ステップはリポジトリ全体をクローンせず、オリジナルをプルします。
 * 同様の条件で git リポジトリ以外の場合は、このステップは失敗します。

単純に `checkout` する場合は、ステップタイプは属性なしで文字列を記述するだけです。

```YAML
- checkout
```

**注 :** CircleCI はサブモジュールのチェックアウトは行いません。そのプロジェクトにサブモジュールが必要なときは、下記の例のように適切なコマンドを実行する `run` ステップを追加してください。

```YAML
- checkout
- run: git submodule sync
- run: git submodule update --init
```

**注 :** `checkout` ステップは git がガベージコレクションをスキップするように設定します。[restore_cache](#restore_cache) キーで `.git` ディレクトリをキャッシュしていて、そのディレクトリ配下のデータ量を最小限にするのにガベージコレクションも実行したい場合は、先に [run](#run) ステップで `git gc` コマンドを実行しておく方法があります。

##### **`setup_remote_docker`**

Docker コマンド実行用のリモート Docker 環境を作成します。詳細は「[Docker コマンドを実行する]({{ site.baseurl }}/ja/2.0/building-docker-images/)」を参照してください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
docker_layer_caching | - | boolean | リモート Docker 環境で [Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/2.0/docker-layer-caching/) を有効にするには、この値を `true` にセットします（デフォルト：`false`）。
{: class="table table-striped"}

***補足***
- Docker レイヤーキャッシュを利用するには有償アカウントが必要です。有償プランをお使いの方は[サポートチケットを作成して](https://support.circleci.com/hc/en-us/requests/new)利用できるようリクエストしてください。リクエストの際には該当するプロジェクトへのリンクもお送りください。
- `setup_remote_docker` は `machine` Executor との互換性がありません。`machine` Executor における Docker レイヤーキャッシングの方法について、詳細は「Docker レイヤーキャッシング」の「[Machine Executor]({{ site.baseurl }}/ja/2.0/docker-layer-caching/#machine-executor)」を参照してください。

##### **`save_cache`**

CircleCI のオブジェクトストレージにある、依存関係やソースコードのようなファイル、ディレクトリのキャッシュを生成し、保存します。キャッシュはその後のジョブで[復元](#restore_cache)することができます。詳しくは「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」をご覧ください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
paths | ○ | List | キャッシュに追加するディレクトリのリストを指定します。
key | ○ | String | キャッシュ識別用のユニーク ID を指定します。
name | - | String | CircleCI の画面上にタイトル表示するステップの名前を指定します（デフォルト：Saving Cache）。
when | - | String | ステップの実行を有効・無効にする[条件](#when-属性)を指定します。次の値のうちいずれかを指定してください。`always`/`on_success`/`on_fail`（デフォルト：`on_success`）
{: class="table table-striped"}

`key` で割り当てたキャッシュは、一度書き込むと書き換えられません。

**注 :** `key` で指定されたキャッシュがすでに存在していると、書き換えられないまま次のジョブステップの処理に移ります。

キャッシュを新たに保存するときは、特殊なテンプレートを含む形で `key` の値を指定することも可能です。

テンプレート | 解説
----|----------
{% raw %}`{{ .Branch }}`{% endraw %} | 現在ビルドを実行しているバージョン管理システムのブランチ名。
{% raw %}`{{ .BuildNum }}`{% endraw %} | 実行中のビルドにおける CircleCI のビルド番号。
{% raw %}`{{ .Revision }}`{% endraw %}| 現在ビルドを実行しているバージョン管理システムのリビジョン。
{% raw %}`{{ .CheckoutKey }}`{% endraw %} | リポジトリのチェックアウトに使用する SSH 鍵。
{% raw %}`{{ .Environment.variableName }}`{% endraw %} | `variableName`で示される環境変数 ([定義済み環境変数](https://circleci.com/docs/ja/2.0/env-vars/#circleci-environment-variable-descriptions) 、もしくは[コンテキスト](https://circleci.com/docs/ja/2.0/contexts)を指定できますが、ユーザー定義の環境変数は使えません)。
{% raw %}`{{ checksum "filename" }}`{% endraw %} | filename のファイル内容の SHA256 ハッシュ値を base64 エンコードした値。このファイルはリポジトリでコミットしたものであり、かつ現在の作業ディレクトリからの絶対・相対パスで指定する必要があります。`package.json` や `pom.xml`、`project.clj` のような依存関係を記したマニフェストファイルをここで指定すると便利です。 `restore_cache` と `save_cache` の間でこのファイルが変化しないのが重要なポイントです。ファイル内容が変化すると、`restore_cache` のタイミングで使われるファイルとは異なるキャッシュキーを元にしてキャッシュを保存するためです。
{% raw %}`{{ epoch }}`{% endraw %} | UNIX 時間（1970 年 1 月 1 日午前 0 時 0 分 0 秒）から現在までの経過時間を表す秒数。
{% raw %}`{{ arch }}`{% endraw %} | OS と CPU の種類。 OS や CPU アーキテクチャに合わせてコンパイル済みバイナリをキャッシュするような場合に用います。`darwin amd64` あるいは `linux i386/32-bit` のような文字列になります。
{: class="table table-striped"}

ステップの処理では、以上のようなテンプレートの部分は実行時に値が置き換えられ、その置換後の文字列が`キー`の値として使われます。

テンプレートの使用例：
 * {% raw %}`myapp-{{ checksum "package.json" }}`{% endraw %} `package.json` ファイルの内容が変わるたびにキャッシュが毎回生成されます。このプロジェクトの別のブランチも同じキャッシュキーを生成します。
 * {% raw %}`myapp-{{ .Branch }}-{{ checksum "package.json" }}`{% endraw %} - ファイル内容が変わるたびにキャッシュが毎回生成されます。ただし、こちらはブランチごとに別のキャッシュを生成します。
 * {% raw %}`myapp-{{ epoch }}`{% endraw %} - ジョブを実行するたびに新たにキャッシュを生成します。

キャッシュの `key` にテンプレート値を埋め込む場合、キャッシュの保存に制限がかかることに注意してください。CircleCI のストレージにキャッシュをアップロードするのに通常より時間がかかります。そのため、実際に変更があったときにのみ新しいキャッシュを生成し、ジョブ実行のたびに新たなキャッシュを作らないように `key` を使うのがコツです。

<div class="alert alert-info" role="alert">
<b>ヒント：</b>キャッシュがイミュータブルということもあるため、キャッシュキー名の先頭にバージョン名などを入れておくと管理がしやすいです。例えば <code class="highlighter-rouge">v1-...</code> のようにします。こうすることでプレフィックスのバージョンの数字を増やしていくだけで全キャッシュを 1 から再生成できることになります。
</div>

###### _例_

{% raw %}
```YAML
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /home/ubuntu/.m2
```
{% endraw %}

##### **`restore_cache`**

`key` に設定されている内容を元に、あらかじめ保存されていたキャッシュを復元します。先に [`save_cache` ステップ](#save_cache)を利用して、この key に該当するキャッシュを保存しておかなければなりません。詳しくは「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」をご覧ください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
key | ○ <sup>(1)</sup> | String | 復元するキャッシュキーを（1 つだけ）指定します。
keys | ○ <sup>(1)</sup> | List | 復元するキャッシュを探索するためのキャッシュキーのリストを指定します。ただし最初にマッチしたキーのみが復元されます。
name | - | String | CircleCI の画面上にタイトル表示するステップの名前を指定します（デフォルト：Restoring Cache）。
{: class="table table-striped"}

<sup>(1)</sup>いずれか 1 つの属性のみ指定します。`key` と `keys` の両方が指定されたときは、`key` の内容がまず始めに検証され、次に `keys` の内容が検証されます。

存在するキーを対象に、前方一致で検索が実行されることになります。

**注 :** 一致するものが複数あった場合、マッチ度合いの高いものが他にあったとしても、一番最後に一致したものが使われます。

例えば下記のようにします。

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

この例では、`v1-myapp-cache-new` で示したキャッシュが復元されます。最初のキー（`v1-myapp-cache`）にもマッチはしていますが、後の方のキーが `v1-myapp-cache` というプレフィックスで検索したときに一番最後にマッチしたものになるからです。

key の詳しい書式については、[`save_cache` ステップ](#save_cache)の `key` セクションをご覧ください。

CircleCI が `keys` のリストを処理するときは、最初にマッチした既存のキャッシュを復元します。もっと別の条件を加えて特定のキー（`package.json` ファイルの実在するバージョンのキャッシュなど）に狙ってマッチさせたい、あるいはもっと幅広く（プロジェクト内の全キャッシュなどと）マッチさせたいと思うかもしれません。キーに該当するキャッシュが 1 つもない場合は、警告とともにステップはスキップされます。

元々のキャッシュの保存場所に復元されるため、restore_cache では path の指定は不要です。

###### 例

{% raw %}
```YAML
- restore_cache:
    keys:
      - v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
      # 「project.clj」の本来のバージョンのキャッシュが見つからなかったら、今あるなかで最新のキャッシュを使う
      - v1-myapp-

# ... アプリケーションのビルドやテストのステップをここに記述する

# キャッシュは「project.clj」のバージョンごとに一度だけ保存する
- save_cache:
    key: v1-myapp-{{ arch }}-{{ checksum "project.clj" }}
    paths:
      - /foo
```
{% endraw %}

##### **`deploy`**

artifact のデプロイを行う特殊なステップです。

`deploy` は [`run`](#run)  ステップと同様のコンフィグマップなどを用いて設定します。ジョブには 2 つ以上の `deploy` ステップを含む場合もあります。

通常 `deploy` ステップは 2 つの例外を除き `run` と似た形で動作します。

- `parallelism` を使ったジョブの場合、`deploy` ステップは他のすべてのノードが成功した場合にのみ、ノード番号 0 として実行されます。 ノード番号 0 以外はステップを実行しません。
- SSHを利用したジョブを実行した場合、 `deploy` ステップは実行されません。代わりに以下のアクションが表示されます。
  > **skipping deploy**  
  > Running in SSH mode.  Avoid deploying.


###### 例

```YAML
- deploy:
    command: |
      if [ "${CIRCLE_BRANCH}" == "master" ]; then
        ansible-playbook site.yml
      fi
```

##### **`store_artifacts`**

Web アプリケーションや API を通じて使う artifacts（ログ、バイナリなど）を保存するステップです。詳しくは「[artifacts をアップロードする]({{ site.baseurl }}/ja/2.0/artifacts/)」を参照してください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
path | ○ | String | ジョブで作成した artifacts の保存先となるプライマリコンテナ内のディレクトリを指定します。
destination | - | String | artifacts の API において artifacts の保存先パスに付加するプレフィックスを指定します（デフォルト：`path` で指定したファイルディレクトリ）。
{: class="table table-striped"}

ジョブでは複数の `store_artifacts` ステップを指定することもできます。ファイルが上書きされたりしないよう、ステップごとにユニークなプレフィックスを追加するようにしてください。

###### 例

```YAML
- store_artifacts:
    path: /code/test-results
    destination: prefix
```

##### **`store_test_results`**

テスト結果をアップロードするのに利用する特殊なステップです。これによってテスト結果は Builds ページの [Test Summary] タブに表示され、テストのタイミング解析などに用いることができます。 [**store_artifacts** ステップ](#store_artifacts)を使うことで、テスト結果をビルドの artifact ファイルとして出力することもできます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
path | ○ | String | JUnit XML のサブディレクトリや Cucumber JSON のテストメタデータが含まれるディレクトリへのパス（`working_directory`に対する絶対もしくは相対パス）を指定します。
{: class="table table-striped"}

**注 :** `store_test_results` で指定したパスの **サブディレクトリ** にテスト結果を保存するようにしてください。CircleCI 上でテストリポートの推測がしやすくなるよう、ユーザー独自のテストスイートの名前に合わせてディレクトリを命名するが理想です。サブディレクトリに保存しないときは、CircleCI 上の [Test Summary] タブでテストリポートをチェックします。この場合は `Your build ran 71 tests in unknown` のような表示になります。適切な名前のサブディレクトリに保存した場合は、`Your build ran 71 tests in rspec` のようになります。

###### _例_

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

`config.yml` の構文：

```YAML
- store_test_results:
    path: test-results
```

##### **`persist_to_workspace`**

Workflows の実行時に、他のジョブが使っていた一時ファイルを保持しておくための特殊なステップです。

**注 :** Workspace はファイル作成後 30 日間保存されます。30 日以上経過後もジョブで Workspace を使おうとすると、Workflows の一部の再実行や SSH 経由の個別ジョブの実行はいずれも失敗します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
root | ○ | String | `working_directory`に対する絶対パスまたは相対パスを指定します。
paths | ○ | List | ファイルを特定するグロブ（ワイルドカードなど）、または共有 Workspace に付加するディレクトリパス（グロブ不可）を指定します。Workspace のルートディレクトリへの相対パスと見なされ、 Workspace のルートディレクトリそのものにすることはできません。
{: class="table table-striped"}

root キーは Workspace のルートディレクトリとなるコンテナ内のディレクトリを指します。一方、paths の値は必ずルートへの相対ディレクトリとなります。

##### _root キーの使用例_

下記の構文は `/tmp/dir` 内にある paths で指定している内容を、Workspace の `/tmp/dir` ディレクトリ内に相対パスで保持します。

```YAML
- persist_to_workspace:
    root: /tmp/dir
    paths:
      - foo/bar
      - baz
```

このステップが完了すると、Workspace には下記のディレクトリが追加されることになります。

```
/tmp/dir/foo/bar
/tmp/dir/baz
```

###### _paths キーの使用例_

```YAML
- persist_to_workspace:
    root: /tmp/workspace
    paths:
      - target/application.jar
      - build/*
```

`paths` では、Go 言語の `Glob` 関数をベースにした、[filepath.Match](https://golang.org/pkg/path/filepath/#Match) によるパターンマッチングに対応します。

```
パターン
        { term }
term:
        '*'　区切り文字を含まない文字シーケンスの全てにマッチする
        '?'　区切り文字を含まないあらゆる文字 1 つにマッチする
        '['  [ '^' ] { character-range }
        ']'  文字クラス（空文字は不可）
        c　文字 c にマッチする（'*'　'?'　'\\'　'[' 以外）
        '\\'c　文字 c にマッチする
character-range:
        c　文字 c にマッチする（'\\'　'-'　']' 以外)
        '\\'c　文字 c にマッチする
        lo '-' hi　lo <= c <= hi の範囲にある文字 c にマッチする
```

Go 言語のドキュメントでは、`/usr/*/bin/ed` のように階層名でパターンを記述できるとしています（/ は区切り文字です）。**注 :** どのような指定方法でも Workspace のルートディレクトリへの相対パスとなります。

##### **`attach_workspace`**

Workflow で使用している Workspace を現在のコンテナにアタッチするのに利用する特殊なステップです。Workspace 内のコンテンツは完全な状態でダウンロードされ、Workspace がアタッチされているディレクトリにコピーされます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
at | ○ | String | Workspace をアタッチするディレクトリを指定します。
{: class="table table-striped"}

###### _例_

```YAML
- attach_workspace:
    at: /tmp/workspace
```

Workflows 1 つ 1 つは、それぞれに一時的な Workspace が関連付けられています。Workspace を使用して、ジョブの実行中にビルドした固有のデータを同じ Workflow 内の他のジョブに渡すことができます。
ジョブ内では `persist_to_workspace` ステップで Workspace にファイルを追加でき、さらに `attach_workspace` ステップを呼び出すと、Workspace 内のファイルをアタッチしたファイルシステムにダウンロードできます。
Workspace で可能なのはファイルの追加のみです。ジョブから Workspace にファイルは追加できても、Workspace からファイルを削除することは不可能になっています。
ファイルを受け取る側のジョブは、ファイルを渡す側のジョブによって Workspace に追加されたファイルしか参照できないことになります。 Workspace をアタッチするとき、アップストリームにある各ジョブの「レイヤー」は、Workflows グラフで表示される順序通りにアップストリームのジョブから適用されます。しかし、2 つのジョブを同時に実行すると、そのレイヤーの適用順序は確定できません。同時に実行した複数のジョブが同じファイル名でデータを保持し Workspace にアタッチするようなケースでは、エラーが発生しますのでご注意ください。

Workflow を再度実行すると、元の Workflow のものと同じ Workspace を引き継ぎます。失敗したジョブを再度実行したときも、そのジョブは元の Workflow で実行したジョブと同じ Workspace の内容を使えることになります。

Artifacts、Workspaces、キャッシュはそれぞれ下記のような違いがあることを頭に入れておいてください。

| タイプ | 保存期間 | 用途 | 使用例・参照先 |
|-----------|-----------------|------------------------------------|---------
| Artifacts | 1 ヶ月単位 | artifacts の長期間に渡る保管 | **Builds ページ** の [Artifacts] タブで参照する。`tmp/circle-artifacts.<hash>/container` などの配下に格納される。 |
| Workspaces | Workflow に従う | `attach_workspace:` ステップを使うダウンストリームのコンテナに対して Workspace をアタッチするのに用いる。 | `attach_workspace` を実行すると、Workspace の内容全体をコピー・再構築する。 |
| Caches | 1 ヶ月単位 | npm や Gem パッケージなど、ジョブ実行の高速化に役立つ変化の少ないデータの保存に用いる。 | `save_cache` ステップでは、`paths` でディレクトリのリストを追加する。また、`key` でキャッシュを一意に識別する名前を（ブランチ、ビルド番号、リビジョンなどを用いて）指定する。 `restore_cache` と 適切な `key` を使ってキャッシュを復元する。 |
{: class="table table-striped"}

Workspaces や キャッシュ、artifacts に関する詳細は、「[Persisting Data in Workflows: When to Use Caching, Artifacts, and Workspaces](https://circleci.com/blog/persisting-data-in-workflows-when-to-use-caching-artifacts-and-workspaces/)」を参照してください。

##### **`add_ssh_keys`**

プロジェクト設定でコンテナに対して SSH 鍵を登録する特殊なステップです。下記のキーを使って SSH に関する設定を行えます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
fingerprints | - | List | 登録された鍵に対応する SSH fingerprint のリスト（デフォルト：登録された鍵全て）
{: class="table table-striped"}

```yaml
steps:
  - add_ssh_keys:
      fingerprints:
        - "b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be"
```

**注 :**
CircleCI は登録された全ての SSH 鍵に対して `ssh-agent` を通じて署名を行います。ただし、コンテナに対して鍵を実際に登録するには、コンフィグファイル内で `add_ssh_keys` を **必ず** 設定する必要があります。

## **`workflows`**
あらゆるジョブの自動化に用います。Workflow 1 つ 1 つはそれぞれ名前となるキーと、値となるマップからなります。Workflow の名前は `config.yml` ファイル内でユニークでなければなりません。Workflows の設定でトップレベルに置くべきキーは、`version` と `jobs` になります。

### **`version`**
Workflows の `version` フィールドは、機能の廃止やベータ版で重大な変更があったときに警告する際の判断材料として使われます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
version | ○ | String | 現在のところは必ず `2` とします。
{: class="table table-striped"}

### **<`workflow_name`>**

Workflow に付けるユニークな名前です。

#### **`triggers`**
Workflow を実行するトリガーを指定します。デフォルトではブランチにプッシュすると Workflow の実行をトリガーするようになっています。

キー | 必須 | 型 | 説明
----|-----------|------|------------
triggers | - | Array | 現在のところは必ず `schedule` とします。
{: class="table table-striped"}

##### **`schedule`**
Workflow では、一定時刻に実行を指示する `schedule` を記述することもできます。利用者の少ない毎日夜 12 時にビルドする、といったことが可能です。

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
`cron` キーは POSIX 準拠の `crontab` の構文で定義します。

キー | 必須 | 型 | 説明
----|-----------|------|------------
cron | ○ | String | [crontab man page](http://pubs.opengroup.org/onlinepubs/7908799/xcu/crontab.html)を参照してください。
{: class="table table-striped"}

###### **`filters`**
filters では `branches` キーが使えます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
filters | ○ | Map | 実行するブランチを定義付けするマップを設定します。
{: class="table table-striped"}

###### **`ブランチ`**
{:.no_toc}

`branches` キーは、`trigger` を定義した `config.yml` ファイルを含むブランチにおいて、スケジュール実行すべきブランチかどうかを決定するのに使えます。つまり、`master` ブランチにプッシュすると、`master` ブランチの [Workflows]({{ site.baseurl }}/ja/2.0/workflows/#workflows-におけるコンテキストとフィルターの使い方) のみをスケジュール実行します。

branches では、ブランチ名を指す文字列をマップさせるための `only` キーと `ignore` キーが使えます。 文字列を `/` で囲み、正規表現を使ってブランチ名をマッチさせたり、文字列のリストを作ってマップさせることも可能です。正規表現では文字列 **全体** にマッチさせる形にしなければなりません。

- `only` の値にマッチするブランチはすべてジョブを実行します。
- `ignore` の値にマッチするブランチはすべてジョブを実行しません。
- `only` と `ignore` のどちらも指定していない場合、全てのブランチでジョブを実行します。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
branches | ○ | Map | 実行する特定のブランチを定義するマップを設定します。
only | ○ | String / Strings のリスト | 単独のブランチ名、もしくはブランチ名のリストを指定します。
ignore | - | String / Strings のリスト | 単独のブランチ名、もしくはブランチ名のリストを指定します。
{: class="table table-striped"}

#### **`jobs`**
jobs では `requires`、`filters`、`context` キーを使えます。

キー | 必須 | 型 | 説明
----|-----------|------|------------
jobs | ○ | List | 依存関係の指定を含む実行するジョブのリストを指定します。
{: class="table table-striped"}

##### **<`job_name`>**

`config.yml` ファイルで定義するジョブの名前です。

###### **`requires`**
デフォルトでは、複数のジョブは並行処理されます。そのため、ジョブ名を使って必要な依存関係の処理を明確にしておく必要があります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
requires | - | List | そのジョブの開始までに完了させるべきジョブのリストを指定します。
name | - | String | ジョブの別名を設定します。何度もジョブを実行する際に都合の良い名前を指定することが可能です。同じジョブを複数回呼び出したいとき、あるジョブで同じ内容のジョブが必要なときなどに有効です。（バージョン 2.1 が必須）。
{: class="table table-striped"}

###### **`context`**
ジョブは、組織において設定したグローバル環境変数を使えるようにすることも可能です。設定画面で context を追加する方法については「[コンテキスト]({{ site.baseurl }}/ja/2.0/contexts)」を参照してください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
context | - | String | コンテキスト名を指定します。デフォルトのコンテキスト名は `org-global` となります。複数のコンテキストを利用できるようにするには、コンテキストごとに名前をユニークにしてください。
{: class="table table-striped"}

###### **`type`**
`approval` の `type` を指定することで、その後のジョブを続行する前に手動の承認操作を求めることができるようになります。下記の例にある通り、Workflow が `type: approval` キーを処理するまで、ジョブは依存関係通りの順番で実行されます。

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
**注 :** `hold` というジョブ名は、メインのコンフィグに入れないようにしてください。

###### **`filters`**
filters では `branches` か `tags` キーのいずれかを使えます。 **注 :** Workflows のなかではジョブレベルの branches キーは無視されることに注意してください。最初にジョブレベルで branches キーを使っていて、その後 `config.yml` を Workflows を使う内容に移行する場合、ジョブレベルにあった branches は削除して、Workflows セクションのなかで宣言するようにしてください。

キー | 必須 | 型 | 説明
----|-----------|------|------------
filters | - | Map | 実行するブランチを定義付けするマップを設定します。
{: class="table table-striped"}

###### **`branches`**
{:.no_toc}
branches では、ブランチ名を指す文字列をマップさせるための `only` キーと `ignore` キーが使えます。文字列を `/` で囲み、正規表現を使ってブランチ名をマッチさせたり、文字列のリストを作ってマップさせることも可能です。正規表現では文字列 **全体** にマッチさせる形にしなければなりません。

- `only` の値にマッチするブランチはすべてジョブを実行します。
- `ignore` の値にマッチするブランチはすべてジョブを実行しません。
- `only` と `ignore` のどちらも指定していない場合、全てのブランチでジョブを実行します。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
branches | - | Map | 実行する特定のブランチを定義するマップを設定します。
only | - | String / Strings のリスト | 単独のブランチ名、もしくはブランチ名のリストを指定します。
ignore | - | String / Strings のリスト | 単独のブランチ名、もしくはブランチ名のリスト指定します。
{: class="table table-striped"}

###### **`tags`**
{:.no_toc}

CircleCI は明示的にタグフィルターを指定しない限り、タグに対して Workflows は実行しません。また、（直接にしろ間接的にしろ）他のジョブの実行が必要なジョブの場合、そのジョブにはタグフィルターの指定が必須となります。

tags では `only` キーと `ignore` キーが使えます。文字列を `/` で囲み、正規表現を使ってタグをマッチさせたり、文字列のリストを作ってマップさせることも可能です。正規表現では文字列 **全体** にマッチさせる形にしなければなりません。CircleCI では軽量版と注釈付き版のどちらのタグにも対応しています。

- `only` の値にマッチするタグはすべてジョブを実行します。
- `ignore` の値にマッチするタグはすべてジョブを実行しません。
- `only` と `ignore` のどちらも指定していない場合、全てのジョブはスキップされます。
- `only` と `ignore` の両方を指定した場合は、`only` を処理してから `ignore` の処理に移ります。

キー | 必須 | 型 | 説明
----|-----------|------|------------
tags | - | Map | 実行するタグを定義するマップを設定します。
only | - | String / Strings のリスト | 単独のタグ文字列、もしくはタグ文字列のリストを指定します。
ignore | - | String / Strings のリスト | 単独のタグ文字列、もしくはタグ文字列のリスト指定します。
{: class="table table-striped"}

詳細は Workflows ページの「[Git タグを用いて Workflows を実行する]({{ site.baseurl }}/ja/2.0/workflows/#git-タグに対応可能な-workflows-を実行する)」を参照してください。

###### *例*

```
workflows:
  version: 2

  build_test_deploy:
    jobs:
      - flow
      - downstream:
          requires:
            - flow
          filters:
            branches:
              only: master
```

Workflows の詳細な例と概念については「[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。

## サンプルコード
{:.no_toc}

{% raw %}
```yaml
version: 2
jobs:
  build:
    docker:
      - image: ubuntu:14.04

      - image: mongo:2.6.8
        command: [mongod, --smallfiles]

      - image: postgres:9.4.1
        # コンテナによっては環境変数の設定が必要
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

      # Postgres ユーザーとデータベースを作成
      # 整形に使う YAML のヒアドキュメントの「|」に注意
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

      # artifacts を保存
      - store_artifacts:
          path: /tmp/artifacts
          destination: build

      # テスト結果をアップロード
      - store_test_results:
          path: /tmp/test-reports

  deploy-stage:
    docker:
      - image: ubuntu:14.04
    working_directory: /tmp/my-project
    steps:
      - run:
          name: Deploy if tests pass and branch is Staging
          command: ansible-playbook site.yml -i staging

  deploy-prod:
    docker:
      - image: ubuntu:14.04
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

## 関連情報
{:.no_toc}

[イントロダクション]({{site.baseurl}}/ja/2.0/config-intro/)
