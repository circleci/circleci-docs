---
layout: classic-docs
title: "言語ガイド: Elixir"
short-title: "Elixir"
description: "Elixir プロジェクトの概要と構成例"
categories:
  - language-guides
order: 2
---

これは、単純な Phoenix Web アプリケーション用の注釈付き `config.yml` で、<https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix> から入手できます。

お急ぎの場合は、以下の構成をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) にコピーしてください。 お急ぎでなければ、全体に目を通し、十分に理解を深めることをお勧めします。

## 設定ファイルの例

{% raw %}

```yaml
version: 2  # CircleCI Classic ではなく CircleCI 2.0 を使用します
jobs:  # 1 回の実行の基本作業単位
  build:  # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    parallelism: 1  # このジョブのインスタンスを 1 つだけ並列実行します
    docker:  # Docker でステップを実行します
      - image: circleci/elixir:1.7.3  # このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
        environment:  # プライマリ コンテナの環境変数
          MIX_ENV: test
      - image: circleci/postgres:10.1-alpine  # データベース イメージ
        environment:  # データベースの環境変数
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # ステップが実行されるディレクトリ

    steps:  # `build` ジョブを構成するコマンド

      - checkout  # ソース コードを作業ディレクトリにチェックアウトします

      - run: mix local.hex --force  # Hex をローカルにインストールします (プロンプトなし)
      - run: mix local.rebar --force  # rebar のコピーをフェッチします (プロンプトなし)

      - restore_cache:  # 保存されているミックス キャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          keys:  # キャッシュ キーのリスト (特定性の高い順)
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # 保存されているビルド キャッシュを復元します
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # 更新された依存関係を取得してコンパイルします
      - save_cache:  # ミックス キャッシュを生成して保存します
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:  # 特定性の低い別のキャッシュを作成します
          key: v1-mix-cache-{{ .Branch }}
          paths: "deps"
      - save_cache:  # もう 1 つキャッシュを保存しておきます (念のため)
          key: v1-mix-cache
          paths: "deps"
      - save_cache: # *ビルド* キャッシュも忘れずに保存します
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
      - save_cache: # ビルド キャッシュを 1 つ余分に保存します
          key: v1-build-cache
          paths: "_build"

      - run:  # データベースが準備できるまでメインの処理を停止する特別なユーティリティ
          name: DB を待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # プロジェクトのすべてのテストを実行します

      - store_test_results:  # テスト サマリーに表示する JUnit テスト結果をアップロードします
          # 詳しくは https://circleci.com/ja/docs/2.0/collect-test-data/ を参照してください
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # アプリの名前に置換します
```

{% endraw %}

## 設定ファイルの詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

実行処理は 1 つ以上の[ジョブ]({{ site.baseurl }}/2.0/configuration-reference/#jobs)で構成されます。 この実行では [ワークフロー]({{ site.baseurl }}/2.0/configuration-reference/#workflows)を使用しないため、`build` ジョブを記述する必要があります。

[`working_directory`]({{ site.baseurl }}/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブの各ステップは [Executor]({{ site.baseurl }}/2.0/executor-types/) という仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 [CircleCI 提供の Elixir Docker イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#elixir)を使用します。

```yaml
jobs:
  build:
    parallelism: 1
    docker:
      - image: circleci/elixir:1.7.3
        environment:
          MIX_ENV: test
      - image: circleci/postgres:10.1-alpine
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app 
```

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) ステップを使用して、ソース コードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソース コードがチェックアウトされます。

[`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) ステップを使用して、コマンドを実行します。 この例では [Mix](https://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html) を使用して Elixir ツールをインストールします。

```yaml
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar --force
```

実行の間隔を短縮するには、[依存関係またはソース コードのキャッシュ]({{ site.baseurl }}/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、仮想環境とインストールされたパッケージがキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}

```yaml
<br />      - restore_cache:
          keys:
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile
      - save_cache:
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:
          key: v1-mix-cache-{{ .Branch }}
          paths: "deps"
      - save_cache:
          key: v1-mix-cache
          paths: "deps"
      - save_cache:
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
      - save_cache:
          key: v1-build-cache
          paths: "_build"
```

{% endraw %}

最後に、データベースがオンラインになるまで待ち、テスト スイートを実行します。 テストの実行後、CircleCI Web アプリで使用できるようにテスト結果をアップロードします。

```yaml
      - run:
          name: DB の待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run: mix test
      - store_test_results:
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME
```

## 関連項目

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/) [データベースの構成]({{ site.baseurl }}/2.0/databases/)