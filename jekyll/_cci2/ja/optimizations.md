---
layout: classic-docs
title: "最適化"
short-title: "最適化"
description: "CircleCI 2.0 ビルドの最適化"
categories:
  - getting-started
order: 1
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 最適化の各方法について簡単に説明し、考えられるユース ケースを提示し、ジョブを最適化して高速化する例を示します。

- 目次
{:toc}

**メモ:** このドキュメントで説明している機能の中には、特定の料金プランが必要なものがあります。 CircleCI が提供しているプランの概要については、[料金プランのページ](https://circleci.com/ja/pricing/usage/)を参照してください。 または、CircleCI の Web アプリケーションにログインし、`[Settings (設定)] > [Plan Settings (プラン設定)]` の順に移動して、プランを調整してください。

## Docker イメージの選択

プロジェクトに最適な Docker イメージを選択すると、ビルド時間が大幅に短縮されます。 たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを構成し、イメージを指定するときには、以下の点を考慮してください。

- CircleCI には多数の[コンビニエンス イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#section=configuration)が用意されています。多くは公式の Docker イメージに基づいていますが、便利な言語ツールもプリインストールされています。
- プロジェクトに特化した[独自のイメージを作成](https://circleci.com/ja/docs/2.0/custom-images/#section=configuration)することも可能です。 それが容易になるよう、[Docker イメージ ビルド ウィザード](https://github.com/circleci-public/dockerfile-wizard)と、[イメージを手動で作成するためのガイダンス](https://circleci.com/ja/docs/2.0/custom-images/#カスタム-イメージの手動作成)が用意されています。

## 依存関係のキャッシュ

ジョブの最適化にあたってまず検討すべき項目の 1 つがキャッシュです。 ジョブで任意の時点のデータをフェッチする場合は、キャッシュを利用できる可能性があります。 一般的によく用いられるのが、パッケージ マネージャーや依存関係管理ツールです。 たとえば、プロジェクトで Yarn、Bundler、Pip などを利用すると、ジョブの実行中にダウンロードする依存関係は、ビルドのたびに再ダウンロードされるのではなく、後で使用できるようにキャッシュされます。

{% raw %}

```yaml
version: 2
jobs:
  build:
    steps: # 'build' ジョブを構成する一連の実行可能コマンド
      - checkout # ソース コードを作業ディレクトリにプルします
      - restore_cache: # **Branch キー テンプレート ファイルまたは requirements.txt ファイルが前回の実行時から変更されていない場合、保存されている依存関係キャッシュを復元します**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # pip を使用して、仮想環境をインストールしてアクティブ化します
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** 依存関係キャッシュを保存する特別なステップ **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```

{% endraw %}

キャッシュの `key` で `checksum` を使用していることに注目してください。これを使用することで、特定の依存関係管理ファイル (`package.json` や、上記の `requirements.txt` など) に*変更*があるかどうかを判断でき、それに応じてキャッシュが更新されます。 また上記の例では、[`restore_cache`]({{site.baseurl}}/2.0/configuration-reference#restore_cache) で動的な値をキャッシュ キーに挿入することで、キャッシュの更新が必要となる条件をより正確に制御できるようにしています。

依存関係のインストール ステップが正常に終了したことを確認してから、キャッシュのステップを追加することをお勧めします。 依存関係のステップで失敗したままキャッシュする場合は、不良キャッシュによるビルドの失敗を回避するために、キャッシュ キーを変更する必要があります。

詳細については、[キャッシュに関するドキュメント]({{site.baseurl}}/2.0/caching)を参照してください。

## ワークフロー

ワークフローは、一連のジョブとその実行順序を定義する機能です。 ビルド中の任意の時点で 2 つのジョブを互いに独立して実行してかまわないステップがある場合は、ワークフローを使用すると便利です。 ワークフローには、ビルド構成を強化するための機能もいくつか用意されています。 詳細については、[ワークフローのドキュメント]({{site.baseurl}}/2.0/workflows/)を参照してください。

**メモ:** ワークフローはすべてのプランでご利用いただけます。ただし、ジョブを並列実行するには、ジョブを実行するための複数のマシンがお使いのプランで提供されている必要があります。

```yaml
version: 2.1
jobs: # ここで、"build" と "test" の 2 つのジョブを定義します
  build:
    docker: # Docker Executor を使用します
      - image: circleci/<言語>:<バージョン タグ> # Docker イメージを指定します
    steps:
      - checkout # VCS からコードをプル ダウンします
      - run: <コマンド> # コマンドを実行します
  test:
    docker: # 上記の Docker キーと同じです
      - image: circleci/<言語>:<バージョン タグ>
    steps:
      - checkout
      - run: <コマンド>
workflows: # ここで、ジョブを 1 つのワークフローとしてオーケストレーションできます
  version: 2
  build_and_test: # "build_and_test" という名前の 1 つのワークフロー
    jobs: # `build` ジョブと `test` ジョブを並列で実行します
      - build
      - test
```

その他のワークフローの例については、[CircleCI デモ ワークフロー リポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/)を参照してください。

## ワークスペース

**メモ: ** ワークスペースの使用は、[ワークフロー](#workflows)を使用していることを前提としています。

ワークスペースを使用すると、*ダウンストリーム ジョブ*に必要な、*その実行に固有*のデータを渡せます。 つまり、ワークスペースを使用して、ビルドの最初の段階で実行するジョブのデータをフェッチし、そのデータをビルドの後段で実行するジョブで*利用する*ことができます。

任意のジョブのデータを永続化し、`attach_workspace` キーを使用してダウンストリーム ジョブで利用できるようにするには、[`persist_to_workspace`]({{ site.baseurl}}/2.0/configuration-reference#persist_to_workspace) キーを使用するようにジョブを構成します。 `persist_to_workspace` の paths: プロパティで指定したファイルとディレクトリは、root キーで指定したディレクトリからの相対パスにある、ワークフローの一時ワークスペースにアップロードされます。 その後、それらのファイルとディレクトリは、後続のジョブ (およびワークフローの再実行) で使用するためにアップロードされ、利用可能になります。

ワークスペースの使用方法については、[ワークフローに関するドキュメント]({{site.baseurl}}/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を参照してください。

## 並列処理

**メモ:** ビルドで使用できる並列処理のレベル (1、2、4 など) は、お使いの CircleCI プランによって決まります。

プロジェクトに大規模なテスト スイートがある場合は、CircleCI の[テストの並列処理機能](https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/#circleci-cli-を使用したテストの分割)で [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) を設定するか、[サードパーティのアプリケーションまたはライブラリ](https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/#その他のテスト分割方法)を利用するようにビルドを構成して、テストを複数のマシンに分割できます。 CircleCI では、複数のマシンにファイルごとに自動的にテストを割り当てることや、テストの割り当て方法を手動でカスタマイズすることも可能です。

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  docker:
    - image: circleci/<言語>:<バージョン タグ>
  test:
    parallelism: 4
```

テストの分割の詳細については、[並列処理に関するドキュメント]({{site.baseurl}}/2.0/parallelism-faster-jobs)を参照してください。

## リソース クラス

**メモ:** クラウド版で [`resource_class`]({{site.baseurl}}/2.0/configuration-reference#resource_class) 機能を使用するには、その機能を含むプランが必要です。 コンテナ ベースのプランをご利用の場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)し、この機能をアカウントで有効にしてください。 セルフホスティング環境では、システム管理者がリソース クラスのオプションを設定できます。

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 クラウド版で使用可能なクラスの一覧は、[こちらの表](https://circleci.com/ja/docs/2.0/configuration-reference/#resource_class)にまとめています。オンプレミス版の一覧については、システム管理者にお問い合わせください。 `resource_class` が指定されていない場合や、無効なクラスが指定されている場合は、デフォルトの `resource_class: medium` が使用されます。

以下に、`resource_class` 機能の使用例を示します。

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large # 4 基の vCPU と 8 GB の RAM を搭載したマシンを実装します
    steps:
      - run: make test
      - run: make
```

## Docker レイヤー キャッシュ

**メモ:** Docker レイヤー キャッシュ (DLC) を使用するには、その機能を含むプランが必要です。 コンテナ ベースのプランをお使いの場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)して、アカウントの DLC を有効にしてください。

DLC は、ビルド内の Docker イメージの*ビルド時間*を短縮するのに役立つ機能です。 日常的な CI/CD プロセスの中で頻繁に Docker イメージをビルドする場合に便利に活用できます。

DLC は、ジョブ内でビルドしたイメージ レイヤーを*保存*し、それを後続のビルドで使用できるようにするという点で、前述の*依存関係のキャッシュ*に似ています。

```yaml
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers # ここでは DLC は動作しません。キャッシュの状況は、イメージ レイヤーがどれだけ共有されているかによって決まります。
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここで、DLC はレイヤーを明示的にキャッシュし、リビルドを回避しようとします。
      - run: docker build .
```

詳細については、[DLC に関するドキュメント]({{site.baseurl}}/2.0/docker-layer-caching)を参照してください。

## 関連項目
{:.no_toc}

- ビルドで構成可能な機能の一覧については、「[CircleCI を設定する]({{ site.baseurl}}/2.0/configuration-reference/)」を参照してください。
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
- Yarn とキャッシュを使用してビルドを高速化する方法については、[こちらのドキュメント]({{site.baseurl}}/2.0/yarn)を参照してください。