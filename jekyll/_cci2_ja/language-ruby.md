---
layout: classic-docs
title: "言語ガイド：Ruby"
short-title: "Ruby"
description: "CircleCI 2.0 での Ruby および Rails を使用したビルドとテスト"
categories:
  - language-guides
order: 8
---

このガイドでは、CircleCI で Ruby on Rails アプリケーションを作成する方法について説明します。

* 目次
{:toc}

## 概要

{:.no_toc}

お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーし、ビルドを開始してください。

CircleCI は、以下のページで Ruby on Rails サンプルプロジェクトを提供しています。

* <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails" target="_blank">GitHub 上の Ruby on Rails デモプロジェクト</a>
* [CircleCI でビルドされた Ruby on Rails デモプロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-ruby-rails){:rel="nofollow"}

このプロジェクトには、コメント付きの CircleCI 設定ファイル <a href="https://github.com/CircleCI-Public/circleci-demo-ruby-rails/blob/master/.circleci/config.yml" target="_blank"><code>.circleci/config.yml</code></a> が含まれます。

このアプリケーションでは、最新の安定した Rails バージョン 5.1 (`rspec-rails`)、[RspecJunitFormatter](https://github.com/sj26/rspec_junit_formatter)、および PostgreSQL データベースを使用しています。

このアプリケーションのビルドには、ビルド済み [CircleCI Docker イメージ](http://circleci.com/docs/ja/2.0/circleci-images)の 1つを使用しています。

## CircleCI のビルド済み Docker イメージ

CircleCI のビルド済みイメージを使用することを検討してください。このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/ruby/>) から必要な Ruby バージョンを選択できます。

セカンダリ「サービス」コンテナとして使用するデータベースイメージも Docker Hub の `circleci` ディレクトリで提供されています。

* * *

## 設定例

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # ステップの集合
  build: # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要
    parallelism: 3 # このジョブのインスタンスを 3つ並列実行します
    docker: # Docker でステップを実行します
      - image: circleci/ruby:2.4.2-jessie-node # このイメージをすべての `steps` が実行されるプライマリコンテナとして使用します
        environment: # プライマリコンテナの環境変数
          BUNDLE_JOBS: 3
          BUNDLE_RETRY: 3
          BUNDLE_PATH: vendor/bundle
          PGHOST: 127.0.0.1
          PGUSER: circleci-demo-ruby
          RAILS_ENV: test
      - image: circleci/postgres:9.5-alpine # データベースイメージ
        environment: # データベースの環境変数
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
    steps: # 実行可能コマンドの集合
      - checkout # ソースコードを作業ディレクトリにチェックアウトする特別なステップ

      # Bundler のバージョンを指定します

      - run:
          name: Bundler を指定
          command: bundle -v

      # バンドルキャッシュを復元します
      # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください

      - restore_cache:
          keys:
            - rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
            - rails-demo-bundle-v2-

      - run: # Ruby の依存関係をインストールします
          name: バンドルインストール
          command: bundle check || bundle install

      # Ruby の依存関係のバンドルキャッシュを保存します

      - save_cache:
          key: rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      # アプリケーションで Webpacker または Yarn を他の何らかの方法で使用する場合にのみ必要です

      - restore_cache:
          keys:
            - rails-demo-yarn-{{ checksum "yarn.lock" }}
            - rails-demo-yarn-

      - run:
          name: Yarn をインストール
          command: yarn install --cache-folder ~/.cache/yarn

      # Yarn または Webpacker のキャッシュを保存します

      - save_cache:
          key: rails-demo-yarn-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn

      - run:
          name: DB を待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: データベースをセットアップ
          command: bin/rails db:schema:load --trace

      - run:
          name: RSpec を並列実行
          command: |
            bundle exec rspec --profile 10 \
                              --format RspecJunitFormatter \
                              --out test_results/rspec.xml \
                              --format progress \
                              $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

      # タイミング解析のテスト結果を保存します

      - store_test_results: # テストサマリー (https://circleci.com/docs/ja/2.0/collect-test-data/) に表示するテスト結果をアップロードします
          path: test_results
      # デプロイコンフィグの例については https://circleci.com/docs/ja/2.0/deployment-integrations/ を参照してください
```

{% endraw %}

* * *

## Ruby on Rails のデモプロジェクトのビルド

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモプロジェクトをビルドする方法を示します。

1. お使いのアカウントに、GitHub 上の[プロジェクトをフォーク](https://github.com/CircleCI-Public/circleci-demo-ruby-rails/fork)します。
2. CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、フォークしたプロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

* * *

## 設定の詳細

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始まります。 このキーは、互換性を損なう変更に関する警告を表示するために使用されます。

```yaml
version: 2
```

次に、`jobs` キーを追加します。 それぞれのジョブは、ビルド、テスト、デプロイのプロセス内の各段階を表しています。 このサンプルアプリケーションには 1つの `build` ジョブのみが必要なので、他のすべてのオプションはこのキーの下にネストします。

各ジョブには、`working_directory` を指定するオプションがあります。 このサンプルコンフィグでは、ホームディレクトリにあるプロジェクトから作業ディレクトリの名前が付けられています。

```yaml
version: 2
jobs:
  build:
    parallelism: 3
    working_directory: ~/circleci-demo-ruby-rails
```

他のディレクトリが指定されない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとして使用されます。

`working_directory` の直下の `docker` キーで、コンテナイメージを指定できます。

```yaml
    docker:
      - image: circleci/ruby:2.4.2-jessie-node  # 言語イメージ
        environment:
          BUNDLE_JOBS: 3
          BUNDLE_RETRY: 3
          BUNDLE_PATH: vendor/bundle
          PGHOST: 127.0.0.1
          PGUSER: circleci-demo-ruby
          RAILS_ENV: test
      - image: circleci/postgres:9.5-alpine  # サービスイメージ
        environment:
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog
          POSTGRES_PASSWORD: ""
```

この例では、以下の 2つの [CircleCI コンビニエンスイメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#イメージのタイプ)が使用されています。

* Debian Jessie 上で実行され、Ruby 2.4.2 と Node.js をインストールする言語イメージ

* Alpine Linux 上で実行され、PostgreSQL 9.5 をインストールするサービスイメージ

次に、テスト目的でアプリケーションコンテナをデータベースに接続するための環境変数がいくつか追加されています。 `BUNDLE_*` 環境変数は、適切にキャッシュを実行し、Bundler で依存関係をインストールする際のパフォーマンスと信頼性を向上させるために設定されます。

最後に `build` ジョブ内にいくつかの `steps` を追加します。

CircleCI がコードベースで動作するように、最初に `checkout` を置きます。

```yaml
steps:
  - checkout
```

このステップは、プロジェクトコードを作業ディレクトリにチェックアウトするように CircleCI に指示します。

その後、CircleCI はキャッシュをプルダウンします (ある場合)。 初回実行時、または `Gemfile.lock` を変更した場合、これは実行されません。 さらに `bundle install` コマンドが実行され、プロジェクトの依存関係がプルダウンされます。 通常、このタスクは必要時に自動的に実行されるため、これを直接呼び出すことはありません。ただし、このタスクを直接呼び出すことで、`save_cache` ステップを使用して依存関係を保存し、次回の処理を高速化することができます。

{% raw %}

```yaml
steps:
  # ...

  # バンドルキャッシュを復元します

  - restore_cache:
      keys:
        - rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
        - rails-demo-bundle-v2-

  - run:
      name: バンドルインストール
      command: bundle check || bundle install

  # バンドルキャッシュを保存します

  - save_cache:
      key: rails-demo-bundle-v2-{{ checksum "Gemfile.lock" }}
      paths:
        - vendor/bundle
```

{% endraw %}

JavaScript の依存関係用に Webpack または Yarn を使用する場合は、コンフィグに以下の行も追加する必要があります。

{% raw %}

```yaml
steps:
  # ...

  # アプリケーションで Webpacker または Yarn を他の何らかの方法で使用する場合にのみ必要です

  - restore_cache:
      keys:
        - rails-demo-yarn-{{ checksum "yarn.lock" }}
        - rails-demo-yarn-

  - run:
      name: Yarn をインストール
      command: yarn install --cache-folder ~/.cache/yarn

  # Yarn または Webpacker のキャッシュを保存します

  - save_cache:
      key: rails-demo-yarn-{{ checksum "yarn.lock" }}
      paths:
        - ~/.cache/yarn
```

{% endraw %}

次のセクションでは、テストデータベースを設定します。 ここでは、`dockerize` [ユーティリティ](https://github.com/jwilder/dockerize)を使用して、データベースサービスが使用可能になるまで[プライマリコンテナ]({{ site.baseurl }}/ja/2.0/glossary/#primary-container)のメイン処理の開始を遅らせています。

```yaml
steps:
  # ...

  # データベースをセットアップします

  - run:
      name: DB を待機
      command: dockerize -wait tcp://localhost:5432 -timeout 1m

  - run:
      name: データベースをセットアップ
      command: bin/rails db:schema:load --trace
```

その後 `bundle exec rspec` によって実際のテストが並列実行されます。

テストが正常に終了したら、`store_test_results` を使用してテスト結果を保存します。このため、ビルドの失敗は、CircleCI アプリケーションのテストサマリーセクションにすぐに表示されます。これが Gemfile に [RspecJunitFormatter](https://github.com/sj26/rspec_junit_formatter) を追加することのメリットです。

そこから、これを目的の継続的デプロイスキームに結び付けることができます。

{% raw %}

```yaml
steps:
  # ...

  # RSpec を並列実行します

  - run: |
      bundle exec rspec --profile 10 \
                        --format RspecJunitFormatter \
                        --out test_results/rspec.xml \
                        --format progress \
                        $(circleci tests glob "spec/**/*_spec.rb" | circleci tests split --split-by=timings)

  # タイミング解析のテスト結果を保存します

  - store_test_results:
      path: test_results
```

{% endraw %}

RSpec テストスイートには、以下の 2つのフォーマッタが指定されています。

* `RspecJunitFormatter`：JUnit スタイルテストの結果を出力する
* `progress`：実行中のビルド出力を表示する

`--profile` オプションは、各実行の最も遅い例を報告します。

`circleci tests glob` コマンドと `circleci tests split` コマンドの詳細については、[CircleCI CLI による並列処理に関するドキュメント](https://circleci.com/docs/ja/2.0/parallelism-faster-jobs)を参照してください。

## 関連項目

{:.no_toc}

デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

このアプリケーションは Ruby on Rails Web アプリケーションの最も単純な設定例であり、実際のプロジェクトはこれよりも複雑です。このため、独自のプロジェクトを設定する際は、以下のサイトのさらに詳細な実際のアプリの例が参考になります。

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml)：オープンソースのディスカッションプラットフォーム
* [Sinatra](https://github.com/CircleCI-Public/circleci-demo-ruby-sinatra)：[Web アプリケーションを迅速に作成できる DSL](http://www.sinatrarb.com/) の簡単なデモアプリケーション
