---
layout: classic-docs
title: "Orb Testing Methodologies"
short-title: "Testing Methodologies"
description: "CircleCI Orbs テストの入門ガイド"
categories:
  - getting-started
order: 1
---

Orbs のテストに利用できるさまざまな手法について説明します。

- 目次
{:toc}

## はじめに

CircleCI Orbs とは設定のエレメントをまとめたパッケージです。設定時に Orbs を使用することで、ワークフローを簡素化し、ワークフロー内でアプリケーションや Orbs をすばやく簡単にデプロイできます。 ワークフローの Orb を作成したら、Orb をデプロイしてパブリッシュする前に、Orb をテストして、一定のニーズを満たしているかどうかを確認できます。

Orb のテストには 4つのレベルがあります。レベルが上がるごとに内容が複雑になり、その範囲も広がります。

- スキーマバリデーション - このテストは、1つの CLI コマンドで実行可能です。Orb の YAML の形式が正しいかどうか、Orb スキーマに準拠しているかどうかを確認します。
- 展開テスト - CircleCI CLI のスクリプトを記述して実行します。このテストでは、Orb のエレメントを含む設定が処理されるときに、意図したとおりの設定が生成されるかどうかを確認します。
- 実行時テスト - このテストを実行するには、別のテストを準備し、それらを CircleCI ビルド内で実行する必要があります。
- インテグレーションテスト - 通常このテストは、サードパーティサービスとの安定したパブリックインターフェースとして特別に設計された Orbs など、きわめて高度な Orbs でのみ必要になります。 Orb のインテグレーションテストを実行するには、インテグレーション先のシステムに合わせて、カスタムビルドと独自の外部テスト環境を準備する必要があります。

ここからは、Orb テストの方法についてレベル別に詳しく説明します。

### スキーマバリデーション

Orb が有効な YAML であり、スキーマに従った正しい形式になっているかどうかをテストするには、CircleCI CLI で `circleci orb validate` を使用します。

#### 例

たとえば Orb のソースが `./src/orb.yml` にある場合、`circleci orb validate ./src/orb.yml` を実行することで、Orb が有効かどうか、コンフィグの処理が正しく進むかどうかについて、フィードバックを受け取ることができます。 エラーが発生した場合は、最初のスキーマバリデーションエラーが返されます。 また、ファイルパスではなく STDIN を渡しても実行できます。

For example, equivalent to the previous example you can run `cat ./src/orb.yml | circleci orb validate -`

**メモ**：スキーマエラーはよく「裏こそ表」と表現されます。コーディングエラーの内容を把握するには、エラースタックの最も内側のエラーを見るのが一番です。

バリデーションテストは、CircleCI CLI を使用してビルド内で実行する方法もあります。 `circleci/circleci-cli` Orb を直接使用して、CLI をビルドに挿入できます。また、ジョブ内でスキーマバリデーションをデフォルトで実行するなどの便利なコマンドジョブをいくつか含む `circleci/orb-tools` Orb を使用することも可能です。 `orb-tools` を使用して基本的なパブリッシュを実行する Orb には "hello-build" Orb などがあります。

### 展開テスト

次のレベルの Orb テストでは、Orb が展開されて、CircleCI システムで使用される最終的な `config.yml` が意図したとおりに生成されるかどうかをバリデーションします。

このテストを実行するときには、Orb を dev バージョンとしてパブリッシュし、それをコンフィグで使用して処理するか、コンフィグをパッケージ化してインライン Orb にしたうえで処理することをお勧めします。 次に、`circleci config` プロセスを使用し、意図していた展開状態と実際の結果を比較します。

Orb が別の Orbs を参照している場合は、別の形式の展開テストを対象の Orb に実行できます。 `circleci orb` プロセスを使用すると、Orbs に依存している Orbs が解決でき、レジストリにパブリッシュしたときにどのように展開されるかを確認できます。

なお、展開をテストするときは、展開される文字列リテラルではなく、データの基底構造をテストすることが肝心です。 YAML 内の記述についてアサーションする場合は、`yq` を使用すると便利です。 このツールを使用すると、特定の構造エレメントをチェックすることができます。文字列の比較や展開後のジョブの各部に依存しないため、テストが不安定になることもありません。

以下に、CLI から基本的な展開テストを実行する手順を示します。

1) `src/orb.yml` にあるシンプルな Orb を想定します。

{% raw %}
```yaml
version: 2.1

executors:
  default:
    parameters:
      tag:
        type: string
        default: "curl-browsers"
      docker:

        - image:  circleci/buildpack-deps:parameters.tag

jobs:
  hello-build:
    executor: default
    steps:

      - run: echo "Hello, build!"
```
{% endraw %}

2) `circleci orb validate src/orb.yml` を使用して Orb をバリデーションします。

3) `circleci orb publish src/orb.yml namespace/orb@dev:0.0.1` を使用して dev バージョンをパブリッシュします。

4) その Orb を `.circleci/config.yml` に入れます。

{% raw %}
```yaml
version: 2.1

orbs:
  hello: namespace/orb@dev:0.0.1

workflows:
  hello-workflow:
    jobs:

      - hello/hello-build
```
{% endraw %}

`circleci config process .circleci/config.yml` を実行すると、以下のような結果が表示されます。

{% raw %}
```yaml
version: 2.1

jobs:
  hello/hello-build:
    docker:

      - image: circleci/buildpack-deps:curl-browsers
    steps:
      - run:
          command: echo "Hello, build!"
workflows:
  hello-workflow:
    jobs:
      - hello/hello-build
  version: 2
```
{% endraw %}

`config.yml` ファイルは以下のようになります。

{% raw %}
```yaml
version: 2.1

orbs:
  hello: namespace/orb@dev:0.0.1

  workflows:
    hello-workflow:
    jobs:

        - hello/hello-build
```
{% endraw %}

これで、上記の結果をカスタムスクリプトで使用して、その構造を意図する構造と比較するテストを実行できます。 このテスト形式は、Orb インターフェースが Orb ユーザーとの間で交わしている約束事を破ることなく、さまざまなパラメーター入力をテストして、それらのパラメーター入力がコンフィグ処理中の生成物にどのように影響するかを確認したいときに便利です。

### 実行時テスト

実行時テストでは、Orbs を含むアクティブなビルドを実行します。 ビルド内のジョブは、コンフィグの一部である Orbs、またはビルドの開始時にパブリッシュされた Orbs にのみ依存するため、このテストを実行するには特別な計画が必要です。

1つの選択肢として、CircleCI CLI を使用し、ビルド内の Machine Executor 上で `circleci local execute` を使用してローカルビルドを実行し、ビルドのジョブ内でジョブを実行する方法があります。 こうすると、ビルド出力を `stdout` に表示してアサーションすることができます。 ただし、ローカルビルドにはワークフローをサポートしないなどの注意点があるため、この方法を利用できないことがあります。 この方法は、Orb エレメントを使用するビルドの実際の実行出力をテストする必要がある場合にもたいへん便利です。

The other main approach to runtime testing is to make the orb entities available to your job's configuration directly.

One option is to make checks using post-steps for jobs that you run and test, or subsequent steps for commands that you run and test. These can check things like filesystem state, but cannot make assertions about the output of the jobs and commands

**Note** CircleCI is working to improve this limitation and welcomes feedback on your ideal mechanism for testing orbs.

Another approach is to use your orb source as your `config.yml`. If you define your testing and publishing jobs in your orb, they will have access to everything defined in the orb. The downside is that you may need to add extraneous jobs and commands to your orb, and your orb will depend on any orbs that you need for testing and publishing.

Yet another approach is when you run a build, publish a dev version of the orb, then do an automated push to a branch which uses a config that uses that dev version. This new build can run the tests. The downside with this approach is that the build that does the real testing is not directly tied to its commit, and you end up with multiple jobs every time you want to change your orb.

### インテグレーションテスト

Sometimes you will want to test how your orbs interact with external services. There are several possible approaches depending on circumstances:

- やり取りするサービスのドライラン機能を Orb でサポートし、そのモードをテストで使用します。
- 適切に設定されたテストアカウントを使用して実際にサービスとやり取りし、パブリッシュされた dev バージョンの Orb を使用してこのテストを実行するリポジトリを別途用意します。
- ジョブの別のコンテナでローカルサービスをスピンアップします。

## Orb テストのベストプラクティス

The most significant issue when testing orbs is that it is not straightforward to push a new commit to a repository containing orb source code. This is because orbs are interpolated into an expanded `config.yml` at build inception and may not have the newest changes to the orb contained in that commit.

There are several different approaches you can use to test your orbs (for example, using inline orbs or external repositories) to ensure orb compatibility with the CircleCI platform. CircleCI is also in the process of developing newer ways for you to test your orbs.

## Methodologies

### ローカルでの Orbs のテスト

One of the easiest ways to test your orbs locally is to create an inline orb. Creating an inline orb enables you to test your orb while in active development. Inline orbs can be useful when developing your orb, or as a convenience for name-spacing jobs and commands in lengthy configurations.

For more detailed information on how to create an inline orb, refer to the [Creating Orbs]({{site.baseurl}}/2.0/creating-orbs/) page in the CircleCI technical documentation.

### Orbs テストの自動化

Testing orbs can be done at a few different levels. Choosing how much testing you want to do will depend on the complexity and scope of the audience for your orb.

In all cases, CircleCI recommends that you make use of the CircleCI CLI to validate your orb locally and/or automate testing in a build. For installation instructions for the CLI see the CLI documentation

For advanced testing, you may also want to use a shell unit testing framework such as BATS.

## 関連項目

- Refer to [Orbs Concepts]({{site.baseurl}}/2.0/using-orbs/) for high-level information about CircleCI orbs.
- Refer to [Orb Publishing Process]({{site.baseurl}}/2.0/creating-orbs/) for information about orbs that you may use in your workflows and jobs.
- Refer to [Orbs Reference]({{site.baseurl}}/2.0/reusing-config/) for examples of reusable orbs, commands, parameters, and executors.
- Refer to [Configuration Cookbook]({{site.baseurl}}/2.0/configuration-cookbook/#configuration-recipes) for more detailed information about how you can use CircleCI orb recipes in your configurations.