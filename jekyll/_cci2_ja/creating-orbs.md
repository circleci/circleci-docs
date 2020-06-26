---
layout: classic-docs
title: "Orb のパブリッシュ"
short-title: "Orb のパブリッシュ"
description: "CircleCI Orbs のパブリッシュに関する入門ガイド"
categories:
  - getting-started
order: 1
---

## Orb パブリッシュ プロセスの概要

Orb を使用する前に、Orb パブリッシュ プロセス全体について大まかに把握しておくと、理解が深まるでしょう。 下図は Orb パブリッシュ プロセスを図式化したものです。 ![Orb ワークフローのダイアグラム イメージ]({{ site.baseurl }}/assets/img/docs/orbs_outline_v3.png)

### ステップ 1 - CircleCI CLI を準備する

[`orbs-tool`](https://circleci.com/ja/docs/2.0/creating-orbs/#orb-toolspublish) Orb を使用して Orb パブリッシュの CI/CD を行うことはできますが、CircleCI CLI を使用した方がより直接的かつ反復的に Orb のビルド、パブリッシュ、およびテストを行うことができます。 以下の手順で、CircleCI CLI をインストールして構成できます。

- [CircleCI CLI をインストールする](https://circleci.com/ja/docs/2.0/orb-author-cli/#cli-の初回インストールを行う)
- [CLI を更新する](https://circleci.com/ja/docs/2.0/orb-author-cli/#cli-を更新する)
- [CLI を構成する](https://circleci.com/ja/docs/2.0/orb-author-cli/#cli-を構成する)

### ステップ 2 - CLI が正しくインストールされていることを検証する

CircleCI CLI の構成を終えたら、Orb を扱う前に、CLI が正しくインストールされ、適切に更新および構成されていることを検証します。

### ステップ 3 - バージョン プロパティを Orbs 互換 2.1 に上げる

ビルド構成をバリデーションしたら、バージョン プロパティを 2.1 に上げて、Orbs の使用に対する互換性を持たせます。

### ステップ 4 - インライン テンプレートを使用して新しい Orb を作成する

インライン Orbs は既存の構成から参照できるため、最初はインライン Orbs から作成するのが一番簡単です。 Orb のオーサリングに必須ではないものの、[インライン Orbs](https://circleci.com/ja/docs/2.0/orb-author/#インライン-orbs-の作成) を使用することによってプロセスを簡素化できるため、すばやく簡単に Orb をオーサリングするには理想的なアプローチと言えます。

### ステップ 5 - Orb を設計する

インライン テンプレートを使用するか、インライン テンプレートとは別に Orb をオーサリングするかに応じて、いくつかの要素 (ジョブ、コマンド、Executor) を Orb に追加します。 これらの Orb 要素の詳細については、「[Orb のコンセプト](https://circleci.com/ja/docs/2.0/using-orbs/#section=configuration)」ドキュメントの「[コマンド](https://circleci.com/ja/docs/2.0/using-orbs/#コマンド)」、「[ジョブ](https://circleci.com/ja/docs/2.0/using-orbs/#ジョブ)」、「[Executors](https://circleci.com/ja/docs/2.0/using-orbs/#executors)」の各セクションを参照してください。

### ステップ 6 - Orb をバリデーションする

Orb のオーサリングが終了したら、CLI から `validate` コマンドを実行するだけです。 CircleCI は、`circleci/orb-tools` Orb など、Orb をバリデーションするためのさまざまなツールを提供しています。 `circleci/orb-tools` Orb の使用方法については、「[Orb のバリデーションとパブリッシュ](https://circleci.com/ja/docs/2.0/orb-author-validate-publish/)」を参照してください。

### ステップ 7 - Orb をパブリッシュする

Orb パブリッシュ プロセスの最終ステップは、`circleci/orb-tools` Orb の `orb-tools/publish` CLI コマンドを使用して Orb をパブリッシュすることです。 `dev` Orb バージョンを使用すると、1 つの Orb 名で複数のバージョンをパブリッシュできます (`dev` は可変)。 Orb をパブリッシュするには、その Orb が格納されている組織の管理者である必要があります。

**メモ:** このコマンドの詳細については、このページの [orb-tools/publish](https://circleci.com/ja/docs/2.0/creating-orbs/#orb-toolspublish) セクションを参照してください。

[Orbs]({{ site.baseurl }}/2.0/orb-intro/) は、2.1 の [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) ファイルのトップレベルにある `orbs` キーを通して構成内で利用できるようになります。

## Orb のパブリッシュ プロセス

Orb のオーサリングが終了したら、CircleCI Orb レジストリに Orb をパブリッシュします。 以下に、Orb パブリッシュ プロセスの手順を詳しく説明します。

### Orb のパブリッシュ

このセクションでは、ツールの使用方法と、独自の Orb をオーサリングして CircleCI Orb レジストリにパブリッシュするまでの流れを説明します。

Orb は、`config.yml` ファイルにインラインでオーサリングするか、別途オーサリングした後に、複数のプロジェクト間で再利用するために Orb レジストリにパブリッシュすることができます。 このタスクを完了するには、Orb がパブリッシュされる組織の管理者である必要があります。

[警告] Orb は、常にグローバルに読み取り可能です。 パブリッシュされたすべての Orb (安定版および開発用) は、だれでも読み取って使用することができます。 これは組織のメンバーに限定されません。 通常 CircleCI は、シークレットやその他の機密の変数を構成に含めないように強く推奨しています。 代わりに、コンテキストまたはプロジェクト環境変数を使用し、Orb 内でそれらの環境変数の名前を参照してください。

## CLI を使用した Orb のパブリッシュ

`circleci` CLI には、Orb パブリッシュ パイプラインを管理するコマンドがいくつかあります。 CLI について学習するなら、CLI をインストールして `circleci help` を実行してみるのが一番の早道です。 詳細については、「[CircleCI ローカル CLI の使用]({{ site.baseurl }}/2.0/local-cli/#cli-の構成)」を参照してください。 以下に、Orb のパブリッシュに特に関連するコマンドをいくつか示します。

- `circleci namespace create <name> <vcs-type> <org-name> [flags]`
- `circleci orb create <namespace>/<orb> [flags]`
- `circleci orb validate <path> [flags]`
- `circleci orb publish <path> <namespace>/<orb>@<version> [flags]`
- `circleci orb publish increment <path> <namespace>/<orb> <segment> [flags]`
- `circleci orb publish promote <namespace>/<orb>@<version> <segment> [flags]`

CLI のすべてのヘルプ コマンドは、[CircleCI CLI ヘルプ](https://circleci-public.github.io/circleci-cli/circleci_orb.html)で参照できます。

## CircleCI Orb の作成

このセクションでは、独自の Orb をパブリッシュする方法をよく理解できるように、Orb のパブリッシュ プロセスについて順を追って説明します。 それぞれの例を通してプロセスをステップバイステップで確認することで、CircleCI の要件だけでなくユーザー独自のニーズも満たす Orb を作成できるようになります。

Orb のオーサリングとパブリッシュのプロセスをステップごとに説明していきます。

### CircleCI の設定

CircleCI アプリケーションの [Settings (設定)] ページで、パイプラインが有効になっている必要があります (デフォルトではすべての新しいプロジェクトに対して有効)。 また、組織オーナーが CircleCI アプリケーションの [Security (セキュリティ)] ページの [Settings (設定)] タブで、組織内での未承認 Orb の使用をオプトインしている必要があります。

### 新しい CircleCI CLI の取得

CircleCI プラットフォームでは、CircleCI CLI を使用して Orb を作成できます。 CLI を使用する場合は、既存の CircleCI CLI ツールとコマンドを使用できるため、Orb の作成プロセスが効率化されます。

### 設定ファイルのパッケージ化

CLI が提供する `pack` コマンドを使用して、複数のファイルから 1 つの `config.yml` ファイルを作成できます。 これは、大きな設定ファイルを分割している場合に特に利便性が高く、yaml 構成のカスタム編成を行うことができます。 `circleci config pack` は、ディレクトリ構造とファイル コンテンツに基づいて、ファイル システム ツリーを 1 つの yaml ファイルに変換します。 `pack` コマンドを使用するときのファイルの**名前**や**編成**に応じて、最終的にどのような `config.yml` が出力されるかが決まります。 以下のフォルダー構造を例に考えます。

```sh
$ tree
.
├── config.yml
└── foo
    ├── bar
    │   └── @baz.yml
    ├── foo.yml
    └── subtree
        └── types.yml

3 directories, 4 files
```

Unix の `tree` コマンドは、フォルダー構造の出力にたいへん便利です。 上記のツリー構造の場合、`pack` コマンドは、フォルダー名とファイル名を **yaml のキー**にマップし、ファイル コンテンツをそれらのキーの**値**にマップします。 上記の例のフォルダーを `pack` してみましょう。

{% raw %}
```sh
$ circleci config pack foo
```

```yaml
version: 2.1
bar:
  baz: qux
foo: bar
subtree:
  types:
    ginkgo:
      seasonality: deciduous
    oak:
      seasonality: deciduous
    pine:
      seasonality: evergreen
```
{% endraw %}

#### その他の設定ファイル パッケージ化機能
{:.no_toc}

`@` で始まるファイルの内容は、その親フォルダーのレベルにマージされます。 この機能は、汎用的な `orb.yml` にメタデータを格納したいものの、`orb` のキー・値のペアにはマップしたくない場合に、トップレベルの Orb で使用すると便利です。

たとえば、以下のような場合

{% raw %}
```sh
$ cat foo/bar/@baz.yml
{baz: qux}
```
{% endraw %}

次のようにマップされます。

```yaml
bar:
  baz: qux
```

#### パッケージ化された Config.yml の例
{:.no_toc}

`circleci config pack` を Git コミット フックと共に使用して複数の yaml ソースから 1 つの `config.yml` を生成する方法については、[example_config_pack フォルダー](https://github.com/CircleCI-Public/config-preview-sdk/tree/v2.1/docs/example_config_pack)を参照してください。

### 設定ファイルの処理

`circleci config process` を実行すると設定ファイルがバリデーションされますが、同時に、展開されたソースが元の設定ファイルの内容と共に表示されます (Orb を使用している場合に便利)。

`hello-build` Orb を使用する設定ファイルを例に考えます。

{% raw %}
```yaml
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:

          - hello/hello-build
```
{% endraw %}

`circleci config process .circleci/config.yml` を実行すると、以下のように出力されます (これは、展開されたソースとコメントアウトされた元の設定ファイルから成ります)。

{% raw %}
```sh
# 'circleci/hello-build@0.0.5' に解決された Orb 'circleci/hello-build@0.0.5'
version: 2.1
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
        name: 一部の CircleCI ランタイム環境変数の表示
    - run:
        command: |-
          echo "uname:" $(uname -a)
          echo "arch: " $(arch)
        name: システム情報の表示
workflows:
  Hello Workflow:
    jobs:
    - hello/hello-build
  version: 2

 Original config.yml file:
 version: 2.1

 orbs:
     hello: circleci/hello-build@0.0.5

 workflows:
     \"Hello Workflow\":
         jobs:

           - hello/hello-build
```
{% endraw %}

### ビルド設定ファイルのバリデーション

CircleCI CLI ツールが正しくインストールされていることを確認するには、CLI ツールを使用して以下のコマンドを実行し、ビルド設定ファイルをバリデーションします。

    $ circleci config validate
    

以下のような応答が表示されます。

    Config file at .circleci/config.yml is valid
    

## 関連項目

- [Orb の概要]({{site.baseurl}}/2.0/orb-intro/): Orb の利用に関する概要
- [Orb のコンセプト]({{site.baseurl}}/2.0/using-orbs/): Orbs の基本的な概念
- [Orbs に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): Orbs の使用に際して発生している既知の問題や不明点
- [Orbs リファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): 再利用可能な Orbs、コマンド、パラメーター、および Executors の例
- [構成クックブック]({{site.baseurl}}/2.0/configuration-cookbook/): 設定ファイル内で CircleCI Orbs を使用するためのレシピ