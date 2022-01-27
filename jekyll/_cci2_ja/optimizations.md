---
layout: classic-docs
title: "最適化"
short-title: "最適化"
description: "CircleCI build optimizations"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 最適化の各方法について簡単に説明し、考えられるユース ケースを提示し、ジョブを最適化して高速化する例を示します。

* TOC
{:toc}

**Note**: For Cloud customers, some of the features discussed in this document may require a specific pricing plan. Visit our [pricing page](https://circleci.com/pricing/) to get an overview of the plans CircleCI offers. Or, if you are a logged in to the CircleCI web application, go to **Plan** from the sidebar to view and make adjustments to your plan.

## Docker image choice
{: #docker-image-choice }

Choosing the right docker image for your project can have huge impact on build time. たとえば、言語の基本的なイメージを選択した場合は、パイプラインを実行するたびに依存関係とツールをダウンロードする必要があります。一方、それらの依存関係とツールが事前にインストールされているイメージを選択、ビルドした場合は、各ビルド実行時にダウンロードにかかる時間を節約できます。 プロジェクトを構成し、イメージを指定するときには、以下の点を考慮してください。

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

キャッシュの `key` で `checksum` を使用していることに注目してください。これを使用することで、特定の依存関係管理ファイル (`package.json` や、上記の `requirements.txt` など) に_変更_があるかどうかを判断でき、それに応じてキャッシュが更新されます。 In the above example, the [`restore_cache`]({{site.baseurl}}/2.0/configuration-reference#restore_cache) example uses interpolation to put dynamic values into the cache-key, allowing more control in what exactly constitutes the need to update a cache.

依存関係のインストール ステップが正常に終了したことを確認してから、キャッシュのステップを追加することをお勧めします。 依存関係のステップで失敗したままキャッシュする場合は、不良キャッシュによるビルドの失敗を回避するために、キャッシュ キーを変更する必要があります。

詳細については、[キャッシュに関するドキュメント]({{site.baseurl}}/2.0/caching)を参照してください。

## ワークフロー
{: #workflows }

ワークフローは、一連のジョブとその実行順序を定義する機能です。 ビルド中の任意の時点で 2 つのジョブを互いに独立して実行してかまわないステップがある場合は、ワークフローを使用すると便利です。 ワークフローには、ビルド構成を強化するための機能もいくつか用意されています。 詳細については、[ワークフローのドキュメント]({{site.baseurl}}/2.0/workflows/)を参照してください。

**Note**: Workflows are available to all plans, but running jobs concurrently assumes that your plan provides multiple machines to execute on.

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

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{ site.baseurl}}/2.0/configuration-reference#attach_workspace) key, configure the job to use the [`persist_to_workspace`]({{ site.baseurl}}/2.0/configuration-reference#persist_to_workspace) key. `persist_to_workspace` の paths: プロパティで指定したファイルとディレクトリは、root キーで指定したディレクトリからの相対パスにある、ワークフローの一時ワークスペースにアップロードされます。 その後、ファイルとディレクトリはアップロードされ、続くジョブで (および Workflow の再実行時に) 利用できるようにします。

ワークスペースの使用方法については、[ワークフローに関するドキュメント]({{site.baseurl}}/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を参照してください。

## 並列処理
{: #parallelism }

**メモ:** ビルドで使用できる並列処理のレベル (1、2、4 など) は、お使いの CircleCI プランによって決まります。

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

**Note:** An eligible plan is required to use the [`resource_class`]({{site.baseurl}}/2.0/configuration-reference#resource_class) feature on Cloud. コンテナ ベースのプランをご利用の場合は、[サポート チケットをオープン](https://support.circleci.com/hc/ja/requests/new)し、この機能をアカウントで有効にしてください。 セルフホスティング環境では、システム管理者がリソース クラスのオプションを設定できます。

`resource_class` 機能を使用すると、CPU と RAM のリソース量をジョブごとに構成できます。 For Cloud, see [this table](https://circleci.com/docs/2.0/configuration-reference/#resource_class) for a list of available classes, and for self hosted installations contact your system administrator for a list.

以下に、`resource_class` 機能の使用例を示します。

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
    resource_class: large # implements a machine with 4 vCPUS and 8gb of ram.
    steps:
      - run: make test
      - run: make
```

## Docker レイヤーキャッシュ
{: #docker-layer-caching }

**Note**: [The Performance plan](https://circleci.com/pricing/) is required to use Docker Layer Caching. If you are on the container-based plan you will need to upgrade to [the Performance plan](https://circleci.com/pricing/) to enable DLC for your organization.

DLC は、ビルド内の Docker イメージの_ビルド時間_を短縮するのに役立つ機能です。 日常的な CI/CD プロセスの中で頻繁に Docker イメージをビルドする場合に便利に活用できます。

DLC は、ジョブ内でビルドしたイメージ レイヤーを_保存_し、それを後続のビルドで使用できるようにするという点で、前述の_依存関係のキャッシュ_に似ています。

{:.tab.switcher.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # DLC does nothing here, its caching depends on commonality of the image layers.
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

{:.tab.switcher.Server-v2}
```yaml
version: 2.1
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # DLC does nothing here, its caching depends on commonality of the image layers.
        キャッシュの状況は、イメージ レイヤーがどれだけ共有されているかによって決まります。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

保留中のジョブの名前（上記のスクリーンショットでは`build`）をクリックすると、保留中のジョブの承認またはキャンセルを求める承認ダイアログボックスが表示されます。

```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with 
# browser testing require the use of the CircleCI browser-tools orb, available 
# with config version 2.1.
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers # ここでは DLC は動作しません。
        キャッシュの状況は、イメージ レイヤーがどれだけ共有されているかによって決まります。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
        キャッシュの状況は、イメージ レイヤーがどれだけ共有されているかによって決まります。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

詳細については、[DLC に関するドキュメント]({{site.baseurl}}/2.0/docker-layer-caching)を参照してください。

## 関連項目
{: #see-also }
{:.no_toc}

- ビルドで構成可能な機能の一覧については、「[CircleCI を設定する]({{ site.baseurl}}/2.0/configuration-reference/)」を参照してください。
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
- Yarn とキャッシュを使用してビルドを高速化する方法については、[こちらのドキュメント]({{site.baseurl}}/2.0/yarn)を参照してください。
