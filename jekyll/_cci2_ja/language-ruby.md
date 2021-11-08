---
layout: classic-docs
title: "言語ガイド: Ruby"
short-title: "Ruby"
description: "CircleCI 2.0 での Ruby on Rails を使用したビルドとテスト"
categories:
  - language-guides
order: 8
version:
  - Cloud
  - Server v2.x
---

このガイドでは、CircleCI で Ruby on Rails アプリケーションをビルドする方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

お急ぎの場合は、下記の設定ファイルの例をプロジェクトのルート ディレクトリにある[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

CircleCI では、[GitHub](https://github.com/CircleCI-Public/circleci-demo-ruby-rails) 上で Ruby on Rails のサンプルプロジェクトを提供しており、[CircleCI ](https://app.circleci.com/pipelines/github/CircleCI-Public/circleci-demo-ruby-rails)上でのビルドを参照することができます。

このアプリケーションでは、最新の安定した Rails バージョン 6.1 (`rspec-rails`)、[RspecJunitFormatter][rspec-junit-formatter] および PostgreSQL をデータベースとして使用しています。


## CircleCI のビルド済み Docker イメージ
{: #pre-built-circleci-docker-images }

このアプリケーションのビルドには、ビルド済み [CircleCI Docker イメージ]({{site.baseurl}}/2.0/circleci-images/)の 1 つを使用しています。

CircleCI のビルド済みイメージの使用を検討してください。 このイメージには、CI 環境で役立つツールがプリインストールされています。 Docker Hub (<https://hub.docker.com/r/circleci/ruby/>) から必要な Ruby バージョンを選択できます。

セカンダリ「サービス」コンテナとして使用するデータベース イメージも Docker ハブ の `circleci` ディレクトリで提供しています。

---

## 設定ファイルの例
{: #sample-configuration }

以下のコードブロックには、サンプルアプリケーションの設定の各部分を説明するコメントがついています。

{% raw %}

```yaml
version: 2.1 # 2.1 を使うと Orb や他の機能を使用することができます。 

# 設定で使用する Orb を宣言します。
# Orb に関する詳細は、https://circleci.com/docs/2.0/using-orbs/をご覧ください。
orbs:
  ruby: circleci/ruby@1.0
  node: circleci/node@2

jobs:
  build: #  "build"という名前の最初のジョブです。
    docker:
      - image: cimg/ruby:2.7-node # カスタマイズされた CircleCI Docker イメージを使用します。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/ プロジェクト UI の環境変数を参照します。
    steps:
      - checkout # Git コードをプルダウンします。
      - ruby/install-deps # Ruby Orb を使って依存関係をインストールします。
      # Node Orb を使ってパッケージをインストールします。
      # Yarn の使用および 依存関係のキャッシュに yarn.lock の使用を指定します。
      # 詳細は、 https://circleci.com/docs/2.0/caching/　を参照してください。
      - node/install-packages:
          pkg-manager: yarn
          cache-key: "yarn.lock"

  test:  # "test"という名前の次のジョブです。
    # テストを高速化するために「並列ジョブコンテナ」を実行します。
    # これによりテストが複数のコンテナに分割されます。
    parallelism: 3
    # ここでは、2 つの Docker イメージを設定します。
    docker:
      - image: cimg/ruby:2.7-node # プライマリ Docker イメージです。ここでステップコマンドが実行されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/ プロジェクト UI の環境変数を参照します。
      - image: circleci/postgres:9.5-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/ プロジェクト UI の環境変数を参照します。
        environment: # POSTGRES 環境変数を追加します。
          POSTGRES_USER: circleci-demo-ruby
          POSTGRES_DB: rails_blog_test
          POSTGRES_PASSWORD: ""
    # Ruby/Rails 固有の環境変数をプライマリコンテナに適用します。
    environment:
      BUNDLE_JOBS: "3"
      BUNDLE_RETRY: "3"
      PGHOST: 127.0.0.1
      PGUSER: circleci-demo-ruby
      PGPASSWORD: ""
      RAILS_ENV: test
    # 実行する一連のステップです。「ビルド」のステップと似たステップもあります。
    steps:
      - checkout
      - ruby/install-deps
      - node/install-packages:
          pkg-manager: yarn
          cache-key: "yarn.lock"
      # ここでは、データベース上で実行する前に
      # セカンダリコンテナが起動することを確認します。
      # データベースをセットアップします

  - run:
      name: DB の待機
      command: dockerize -wait tcp://localhost:5432 -timeout 1m

  - run:
      name: データベースのセットアップ
      command: bin/rails db:schema:load --trace
workflows:
  version: 2
  build_and_test:     # The name of our workflow is "build_and_test"
    jobs:             # The list of jobs we run as part of this workflow.
workflows:
  version: 2
  build_and_test:     # The name of our workflow is "build_and_test"
    jobs:             # The list of jobs we run as part of this workflow.
      - build         # Run build first.
      - test:         # Then run test,
          requires:   # Test requires that build passes for it to run.
            - build   # Finally, run the build job.
```

{% endraw %}


## Ruby on Rails のデモ プロジェクトのビルド
他のディレクトリを指定しない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとなります。

CircleCI を初めて使用する際は、プロジェクトをご自身でビルドしてみることをお勧めします。 以下に、ユーザー自身のアカウントを使用してデモ プロジェクトをビルドする方法を示します。

1. お使いのアカウントに、GitHub 上の[プロジェクトをフォーク](https://github.com/CircleCI-Public/circleci-demo-ruby-rails/fork)します。
2. Go to the [**Projects**](https://app.circleci.com/projects/){:rel="nofollow"} dashboard in the CircleCI app and click the **Follow Project** button next to the project you just forked.
3. 変更を加えるには、`.circleci/config.yml` ファイルを編集してコミットします。 コミットを GitHub にプッシュすると、CircleCI がそのプロジェクトをビルドしてテストします。

## 設定ファイルの詳細
この例では、以下の 2 つの [CircleCI コンビニエンス イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#イメージのタイプ)が使用されています。
{:.no_toc}

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

このアプリケーションは Ruby on Rails Web アプリケーションの最もシンプルな構成例であり、実際のプロジェクトはこれよりも複雑です。 このため、独自のプロジェクトを構成する際は、以下のサイトのさらに詳細な実際のアプリの例が参考になります。

* [Discourse](https://github.com/CircleCI-Public/discourse/blob/master/.circleci/config.yml): オープンソースのディスカッション プラットフォーム
* [CircleCI でビルドされた Ruby on Rails デモ プロジェクト](https://circleci.com/gh/CircleCI-Public/circleci-demo-ruby-rails){:rel="nofollow"}

[rspec-junit-formatter]: https://github.com/sj26/rspec_junit_formatter
