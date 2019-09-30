---
layout: classic-docs
title: "データベースの設定例"
short-title: "データベースの設定例"
description: "PostgreSQL を使う際の設定例"
categories:
  - configuring-jobs
order: 35
---

このページでは、PostgreSQL/Rails あるいは MySQL/Ruby という組み合わせのデータベース設定を含む、[config.yml]({{ site.baseurl }}/ja/2.0/databases/) ファイルの例について解説しています。

* TOC
{:toc}

## structure.sql を使う Rails アプリケーション用の設定例

`structure.sql` ファイルを用いて設定する Rails アプリケーションを移行するときは、`psql` が PATH の通っている場所にインストールされていること、psql に対するアクセス権限が正しく設定されていることを確認してください。circleci/ruby:2.4.1-node というイメージには psql がデフォルトでインストールされておらず、データベースアクセスに `pg` gem を使うためです。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails

    # Primary container image where all commands run

    docker:

      - image: circleci/ruby:2.4.1-node
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root

    # Service container image available at `host: localhost`

      - image: circleci/postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle-test_test

    steps:

      - checkout

      # Restore bundle cache

      - restore_cache:
          keys:
            - rails-demo-{{ checksum "Gemfile.lock" }}
            - rails-demo-

      # Bundle install dependencies

      - run:
          name: Install dependencies
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # Store bundle cache

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

      # Save artifacts

      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

**注 :** 上記の方法以外にも、既存のイメージに手を入れて独自のイメージとしてビルドし、必要なパッケージを組み合わせて Docker Hub やレジストリにコミット、プッシュする、という方法もあります。

### 環境設定の例
{:.no_toc}

CircleCI 2.0 では複数のビルド済みイメージやカスタムイメージが使われることがあります。そのため、データベース設定は明示的に宣言しておかなければなりません。 例えば Rails は下記の優先順位で使用するデータベース URL を特定します。

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
      # 後者には多少の機能改善やカスタマイズが加わっていますが、 どちらのイメージを指定しても問題ありません。
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

これは PostgreSQL 9.6 で、デフォルトのユーザーとポートを使用するように `$DATABASE_URL` を設定した例となります。バージョンが 9.5 の場合はポート番号を 5432 ではなく 5433 とします。 他のポートを使うときは、`$DATABASE_URL` と `psql` を呼び出しているすべての箇所を変更してください。

## PostgreSQL と Go 言語を使ったアプリケーションの設定例

下記の設定に関する全体像やアプリケーションのパブリックリポジトリのソースは、[Go 言語ガイド]({{ site.baseurl }}/ja/2.0/language-go/)で確認できます。

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: circleci/golang:1.8-jessie
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
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

      # Normally, this step would be in a custom primary image;
      # we've added it here for the sake of explanation.

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
            echo Failed waiting for Postgres && exit 1
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

## Example MYSQL project.

The following example sets up MYSQL as a secondary container alongside a PHP container.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-apache-node-browsers # The primary container where steps are run
      - image: circleci/mysql:8.0.4
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:

      - checkout
      - run:
      # Our primary container isn't MYSQL so run a sleep command until it's ready.
          name: Waiting for MySQL to be ready
          command: |
            for i in `seq 1 10`;
            do
              nc -z 127.0.0.1 3306 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for MySQL && exit 1
      - run:
          name: Install MySQL CLI; Import dummy data; run an example query
          command: |
            sudo apt-get install default-mysql-client
            mysql -h 127.0.0.1 -u user -ppassw0rd test_db < sql-data/dummy.sql
            mysql -h 127.0.0.1 -u user -ppassw0rd --execute="SELECT * FROM test_db.Persons"
workflows:
  version: 2
  build-deploy:
    jobs:
      - build
```

While it is possible to make MySQL as your primary and only container, this example does not. As a more practical use case, the example uses a PHP docker image as its primary container, and will wait until MySQL is up and running before performing any `run` commands involving the DB.

Once the DB is up, we install the `mysql` client into the primary container so that we can run a command to connect and import the dummy data, presumably found at, `sql-data/dummy.sql` at the root of your project. In this case, that dummy data contains an example set of SQL commands:

```sql
DROP TABLE IF EXISTS `Persons`;

CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
);

INSERT INTO Persons
VALUES (
    1,
    "Foo",
    "Baz",
    "123 Bar Street",
    "FooBazBar City"
);
```

## 関連情報

Refer to the [Configuring Databases]({{ site.baseurl }}/2.0/databases/) document for a walkthrough of conceptual information about using service images and database testing steps.