---
layout: classic-docs
title: "CircleCI のローカル CLI の使用"
short-title: "CircleCI のローカル CLI の使用"
description: "CLI を使用したローカルジョブの実行方法"
categories:
  - troubleshooting
order: 10
---

## 概要

CircleCI CLI は、CircleCI の高度で便利なツールの多くを使い慣れた端末から利用できるコマンドラインインターフェースです。 CircleCI CLI を使用すると、以下のような作業が行えます。

- CI のコンフィグのデバッグとバリデーション
- ローカルでのジョブの実行
- CircleCI API のクエリ
- Orbs の作成、パブリッシュ、表示、管理

ここでは、CLI ツールのインストールと使用方法について説明します。 **メモ：**現在、最新の CLI は、サーバー上にインストールした CircleCI では利用できません。 旧バージョンの CLI であればサーバー上でも動作するため、インストールが可能です。 詳細については、以下を参照してください。

- 目次
{:toc}

## インストール

CLI のインストールには複数の方法があります。

### クイックインストール

**メモ：**2018年 10月以前に CLI をインストールしている場合は、新しい CLI に切り替えるために今回追加で作業を行う必要があります。 以下の[アップデートの手順に関するセクション](#旧バージョンの-cli-のアップデート)を参照してください。

通常は以下のコマンドを実行すれば、CircleCI CLI を使用できるようになります。

**Mac と Linux の場合**

```sh
curl -fLSs https://circle.ci/cli | bash
```

CircleCI の CLI ツールは、デフォルトで `/usr/local/bin` ディレクトリにインストールされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、上記のコマンドを `sudo` で実行する必要があります。 または、bash の実行時に `DESTDIR` 環境変数を定義して、別の場所にインストールすることも可能です。

```sh
curl -fLSs https://circle.ci/cli | DESTDIR=/opt/bin bash
```

### その他のインストール方法

CircleCI CLI は、これ以外の方法でもインストールできます。 インストールをカスタマイズする必要がある場合や、上記のクイックインストールを実行して問題が発生した場合は、以降に紹介する方法をお試しください。

#### Snap を使用したインストール

{:.no_toc}

以下のコマンドを実行すると、CircleCI CLI、Docker と共に、[Snap パッケージ](https://snapcraft.io/)と付属のセキュリティおよび自動アップデート機能をインストールできます。

```sh
sudo snap install docker circleci
sudo snap connect circleci:docker docker
```

**メモ：**Snap パッケージを使用して CLI をインストールする場合、この docker コマンドでは、以前にインストールした Docker のバージョンではなく、Docker Snap が使用されます。 セキュリティ上の理由から、Snap パッケージは $HOME 内でしかファイルを読み書きできません。

#### Homebrew を使用したインストール

{:.no_toc}

macOS で [Homebrew](https://brew.sh/index_ja) を使用している場合は、以下のコマンドを使用して CLI をインストールできます。

```sh
brew install circleci
```

**メモ：**Mac 版の Docker を既にインストールしている場合は、`brew install --ignore-dependencies circleci` を使用してください。

### 手動でのダウンロード

CLI を手動でダウンロードしてインストールする場合は、[GitHub リリース](https://github.com/CircleCI-Public/circleci-cli/releases)のページをご確認ください。 システム上の特定のパスに CLI をインストールしたいときには、この方法が最適です。

## CLI のアップデート

`circleci update` コマンドを使用して、CLI を最新のバージョンにアップデートできます。 なお、アップデートの有無を手動で確認するだけで、インストールは行わない場合は、`circleci update check` コマンドで確認できます。

### 旧バージョンの CLI のアップデート

{:.no_toc}

CLI の最新バージョンは [CircleCI パブリックオープンソースプロジェクト](https://github.com/CircleCI-Public/circleci-cli)です。 [旧バージョンの CLI をインストールしている](https://github.com/circleci/local-cli)場合は、以下のコマンドを実行してアップデートを行い、最新バージョンの CLI に切り替えてください。

```sh
circleci update
circleci switch
```

インストールディレクトリ `/usr/local/bin` への書き込みアクセス権が付与されていないユーザーがこのコマンドを実行すると、`sudo` を使用するように求められます。

## CLI の設定

CLI を使用する前に、[[Personal API Token (パーソナル API トークン)] タブ](https://circleci.com/account/api)から CircleCI の API トークンを生成する必要があります。 トークンを取得したら、以下を実行して CLI を設定します。

```sh
circleci setup
```

setup から、コンフィグの設定を行うように求められます。 circleci.com で CLI を使用している場合は、デフォルトの CircleCI Host を使用します。 独自のサーバーまたはプライベートクラウドにインストールした CircleCI を使用している場合は、インストールアドレス (例：circleci.your-org.com) の値を変更してください。

## CircleCI のコンフィグのバリデーション

CLI を使用してコンフィグをローカルでバリデーションすると、config.yml をテストするたびに追加のコミットをプッシュする必要がなくなります。

コンフィグをバリデーションするには、`.circleci/config.yml` ファイルがあるディレクトリに移動し、以下を実行します。

```sh
circleci config validate
# .circleci/config.yml にあるコンフィグファイルは有効です
```

[Orbs](https://circleci.com/orbs/) を使用している場合は、Orb もバリデーションできます。

```sh
circleci orb validate /tmp/my_orb.yml
```

上記のコマンドは、コマンドを実行したディレクトリの `/tmp` フォルダーから `my_orb.yml` という名前の Orb を検索します。

## コンフィグのパッケージ化

CLI の `pack` コマンドを使用すると、複数のファイルをまとめて 1つの YAML ファイルを作成できます。 これは、容量の大きな Orbs のソースコードを分割する際に特に便利なコマンドで、Orbs の YAML 設定のカスタム編成を行うことができます。 `circleci config pack` は、ディレクトリ構造とファイルコンテンツに基づいて、ファイルシステムツリーを 1つの YAML ファイルに変換します。 `pack` コマンドで指定するファイルの**名前**や**編成**に応じて、最終的に出力される `orb.yml` が決まります。 以下のフォルダー構造を例に考えます。

```sh
$ tree
.
└── your-orb-source
    ├── @orb.yml
    ├── commands
    │   └── foo.yml
    └── jobs
        └── bar.yml

3 directories, 3 files
```

Unix の `tree` コマンドは、フォルダー構造の出力にたいへん便利です。 上記のツリー構造の例の場合、`pack` コマンドは、フォルダー名とファイル名を **YAML キー** にマップし、ファイルコンテンツを**値**として対応するキーにマップします。 上記の例のフォルダーを `pack` してみましょう。

{% raw %}

```sh
$ circleci config pack your-orb-source
```

```yaml
# ここに @orb.yml の内容が表示されます
commands:
  foo:
    # ここに foo.yml の内容が表示されます
jobs:
  bar:
    # ここに bar.yml の内容が表示されます
```

{% endraw %}

### その他のコンフィグパッケージ化機能

{:.no_toc}

`@` で始まるファイルのコンテンツは、その親フォルダーレベルにマージされます。 これは、汎用の `orb.yml` にメタデータを格納するが、`orb` のキー・値のペアにマップしない場合に、トップレベルの Orb で使用すると便利です。

以下のコマンドを例に考えます。

{% raw %}

```sh
$ cat foo/bar/@baz.yml
{baz: qux}
```

{% endraw %}

このコマンドは、以下のようにマップされます。

```yaml
bar:
  baz: qux
```

### パッケージ化された Config.yml の例

{:.no_toc}

複数の YAML ソースファイルを使用して記述した Orbs の例については、[GitHub の CircleCI Orbs トピックタグ](https://github.com/search?q=topic%3Acircleci-orbs+org%3ACircleCI-Public&type=Repositories)を参照してください。 `circleci config pack` は、通常、プロジェクトの CI/CD ワークフローの一部として実行され、Orb ソースコードをパブリッシュできるように準備します。

## コンフィグの処理

`circleci config process` を実行するとコンフィグがバリデーションされますが、同時に、展開されたソース設定が元のコンフィグと共に表示されます (Orbs を使用している場合に便利です)。

`hello-build` Orb を使用する設定を例に考えます。

    version: 2.1

    orbs:
        hello: circleci/hello-build@0.0.5

    workflows:
        "Hello Workflow":
            jobs:

              - hello/hello-build


`circleci config process .circleci/config.yml` を実行すると、以下のように出力されます (これは、展開されたソースとコメントアウトされた元のコンフィグから成ります)。

{% raw %}

```sh
# Orb 'circleci/hello-build@0.0.5' resolved to 'circleci/hello-build@0.0.5'
version: 2
jobs:
  hello/hello-build:
    docker:

    - image: circleci/buildpack-deps:curl-browsers
    steps:
    - run:
        command: echo "Hello ${CIRCLE_USERNAME}"
    - run:
        command: |-
          echo "TRIGGERER: ${CIRCLE_USERNAME}"
          echo "BUILD_NUMBER: ${CIRCLE_BUILD_NUM}"
          echo "BUILD_URL: ${CIRCLE_BUILD_URL}"
          echo "BRANCH: ${CIRCLE_BRANCH}"
          echo "RUNNING JOB: ${CIRCLE_JOB}"
          echo "JOB PARALLELISM: ${CIRCLE_NODE_TOTAL}"
          echo "CIRCLE_REPOSITORY_URL: ${CIRCLE_REPOSITORY_URL}"
        name: Show some of the CircleCI runtime env vars
    - run:
        command: |-
          echo "uname:" $(uname -a)
          echo "arch: " $(arch)
        name: Show system information
workflows:
  Hello Workflow:
    jobs:
    - hello/hello-build
  version: 2

# Original config.yml file:
# version: 2.1
#
# orbs:
#     hello: circleci/hello-build@0.0.5
#
# workflows:
#     \"Hello Workflow\":
#         jobs:
#           - hello/hello-build

```

{% endraw %}

## マシン上のコンテナ内でのジョブの実行

### 概要

{:.no_toc}

CLI を使用すると、Docker からコンフィグ内のジョブを実行できます。 そうすれば、テストを実行した後で、コンフィグの変更をプッシュしたり、ビルドキューに影響を与えずにビルドプロセスをデバッグできたりするため、便利です。

### 前提条件

{:.no_toc}

システムに [Docker](https://www.docker.com/products/docker-desktop) と CLI ツールの最新バージョンをインストールしている必要があります。 また、有効な `.circleci/config.yml` ファイルを持つプロジェクトが必要です。

### ジョブの実行

{:.no_toc}

CLI では、Docker を使用してデスクトップ上の CircleCI から単一のジョブを実行できます。

```sh
$ circleci local execute --job JOB_NAME
```

CircleCI のデモアプリケーションで、ローカルのマシンからビルドのサンプルを実行してみましょう。

```sh
git clone https://github.com/CircleCI-Public/circleci-demo-go.git
cd circleci-demo-go
circleci local execute --job build
```

上記のコマンドは、*build* ジョブ全体を実行します (ローカルではジョブのみを実行でき、ワークフローは実行できません)。 CLI は、Docker を使用してビルドの要件をプルダウンしてから、CI ステップをローカルで実行します。 この例では、Golang および Postgres の Docker イメージをプルダウンして、ビルド中に依存関係のインストール、単体テストの実行、サービスの実行テストなどを行えるようにしています。

### ローカルでのジョブ実行時の制約

{:.no_toc}

`circleci` を使用してジョブをローカルで実行できるのは非常に便利ですが、いくつかの制約があります。

**Machine Executor**

ローカルジョブでは Machine Executor を使用できません。 Machine Executor でジョブを実行するには、別の VM が必要になるためです。

**ワークフロー**

CLI ツールでは、ワークフローの実行がサポートされていません。 基本的にワークフローは、複数のマシンで行うビルドの並列実行を活用することによって、高速で複雑なビルドを可能にします。 CLI はユーザーのマシンでのみ動作するため、単一の **jobs** (ワークフローを構成する一要素) しか実行できません。

**キャッシュとオンライン限定コマンド**

現在、ローカルジョブではキャッシュがサポートされていません。 コンフィグに `save_cache` ステップまたは `restore_cache` ステップが含まれている場合、`circleci` では該当のステップがスキップされ、警告が表示されます。

また、オンラインでは機能しても、ローカルマシンでは機能しないコマンドもあります。 たとえば、上記の Golang ビルドの例では `store_artifacts` ステップを実行していますが、ローカルでビルドした場合、アーティファクトはアップロードされません。 ローカルのビルドで利用できないステップがあった場合は、コンソールにエラーが表示されます。

**環境変数**

セキュリティ上の理由から、UI で設定した暗号化環境変数は、ローカルのビルドにはインポートされません。 代わりに、`-e` フラグを使用して CLI に環境変数を指定できます。 詳細については、`circleci help build` の出力結果を参照してください。 なお、環境変数を複数指定する場合は、このフラグを変数ごとに使用する必要があります (例：`circleci build -e VAR1=FOO -e VAR2=BAR`)。

## CircleCI Server での CLI の使用

現在、サーバーにインストールした CircleCI 上で実行できるのは、旧バージョンの CircleCI CLI のみです。 macOS や他の Linux ディストリビューションに旧バージョンの CLI をインストールする場合は、以下の手順を実施します。

1. [Docker のインストール手順](https://docs.docker.com/install/)に従って、Docker をインストールし、設定します。
2. 以下のコマンドを実行して、CLI をインストールします。

`$ curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci`

CLI (`circleci`) は `/usr/local/bin` ディレクトリにダウンロードされます。 `/usr/local/bin` への書き込みアクセス権を持っていない場合は、上記のコマンドを `sudo` で実行する必要があります。 CLI はアップデートの有無を自動的に確認し、アップデートがあった場合はメッセージが表示されます。

## アンインストール

CircleCI CLI のアンインストールに使用するコマンドは、インストール方法によって異なります。

- **curl インストールコマンドを使用した場合**：`usr/local/bin` から `circleci` 実行可能ファイルを削除します。
- **Mac で Homebrew を使用してインストールした場合**：`brew uninstall circleci` を実行します。
- **Linux でSnap を使用してインストールした場合**：`sudo snap remove circleci` を実行します。
