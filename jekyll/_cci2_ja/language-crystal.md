---
layout: classic-docs
title: "言語ガイド: Crystal"
short-title: "Crystal"
description: "CircleCI 2.0 での Crystal を使用したビルドとテスト"
categories:
  - language-guides
order: 9
version:
  - Cloud
  - Server v2.x
---

*[チュートリアル & 2.0 サンプル アプリケーション]({{ site.baseurl }}/ja/2.0/tutorials/) > 言語ガイド: Crystal*

このガイドでは、CircleCI で最小限の Crystal アプリケーションをビルドする方法について説明します。

## 概要
お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある `.circleci/config.yml` に貼り付け、ビルドを開始してください。

Crystal プロジェクトのサンプルは以下のリンクで確認できます。

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-crystal/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。

- <a href="https://github.com/CircleCI-Public/circleci-demo-crystal"
target="_blank">GitHub 上の Crystal デモ プロジェクト</a>

In the project you will find a commented CircleCI configuration file <a href="https://github.com/CircleCI-Public/circleci-demo-crystal/blob/master/.circleci/config.yml" target="_blank">`.circleci/config.yml`</a>.

このアプリケーションでは Crystal 0.27 と Kemal 0.25 を使用しています。 Crystal と Kemal は速いペースで開発が進められています。 Docker イメージを `:latest` バージョンに変更すると、互換性を損なう変更が発生する可能性があります。

## 設定ファイルの例
{: #sample-configuration }

{% raw %}
```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 一連のジョブ
  build: 
    working_directory: ~/demo_app
    docker: # Docker でビルド ステップを実行します

      - image: crystallang/crystal:0.27.0 # すべての `steps` が実行されるプライマリ Docker コンテナ
    steps: # 一連の実行可能ステップ
      - checkout # ソース コードを作業ディレクトリにチェックアウトします
      - restore_cache: # 依存関係キャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: 依存関係のインストール
          command: shards install
      - save_cache: # 依存関係キャッシュを保存するステップ
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
      - run:
          name: テスト
          command: crystal spec
# デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps: # a collection of executable steps
      - checkout # checks out source code to working directory
      - restore_cache: # Restore dependency cache
      # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: Install dependencies.
          command: shards install
      - save_cache: # 依存関係キャッシュを保存するステップ
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
      - run:
          name: テスト
          command: crystal spec
# デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```
{% endraw %}

## 設定ファイルの詳細
{: #config-walkthrough }

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows)を使用していないため、`build` ジョブを持つ必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは \[Executor\]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。 この例では、[公式 Crystal Docker イメージ](https://hub.docker.com/r/crystallang/crystal/)がプライマリ コンテナとして使用されています。 ジョブのすべてのコマンドがこのコンテナで実行されます。

```yaml
jobs:
  build: 
    working_directory: ~/demo_app
    docker:
      - image: crystallang/crystal:0.27.0
```

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

実行の間隔を短縮するには、[依存関係またはソース コードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、インストールされたパッケージ ("Shards") がキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。 この例では、`shard.lock` ファイルのチェックサムを使用して、依存関係キャッシュが変更されているかどうかを判断します。

{% raw %}
```yaml
    steps: #

      - checkout
      - restore_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: 依存関係のインストール
          command: shards install
      - save_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
          command: shards install
      - save_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
```
{% endraw %}

最後に `crystal spec` を実行して、プロジェクトのテスト スイートを実行します。

```yaml
      - run:
          name: テスト
          command: crystal spec
```

完了です。 これで基本的な Crystal アプリケーション用に CircleCI 2.0 をセットアップできました。

## デプロイ
{: #deploy }

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
