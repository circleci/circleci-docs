---
layout: classic-docs
title: "Orb のコンセプト"
short-title: "Orb のコンセプト"
description: "Orb のコンセプトの概要"
categories:
  - はじめよう
order: 1
verison:
  - Cloud
---

* 目次
{:toc}

## クイックスタート
{: #quick-start }
{:.no_toc}

[CircleCI Orb](https://circleci.com/orbs/)とは、[ジョブ]({}/2.0/reusing-config/#authoring-parameterized-jobs)、[コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)、[Executor]({{site.baseurl}}/2.0/reusing-config/#executor) などの、共有可能な構成要素をパッケージ化したものです。 Orb により CircleCI の設定の記述やカスタマイズが簡単に行えます。 Orb で使用されている再利用可能な設定要素については、 [再利用可能な設定リファレンス]({{site.baseurl}}/2.0/reusing-config/)で詳しく説明されています。

## Orb の設定要素
{: #orb-configuration-elements }

CircleCI の[再利用可能な設定]({{site.baseurl}}/2.0/reusing-config/)機能により、パラメーター化できる設定要素の定義や、その要素をプロジェクトの設定ファイル全体で再利用することが可能です。 [設定リファレンス]({{site.baseurl}}/2.0/configuration-reference/)機能をすべて理解してから、 [再利用可能な設定リファレンス]({{site.baseurl}}/2.0/reusing-config/)に移ることをお勧めします。

### コマンド
{: #commands }

コマンドには、 [パラメーター]({{site.baseurl}}/2.0/reusing-config/#using-the-parameters-declaration) を使って動作を変更できる1つまたは複数のステップが含まれています。 コマンドは Orb のロジックであり、 [コードをチェックアウトする](https://circleci.com/docs/2.0/configuration-reference/#checkout)、シェルコードを実行する</a>などのステップを実行する役割を担っており、例えば、bash や CLI ツールを実行します。 詳細については、 [再利用可能なコマンドのオーサリング]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands) ガイドを参照してください。

例えば、AWS S3 Orb には、ファイルやオブジェクトを新しい場所にコピーする _コマンド_: `aws-s3/copy`があります。 AWS認証の詳細が環境変数として保存されている場合、このコマンドを設定で使用するための構文は単純です。

```yaml
version: 2.1

orbs:
 aws-s3: circleci/aws-s3@x.y.z

jobs:
   build:
    docker:
      - image: 'cimg/python:3.6'
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir bucket && echo "lorem ipsum" > bucket/build_asset.txt
 # aws-s3 Orb の "copy" コマンドを使用
      - aws-s3/copy:
          from: bucket/build_asset.txt
          to: 's3://my-s3-bucket-name'

  #...ワークフロー、その他のジョブなど

```

詳細は、レジストリの[AWS-S3 Orb](https://circleci.com/developer/orbs/orb/circleci/aws-s3#commands)をご覧ください。

### Executor
{: #executors }

Executor は、 [ジョブ]({{site.baseurl}}/2.0/orb-concepts/#jobs) を実行することができるパラメータ化された実行環境です。 CircleCIでは複数の [Executor オプション]({{site.baseurl}}/2.0/configuration-reference/#docker--machine--macos--windows-executor)を提供しています。

- Docker
- macOS
- Windows
- Linux VM

Orb 内 で定義された Executor は、お客様のプロジェクト設定のジョブや Orb で定義されたジョブの実行に使用できます。

#### Executor の定義例
{: #executor-definition-example }
{:.no_toc}

{:.tab.executor.Node-Docker}
```yaml
description: >
  使用する Node.js のバージョンを選択。 CI 用にビルドされ高度にキャッシュされた Circle CI の便利なイメージを使用:
  - image: 'cimg/node:<<parameters.tag>>'
    auth:
      username: mydockerhub-user
      password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
parameters:
  tag:
    default: '13.11'
    description: >
      Pick a specific cimg/node image version tag:
      https://hub.docker.com/r/cimg/node
    type: string
```

{:.tab.executor.Ruby-Docker}
{% raw %}
```yaml
description: >
  使用する Ruby のバージョンを選択。 CI 用にビルドされ高度にキャッシュされた Circle CI の便利なイメージを使用:

  このリストの中から利用可能なタグを使用することができます。
  https://hub.docker.com/r/cimg/ruby/tags
docker:
  - image:'cimg/ruby:<< parameters.tag >>'
    auth:
      username: mydockerhub-user
      password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
parameters:
  tag:
    default: '2.7'
    description:`circleci/ruby` の Docker イメージのバージョンを示すタグ
    type: string
```
{% endraw %}

例えば、 [Node Orb](https://circleci.com/developer/orbs/orb/circleci/node) では、パラメータ化された Docker ベースの Executor が提供されており、これを介して Docker タグを設定することができます。 これは、Node Orb の [テストジョブ](https://circleci.com/developer/orbs/orb/circleci/node#usage-run_matrix_testing)と一緒に使用することで、すべてのバージョンの Node.js に対してアプリケーションをテストする簡単な方法です。

詳しくは、 [再利用可能な Executor のオーサリング]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors) や、[Node Orb のレジストリ](https://circleci.com/developer/orbs/orb/circleci/node#executors-default)を参照してください。

### ジョブ
{: #jobs }

[ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) は、与えられた [Executor]({{site.baseurl}}/2.0/orb-concepts/#executors) 内で実行される一連の[ステップ](https://circleci.com/docs/2.0/configuration-reference/#steps) を定義し、 [ワークフロー]({{site.baseurl}}/2.0/workflows/)を使ってオーケストレーションされます。 また、ジョブは個別に [GitHub Checks](https://circleci.com/docs/2.0/enable-checks/) を介してステータスを返します。

ジョブがある Orb をインポートする際に、ワークフローから直接ジョブを参照することができます。

```
version: 2.1

orbs:
  <orb>: <namespace>/<orb>@x.y # Orb のバージョン

workflows:
  use-orb-job:
    jobs:
      - <orb>/<job-name>
```

詳細については、 [再利用可能なジョブのオーサリング]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs) 、および Orb レジストリにある [Node テストジョブの使用例](https://circleci.com/developer/orbs/orb/circleci/node#usage-run_matrix_testing) を参照してください。

### 使用例
{: #usage-examples }

[Orb 開発キット]({{site.baseurl}}/2.0/orb-author/#orb-development-kit)を使用して、新しい使用例を追加するには、Orb プロジェクトの [src/examples](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples) ディレクトリ内に `nam-of-example.yml` という新しいファイルを作成するだけです。 使用例は、プロジェクトの設定に直接使用するものではありませんが、ユーザーが自分の設定における Orb の最適な使用方法を共有するための一種の Orb メタデータであり、[Orbレジストリ](https://circleci.com/developer/orbs)に参照用に表示されています。 以下は使用例のサンプルです。

```yaml
# ソース https://github.com/circleci-public/orb-project-template/blob/master/src/examples/example.yml

description: >
  使用例サンプルの説明
usage:
  version: 2.1
  orbs:
    <orb-name>: <namespace>/<orb-name>@1.2.3
  workflows:
    use-my-orb:
      jobs:
        - <orb-name>/<job-name>

```

## 名前空間
{: #namespaces }

_名前空間_ は、一連の Orb をオーサー別にグループ化するために、ユーザーや組織が要求する一意の識別子です。 各ユーザーまたは組織が要求できる一意の名前空間は 1 つのみで、後から変更することはできません。 各名前空間には、一意の名前の Orb が多数含まれる場合があります。

例えば、`circleci/rails` という Orb と `<other-namespace>/rails`という Orb は、別々の名前空間にあるため、レジストリ内で共存できます。

デフォルトでは、各組織が要求できる名前空間は 1つに制限されています。 これは、名前の占有や名前空間のノイズを制限するためのポリシーです。 名前空間の変更が必要な場合は、サポートにお問い合わせください。

デフォルトでは、作成された名前空間は、 [Orb レジストリ](https://circleci.com/developer/orbs)の「コミュニティ」の名前空間として表示されます。


## セマンティック バージョニング
{: #semantic-versioning }

Orb は [セマンティック バージョニング](https://semver.org/) のリリースプロセスを採用しています。各Orbのアップデートは標準化されたバージョニング パターンに従っており、Orb のオーサーやユーザーはそれを活用してください。

セマンティック バージョニングでは、リリース バージョンは `.`で区切られた 3 つの整数で表されます。それぞれの整数は、追加される変更の種類を表します。

```
[Major].[Minor].[Patch]
```

| バージョン | 説明           |
| ----- | ------------ |
| メジャー  | 大きな変更        |
| マイナー  | 後方互換性のある追加機能 |
| パッチ   | バグの修正        |
{: class="table table-striped"}

Orb をインポートすると、その Orb を特定のセマンティック バージョニングのコンポーネントに固定することができます。

| インポートバージョン | 説明                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| 1.2.3      | フルバージョンと一致。 変更は取り込まれません。                                                        |
| 1.2        | メジャーバージョン `1`、マイナーバージョン `2`にロックされており、すべてのパッチアップデートを受け取ります。                      |
| 1          | メジャーバージョン`1`にロックされており、 すべてのマイナーアップデートとパッチアップデートを受け取ります。 メジャーバージョンは自動的には変更されません。 |
| 揮発性        | **推奨しません。** 最後にパブリッシュされたバージョンの Orb をプルするためテスト時には便利です。 セマンティック バージョニングは適用されません。  |
{: class="table table-striped"}

ユーザーの CI プロセスに悪影響を与えないように、Orb オーサーはセマンティック バージョン管理を厳密に行い、 `マイナー` または `パッチ` レベルの更新時に大きな変更が取り込まれないようにする必要があります。

**注:** CircleCI は現在、数字以外のセマンティック バージョニング要素をサポートしていません。 x.y.z 形式のセマンティック バージョニング スタイルのバージョン文字列、またはdev:*形式の開発スタイルのバージョン文字列を使用することをお勧めします。
{: class="alert alert-warning"}

## Orb のバージョン（開発版、安定版、インライン版）
{: #orb-versions-development-vs-production-vs-inline }

### 安定版 Orb
{: #production-orbs }
{:.no_toc}

安定版の Orb は変更不可であり、[Orb レジストリ](https://circleci.com/developer/orbs)で見つけることができます。

- 安定版 Orbは、変更不可であり、削除や編集ができず、更新は新しいセマンティック バージョンのリリースで提供される必要があります。
- バージョンの文字列は セマンティック バージョニング形式でなければなりません。例えば、 `<namespace>/<orb>@1.2.3`のようになります。
- 安定版 Orb は、名前空間の組織のオーナーのみがパブリッシュできます。
- Orb レジストリへのパブリッシュ
- オープンソースは [MIT ライセンス](https://circleci.com/developer/orbs/licensing)でリリースされます。
- CircleCI CLI から利用可能です。

### 開発版 Orb
{: #development-orbs }
{:.no_toc}

開発版 Orb は一時的に上書きが可能な Orb タグのバージョンで、安定版用の変更をデプロイしたセマンティック バージョンをデプロイする前の迅速な開発およびテストに役立ちます。

- 開発版 Orb は変更可能で、上書きすることができ、パブリッシュ後90日で自動的に失効します。
- バージョンの文字列は、`dev:`で始まり、`<namespace>/<orb>@dev:my-feature-branch` のような任意の文字列が続きます。
- 開発版 Orb は、名前空間の組織のメンバーであれば誰でもパブリッシュすることができます。
- Orb レジストリには表示されません。
- オープンソースは [MIT ライセンス](https://circleci.com/developer/orbs/licensing)でリリースされます。
- CircleCI CLI から利用可能です（開発タグ名が分かる場合）。

### インライン Orb
{: #inline-orbs }
{:.no_toc}

インライン Orb は、ユーザーの設定内で直接定義され、完全にローカルで、個々のプロジェクトにスコープされています。

_[参照: インライン Orb の記述方法]({{site.baseurl}}/2.0/reusing-config/#writing-inline-orbs) を参照してください。_

- Orb サービスにはパブリッシュされません。
- バージョニングされません。
- ユーザーの設定内でローカルにのみ存在します。
- リポジトリの外からはアクセスできません。
- 非公開です。
- CircleCI CLI からはアクセスできません。

## Orb のパッケージ化
{: #orb-packing }

すべてのCircleCI Orb は単体のYAMLファイルで、通常は `orb.yml`という名前です。 しかし、開発においては、コードをより管理しやすい塊に分割した方がやり易い場合が多々あります。 `circleci orb pack` コマンドは、 [Orb 開発キット]({{site.baseurl}}/2.0/orb-author/#orb-development-kit)の一部であり、別々のYAMLファイルを「パッケージ化」したり、凝縮したりするために使用されます。

Orb 開発キットを使用している場合、オーブのパッケージ化は、付属のCI/CDパイプラインによって、 [orb-tools/pack](https://circleci.com/developer/orbs/orb/circleci/orb-tools#jobs-pack) ジョブで自動的に処理されます。
{: class="alert alert-warning"}

**_例: Orb プロジェクトの構造_**

| 種類                        | 名前                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| <i class="fa fa-folder" aria-hidden="true"></i> | [コマンド](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/commands)       |
| <i class="fa fa-folder" aria-hidden="true"></i> | [例](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/examples)          |
| <i class="fa fa-folder" aria-hidden="true"></i> | [Executor](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/executors)  |
| <i class="fa fa-folder" aria-hidden="true"></i> | [ジョブ](https://github.com/CircleCI-Public/Orb-Project-Template/tree/master/src/jobs)            |
| <i class="fa fa-file-text-o" aria-hidden="true"></i> | [@orb.yml](https://github.com/CircleCI-Public/Orb-Project-Template/blob/master/src/%40orb.yml) |
{: class="table table-striped"}

Orb を_パッケージ化_するには、[@orb.yml]({{site.baseurl}}/2.0/orb-author/#orbyml)ファイルが必要です。 `@` は、Orb プロジェクトの _ルート_ を示しています。 同じディレクトリ内に、 [コマンド]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-commands)、 [ジョブ]({{site.baseurl}}/2.0/reusing-config/#authoring-parameterized-jobs)、 [Executor]({{site.baseurl}}/2.0/reusing-config/#authoring-reusable-executors)、および [サンプル]({{site.baseurl}}/2.0/orb-concepts/#usage-examples)など、Orb コンポーネントの種類ごとに追加のディレクトリを含めることができます。 追加のファイルやフォルダは安全に無視されます。

さらに、 _pack_ コマンドは、Orb 開発者のための特別なプリプロセッサを提供し、 [ファイル インクルード構文]({{site.baseurl}}/2.0/orb-concepts/#file-include-syntax) （`<<include(file)>>`）を使って、外部ファイルからコードをインポートすることができます。

**CLI コマンド**

`circleci orb pack <dir> > orb.yml`

Orb 開発キットをお使いの場合、このステップは自動的に処理されます。

## ファイル インクルード構文
{: #file-include-syntax }

`ファイル インクルード` 構文(`<<include(dir/file)>>`)は、CircleCI Orb の設定ファイル内の任意のキーの値として、ファイルの内容をその場で取り込むことができる特別な設定強化機能です。 この`<<include(dir/file)>>` 構文は、 [`circleci orb pack` コマンド](#orb-packing) と一緒に使う特別なキーであり、CircleCI 上でより広く動作することは_ありません_。

`@orb.yml`ファイルを含むディレクトリに対して、`circleci orb pack <dir> > orb.yml` を実行すると、パッケージ化コマンドが各ファイルの内容を一つの `orb.yml` ファイルに集め始めます。 パッケージ化の過程で、 `<<include(dir/file)>>` 値の各インスタンスは、その中で参照されるファイルの内容に置き換えられます。

含まれるファイルは常に `@orb.yml` ファイルの相対的な位置から参照されます。
{: class="alert alert-warning"}

{:.tab.fileInclude.Command-yaml}
```yaml
description: パッケージ化時にファイルからインポートする簡単なコマンド
steps:
  - run:
      name: Hello Greeting
      command: <<include(scripts/file.sh)>>

```

{:.tab.fileInclude.file-sh}
```bash
# これは bash ファイルですが、テキストベースのファイルであれば何でも構いません
echo "Hello World"

```

{:.tab.fileInclude.Packed_Command-yaml}
```yaml
description: パッケージ化時にファイルからインポートする簡単なコマンド
steps:
  - run:
      name: Hello Greeting
      command: |
        # これは Bash ファイルですが、テキストベースのファイルであれば何でも構いません。
        echo "Hello World"
```

ファイルインクルード機能は、設定の Bash ロジックをyamlから分離するのに特に有効です。 Bash スクリプトを含めることで、Bash の開発やテストを Orb の外で行うことができます。

Bash スクリプトを含めることに関する詳細は、[Orb オーサー]({{site.baseurl}}/2.0/orb-author/#scripts) ガイドをご覧ください。

## Orb 内での Orb の使用と登録時の解決
{: #using-orbs-within-your-orb-and-register-time-resolution }

Orb のスタンザは、Orb の中で使うことができます。 安定版 Orb リリースは変更不可なので、すべての Orb 依存関係は、ビルドの実行時ではなく Orb の登録時にすべて解決されます。

例えば、`biz/baz@volatile` をインポートする orbs スタンザを含んだ Orb `foo/bar` が、バージョン 1.2.3 でパブリッシュされるとします。 `foo/bar@1.2.3` を登録する時点で、`biz/baz@volatile` が最新バージョンとして解決され、その要素がパッケージ バージョンの `foo/bar@1.2.3` に直接含められます。

`biz/baz` が `3.0.0` に更新されても、`foo/bar` が `1.2.3` よりも上のバージョンでパブリッシュされるまで、`foo/bar@1.2.3` を使用しているユーザーには `biz/baz@3.0.0` の変更が反映されません。

メモ: Orb の要素は、他の Orb の要素を使用して直接構成できます。 例えば、以下の例のような Orb があるとします。


```yaml
version: 2.1
orbs:
  some-orb: some-ns/some-orb@volatile
executors:
  my-executor: some-orb/their-executor
commands:
  my-command: some-orb/their-command
jobs:
  my-job: some-orb/their-job
  another-job:
    executor: my-executor
    steps:
      - my-command:
          param1: "hello"
```

## 関連項目
{: #see-also }
{:.no_toc}

- [Orb の概要]({{site.baseurl}}/2.0/orb-intro/):  CircleCI Orb のより詳細な概要
- [Orbリファレンス ガイド]({{site.baseurl}}/2.0/reusing-config/): コマンド、ジョブ、Executor の説明など、Orb に関する詳細な参考情報
- [Orb に関するよくあるご質問]({{site.baseurl}}/2.0/orbs-faq/): Orb 使用の際によく発生する問題についての情報
