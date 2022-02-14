---
layout: classic-docs
title: "Optimizations Overview"
short-title: "Optimizations Overview"
description: "CircleCI build optimizations"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

This document provides an overview of ways to optimize your CircleCI configuration. Each optimization method will be described briefly, and present possible use cases for speeding up your jobs.

* TOC
{:toc}

**Warning:** Persisting data is project specific, and examples is this document are not meant to be copied and pasted into your project. The examples are meant to be guides to help you find areas of opportunity to optimize your own projects.
{: class="alert alert-warning"}

## Docker image choice
{: #docker-image-choice }

プロジェクトに最適な Docker イメージを選択すると、ビルド時間が大幅に短縮されます。 たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを構成し、イメージを指定するときには、以下の点を考慮してください。

* CircleCI には多数の [CircleCI イメージ](https://circleci.com/docs/2.0/circleci-images/#section=configuration) が用意されています。 多くは公式の Docker イメージに基づいていますが、便利な言語ツールもプリインストールされています。
* プロジェクトに特化した[独自のイメージを作成](https://circleci.com/ja/docs/2.0/custom-images/#section=configuration)することも可能です。 それが容易になるよう、[Docker イメージ ビルド ウィザード](https://github.com/circleci-public/dockerfile-wizard)と、[イメージを手動で作成するためのガイダンス](https://circleci.com/ja/docs/2.0/custom-images/#カスタム-イメージの手動作成)が用意されています。

## 依存関係のキャッシュ
{: #caching-dependencies }

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

キャッシュの `key` で `checksum` を使用していることに注目してください。これを使用することで、特定の依存関係管理ファイル (`package.json` や、上記の `requirements.txt` など) に_変更_があるかどうかを判断でき、それに応じてキャッシュが更新されます。 また上記の例では、[`restore_cache`]({{site.baseurl}}/2.0/configuration-reference#restore_cache) で動的な値をキャッシュ キーに挿入することで、キャッシュの更新が必要となる条件をより正確に制御できるようにしています。

依存関係のインストール ステップが正常に終了したことを確認してから、キャッシュのステップを追加することをお勧めします。 依存関係のステップで失敗したままキャッシュする場合は、不良キャッシュによるビルドの失敗を回避するために、キャッシュ キーを変更する必要があります。

Consult the [Caching]({{site.baseurl}}/2.0/caching) page to learn more.

## ワークフロー
{: #workflows }

ワークフローは、一連のジョブとその実行順序を定義する機能です。 ビルド中の任意の時点で 2 つのジョブを互いに独立して実行してかまわないステップがある場合は、ワークフローを使用すると便利です。 ワークフローには、ビルド構成を強化するための機能もいくつか用意されています。 詳細については、[ワークフローのドキュメント]({{site.baseurl}}/2.0/workflows/)を参照してください。

**メモ:** ワークフローはすべてのプランでご利用いただけます。ただし、ジョブを同時実行するには、ジョブを実行するための複数のマシンがお使いのプランで提供されている必要があります。

```yaml
version: 2.1
jobs: # here we define two jobs: "build" and "test"
  build:
    docker: # the docker executor is used
      - image: circleci/<language>:<version TAG> # An example docker image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout # Pulls code down from your VCS
      - run: <command> # An example command
  test:
    docker: # same as previous docker key.
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: <command>
workflows: # Here we can orchestrate our jobs into a workflow
  version: 2
  build_and_test: # A single workflow named "build_and_test"
    jobs: # we run our `build` job and `test` job concurrently.
      - build
      - test
```

その他のワークフローの例については、[CircleCI デモ ワークフロー リポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/)を参照してください。

## ワークスペース
{: #workspaces }

**メモ: ** ワークスペースの使用は、[ワークフロー](#workflows)を使用していることを前提としています。

ワークスペースを使用すると、_ダウンストリーム ジョブ_に必要な、_その実行に固有_のデータを渡せます。 つまり、ワークスペースを使用して、ビルドの最初の段階で実行するジョブのデータをフェッチし、そのデータをビルドの後段で実行するジョブで_利用する_ことができます。

任意のジョブのデータを永続化し、[`attach_workspace`]({{ site.baseurl}}/2.0/configuration-reference#attachworkspace) キーを使用してダウンストリーム ジョブで利用できるようにするには、[`persist_to_workspace`]({{ site.baseurl}}/2.0/configuration-reference#persisttoworkspace) キーを使用するようにジョブを構成します。 `persist_to_workspace` の paths: プロパティで指定したファイルとディレクトリは、root キーで指定したディレクトリからの相対パスにある、ワークフローの一時ワークスペースにアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

ワークスペースの使用方法については、[ワークフローに関するドキュメント]({{site.baseurl}}/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を参照してください。

## 並列処理
{: #parallelism }

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) or a [third party application or library](https://circleci.com/docs/2.0/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  docker:
    - image: circleci/<language>:<version TAG>
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  test:
    parallelism: 4
```

テストの分割の詳細については、[並列処理に関するドキュメント]({{site.baseurl}}/2.0/parallelism-faster-jobs)を参照してください。

## リソース クラス
{: #resource-class }

**Note:**  If you are on a container-based plan, you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable this feature on your account. セルフホスティング環境では、システム管理者がリソース クラスのオプションを設定できます。

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 クラウド版で使用可能なクラスの一覧は、[こちらの表](https://circleci.com/docs/2.0/configuration-reference/#resourceclass)にまとめています。オンプレミス版の一覧については、システム管理者にお問い合わせください。

以下に、`resource_class` 機能の使用例を示します。

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
    resource_class: large # implements a machine with 4 vCPUS and 8gb of ram.
    steps:
      - run: make test
      - run: make
```

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

Docker layer caching is a feature that can help to reduce the _build time_ of a Docker image in your build. DLC is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_ mentioned above in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

{:.tab.switcher.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

{:.tab.switcher.Server_3}
```yaml
version: 2.1
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

{:.tab.switcher.Server_2}

```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with 
# browser testing require the use of the CircleCI browser-tools orb, available 
# with config version 2.1.
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:14.17.3-buster-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

詳細については、[DLC に関するドキュメント]({{site.baseurl}}/2.0/docker-layer-caching)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- ビルドで構成可能な機能の一覧については、「[CircleCI を設定する]({{ site.baseurl}}/2.0/configuration-reference/)」を参照してください。
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
- Yarn とキャッシュを使用してビルドを高速化する方法については、[こちらのドキュメント]({{site.baseurl}}/2.0/yarn)を参照してください。
