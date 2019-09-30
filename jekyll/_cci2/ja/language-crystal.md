---
layout: classic-docs
title: "言語ガイド：Crystal"
short-title: "Crystal"
description: "CircleCI 2.0 での Crystal を使用したビルドとテスト"
categories:
  - language-guides
order: 9
---

*[チュートリアル & 2.0 サンプルアプリケーション]({{ site.baseurl }}/ja/2.0/tutorials/) > 言語ガイド：Crystal*

このガイドでは、CircleCI で最小限の Crystal アプリケーションを作成する方法について説明します。

## 概要

お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある `.circleci/config.yml` にコピーし、ビルドを開始してください。

Crystal プロジェクトのサンプルは以下のリンクで確認できます。

- <a href="https://github.com/CircleCI-Public/circleci-demo-crystal"
target="_blank">GitHub 上の Crystal デモプロジェクト</a>

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-crystal/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。

このアプリケーションでは Crystal 0.27 と Kemal 0.25 を使用しています。 Crystal と Kemal は速いペースで開発が進められています。 Docker イメージを `:latest` バージョンに変更すると、互換性を損なう変更が発生する可能性があります。

## 設定例

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # ジョブの集合
  build: 
    working_directory: ~/demo_app
    docker: # Docker でビルドステップを実行します

      - image: crystallang/crystal:0.27.0 # すべての `steps` が実行されるプライマリ Docker コンテナ
    steps: # 実行可能ステップの集合
      - checkout # ソースコードを作業ディレクトリにチェックアウトします
      - restore_cache: # 依存関係キャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: 依存関係をインストール
          command: shards install
      - save_cache: # 依存関係キャッシュを保存するステップ
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
      - run:
          name: テスト
          command: crystal spec
# デプロイ例については https://circleci.com/docs/ja/2.0/deployment-integrations/ を参照してください    
```

{% endraw %}

## 設定の詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2
```

1回の実行は 1つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) を使用していないため、`build` ジョブを持つ必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブのステップは \[Executor\]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。 この例では、[公式 Crystal Docker イメージ](https://hub.docker.com/r/crystallang/crystal/)がプライマリコンテナとして使用されています。 ジョブのすべてのコマンドは、このコンテナで実行されます。

```yaml
jobs:
  build: 
    working_directory: ~/demo_app
    docker:
      - image: crystallang/crystal:0.27.0
```

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソースコードがチェックアウトされます。

実行の間隔を短縮するには、[依存関係またはソースコードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、インストールされたパッケージ ("Shards") がキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。 この例では、`shard.lock` ファイルのチェックサムを使用して、依存関係キャッシュが変更されているかどうかを判断します。

{% raw %}

```yaml
    steps: #

      - checkout
      - restore_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
      - run:
          name: 依存関係をインストール
          command: shards install
      - save_cache:
          key: dependency-cache-{{ checksum "shard.lock" }}
          paths:
            - ./lib
```

{% endraw %}

最後に `crystal spec` を実行して、プロジェクトのテストスイートを実行します。

```yaml
      - run:
          name: テスト
          command: crystal spec
```

完了です。 これで基本的な Crystal アプリケーション用に CircleCI 2.0 を設定できました。

## デプロイ

デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。