---
layout: classic-docs
title: "言語ガイド：Elixir"
short-title: "Elixir"
description: "Elixir プロジェクトの概要と設定例"
categories:
  - language-guides
order: 2
---

これは、単純な Phoenix Web アプリケーション用の注釈付き `config.yml` で、<https://github.com/CircleCI-Public/circleci-demo-elixir-phoenix> から入手できます。

お急ぎの場合は、以下の設定をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーしてください。 お急ぎでなければ、設定全体に目を通し、十分に理解を深めることをお勧めします。

## 設定例

{% raw %}

```yaml
version: 2  # CircleCI Classic ではなく CircleCI 2.0 を使用します
jobs:  # 1回の実行の基本作業単位
  build:  # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要
    parallelism: 1  # このジョブのインスタンスを 1つだけ並列実行します
    docker:  # Docker でステップを実行します
      - image: circleci/elixir:1.7.3  # このイメージをすべての `steps` が実行されるプライマリコンテナとして使用します
        environment:  # プライマリコンテナの環境変数
          MIX_ENV: test
      - image: circleci/postgres:10.1-alpine  # データベースイメージ
        environment:  # データベースの環境変数
          POSTGRES_USER: postgres
          POSTGRES_DB: app_test
          POSTGRES_PASSWORD:

    working_directory: ~/app  # ステップが実行されるディレクトリ

    steps:  # `build` ジョブを構成するコマンド

      - checkout  # ソースコードを作業ディレクトリにチェックアウトします

      - run: mix local.hex --force  # Hex をローカルにインストールします (プロンプトなし)
      - run: mix local.rebar --force  # rebar のコピーをフェッチします (プロンプトなし)

      - restore_cache:  # 保存されているミックスキャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          keys:  # キャッシュキーのリスト (特定性の高い順)
            - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            - v1-mix-cache-{{ .Branch }}
            - v1-mix-cache
      - restore_cache:  # 保存されているビルドキャッシュを復元します
          keys:
            - v1-build-cache-{{ .Branch }}
            - v1-build-cache
      - run: mix do deps.get, compile  # 更新された依存関係を取得してコンパイルします
      - save_cache:  # ミックスキャッシュを生成して保存します
          key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
          paths: "deps"
      - save_cache:  # 特定性の低い別のキャッシュを作成します
          key: v1-mix-cache-{{ .Branch }}
          paths: "deps"
      - save_cache:  # 念のためにもう 1つキャッシュを保存しておきます
          key: v1-mix-cache
          paths: "deps"
      - save_cache: # *ビルド* キャッシュも忘れずに保存します
          key: v1-build-cache-{{ .Branch }}
          paths: "_build"
      - save_cache: # ビルドキャッシュを 1つ余分に保存します
          key: v1-build-cache
          paths: "_build"

      - run:  # データベースが準備できるまでメインの処理を停止する特殊なユーティリティ
          name: DB を待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run: mix test  # プロジェクトのすべてのテストを実行します

      - store_test_results:  # テストサマリーに表示する JUnit テスト結果をアップロードします
          # 詳しくは https://circleci.com/docs/ja/2.0/collect-test-data/ を参照してください
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME # アプリの名前に置換します
```

{% endraw %}

## 設定の詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2
```

1回の実行は 1つ以上の[ジョブ]({{ site.baseurl }}/ja/2.0/configuration-reference/#jobs)で構成されます。 この実行では [Workflows]({{ site.baseurl }}/ja/2.0/configuration-reference/#workflows) を使用していないため、`build` ジョブを持つ必要があります。

[`working_directory`]({{ site.baseurl }}/ja/2.0/configuration-reference/#job_name) キーを使用して、ジョブの [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を実行する場所を指定します。 `working_directory` のデフォルトの値は `~/project` です (`project` は文字列リテラル)。

ジョブのステップは [Executor]({{ site.baseurl }}/ja/2.0/executor-types/) という名前の仮想環境で実行されます。

この例では [`docker`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker) Executor を使用して、カスタム Docker イメージを指定しています。 [CircleCI 提供の Elixir Docker イメージ](https://circleci.com/docs/ja/2.0/circleci-images/#elixir)を使用します。

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

ジョブのコンテナを選択したら、いくつかのコマンドを実行する [`steps`]({{ site.baseurl }}/ja/2.0/configuration-reference/#steps) を作成します。

[`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) ステップを使用して、ソースコードをチェックアウトします。 デフォルトでは、`working_directory` で指定されたパスにソースコードがチェックアウトされます。

[`run`]({{ site.baseurl }}/ja/2.0/configuration-reference/#run) ステップを使用して、コマンドを実行します。 この例では [Mix](https://elixir-lang.org/getting-started/mix-otp/introduction-to-mix.html) を使用して Elixir ツールをインストールします。

```yaml
    steps:
      - checkout
      - run: mix local.hex --force
      - run: mix local.rebar --force
```

実行の間隔を短縮するには、[依存関係またはソースコードのキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)を検討してください。

[`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) ステップを使用して、いくつかのファイルまたはディレクトリをキャッシュします。 この例では、仮想環境とインストールされたパッケージがキャッシュされます。

[`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) ステップを使用して、キャッシュされたファイルまたはディレクトリを復元します。

{% raw %}

```yaml
      - restore_cache:
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

最後に、データベースがオンラインになるまで待ち、テストスイートを実行します。 テストの実行後、CircleCI Web アプリで使用できるようにテスト結果をアップロードします。

```yaml
      - run:
          name: DB を待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
      - run: mix test
      - store_test_results:
          path: _build/test/lib/REPLACE_WITH_YOUR_APP_NAME
```

## 関連項目

[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)
[データベースの設定]({{ site.baseurl }}/ja/2.0/databases/)
