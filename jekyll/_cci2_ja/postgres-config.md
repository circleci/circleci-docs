---
layout: classic-docs
title: "データベースの設定例"
short-title: "データベースの設定例"
description: "PostgreSQL を使う際の設定例"
categories: [configuring-jobs]
order: 35
---

このページでは、PostgreSQL/Rails あるいは MySQL/Ruby という組み合わせのデータベース設定を含む、[config.yml]({{ site.baseurl }}/ja/2.0/databases/) ファイルの例について解説しています。

* TOC
{:toc}

## structure.sql を使う Rails アプリケーション用の設定例

`structure.sql` ファイルを用いて設定する Rails アプリケーションを移行するときは、
`psql` が PATH の通っている場所にインストールされていること、psql に対するアクセス権限が正しく設定されていることを確認してください。
circleci/ruby:2.4.1-node というイメージには psql がデフォルトでインストールされておらず、
データベースアクセスに `pg` gem を使うためです。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails

    # すべてのコマンドの実行を担うプライマリコンテナイメージ

    docker:
      - image: circleci/ruby:2.4.1-node
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root

    # 「host: localhost」でアクセスできるサービスコンテナイメージ

      - image: circleci/postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle-test_test

    steps:
      - checkout

      # bundle キャッシュをリストアする
      - restore_cache:
          keys:
            - rails-demo-{{ checksum "Gemfile.lock" }}
            - rails-demo-

      # bundle install で依存関係をインストールする
      - run:
          name: Install dependencies
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # bundle キャッシュを保存する
      - save_cache:
          key: rails-demo-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run:
          name: Database Setup
          command: |
            bundle exec rake db:create
            bundle exec rake db:structure:load

      - run:
          name: Parallel RSpec
          command: bin/rails test

      # artifacts を保存する
      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

**注 :** 上記の方法以外にも、既存のイメージに手を入れて独自のイメージとしてビルドし、
必要なパッケージを組み合わせて Docker Hub やレジストリにコミット、プッシュする、
という方法もあります。

### 環境設定の例
{:.no_toc}

CircleCI 2.0 では複数のビルド済みイメージやカスタムイメージが使われることがあります。そのため、データベース設定は明示的に宣言しておかなければなりません。例えば Rails は下記の優先順位で使用するデータベース URL を特定します。

1. 定義済みの環境変数 DATABASE_URL の値
2. `config.yml` ファイル内の該当する環境の test セクションにおける設定（Rails のテストスイートでは通常は `test` と記述しています）

下記では、このデータベース URL の設定の仕方について、イメージの定義に `environment` を組み合わせる例と、データベース接続を有効にするシェルコマンドを用いた `environment` の例を示しています。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/appName
    docker:
      - image: ruby:2.3.1-jessie
        environment:
          PG_HOST: localhost
          PG_USER: ubuntu
          RAILS_ENV: test
          RACK_ENV: test
      # この例では postgres 9.6 の公式イメージを使っています。もしくは circleci/postgres:9.6 と指定することもできます。
      # 後者には多少の機能改善やカスタマイズが加わっていますが、どちらのイメージを指定しても問題ありません。
      - image: postgres:9.6-jessie
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: db_name
    steps:
      - checkout
      - run:
          name: Install Ruby Dependencies
          command: bundle install
      - run:
          name: Set up DB
          command: |
            bundle exec rake db:create db:schema:load --trace
            bundle exec rake db:migrate
        environment:
          DATABASE_URL: "postgres://ubuntu@localhost:5432/db_name"
```

これは PostgreSQL 9.6 で、デフォルトのユーザーとポートを使用するように `$DATABASE_URL` を設定した例となります。バージョンが 9.5 の場合はポート番号を 5432 ではなく 5433 とします。他のポートを使うときは、`$DATABASE_URL` と `psql` を呼び出しているすべての箇所を変更してください。

## PostgreSQL と Go 言語を使ったアプリケーションの設定例

下記の設定に関する全体像やアプリケーションのパブリックリポジトリのソースは、[Go 言語ガイド]({{ site.baseurl }}/ja/2.0/language-go/)で確認できます。

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI の Go のイメージはこちら https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.8-jessie
      # CircleCI の PostgreSQL のイメージはこちら https://hub.docker.com/r/circleci/postgres/
      - image: circleci/postgres:9.6-alpine
        environment:
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-go

    environment:
      TEST_RESULTS: /tmp/test-results

    steps:
      - checkout
      - run: mkdir -p $TEST_RESULTS

      - restore_cache:
          keys:
            - v1-pkg-cache

      # 通常、以下の内容はカスタムしたプライマリイメージのところに記述しますが、
      # わかりやすくするためここに記述しています。
      - run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      - run:
          name: Waiting for Postgres to be ready
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres &amp;&amp; exit 1
      - run:
          name: Run unit tests
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
      - run: make

      - save_cache:
          key: v1-pkg-cache
          paths:
            - "/go/pkg"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: Validate service is working
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts
      - store_artifacts:
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results:
          path: /tmp/test-results
```

## MySQL を使った Ruby プロジェクトの設定例と、それを Docker 化する例

下記は MySQL と dockerize コマンドを使った例です。補足情報は [sample project on Github](https://github.com/tkuchiki/wait-for-mysql-circleci-2.0) でご確認ください。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/test-circleci
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: tkuchiki/delayed-mysql
        environment:
          MYSQL_ALLOW_EMPTY_PASSWORD: yes
          MYSQL_ROOT_PASSWORD: ''
          MYSQL_DATABASE: circleci
    steps:
      - checkout
      - run:
          name: Bundle install
          command: bundle install
      - run:
          name: Wait for DB
          # circleci/* の Docker イメージにプリインストール
          command: dockerize -wait tcp://127.0.0.1:3306 -timeout 120s
      - run:
          name: MySQL version
          command: bundle exec ruby mysql_version.rb
```

## 関連情報


サービスイメージやデータベースのテストステップの使用に関するひと通りの知識を「[データベースを設定する]({{ site.baseurl }}/ja/2.0/databases/)」ページで紹介しています。
