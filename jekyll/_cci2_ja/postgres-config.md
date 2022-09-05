---
layout: classic-docs
title: "データベースの設定例"
short-title: "データベースの設定例"
description: "structure.sql を使用した Rails アプリ、PostgreSQL を使用した Go アプリ、MySQL プロジェクト用の PostgreSQL/Rails や MySQL/Ruby を使ったデータベースの config.yml ファイルの設定例を紹介します。"
order: 35
version:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

This document provides example database [config.yml]({{ site.baseurl }}/databases/) files using PostgreSQL/Rails and MySQL/Ruby.

## structure.sql を使用した Rails アプリケーション用の CircleCI 設定例
{: #example-circleci-configuration-for-a-rails-app-with-structuresql }

`structure.sql` ファイルを使用して設定した Rails アプリケーションを移行する場合は、`psql` が PATH の場所にインストールされ、適切な権限が設定されていることを確認してください。これは、cimg/ruby:3.0-node イメージには psql がデフォルトでインストールされておらず、`pg` gem を使用してデータベースにアクセスするためです。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails

    # Primary container image where all commands run

    docker:
      - image: cimg/ruby:2.6-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root

    # Service container image available at `host: localhost`

      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: testuser
          POSTGRES_DB: circle-test_test

    steps:
      - checkout

      # Restore bundle cache
      - restore_cache:
          keys:
            - rails-demo-{% raw %}{{ checksum "Gemfile.lock" }}{% endraw %}
            - rails-demo-

      # Bundle install dependencies
      - run:
          name: Install dependencies
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # Store bundle cache
      - save_cache:
          key: rails-demo-{% raw %}{{ checksum "Gemfile.lock" }}{% endraw %}
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

**注:** 現在のイメージを拡張して独自のイメージをビルドする方法もあります。その場合には必要なパッケージをインストールし、コミットしてから、Docker ハブなどのレジストリにプッシュしてください。

### 環境のセットアップ例
{: #example-environment-setup }
{:.no_toc}

複数のビルド済みイメージやカスタム イメージが使用されることがあるため、データベースの設定は明示的に宣言する必要があります。 たとえば、Rails は以下の順序でデータベース URL の使用を試みます。

1.  DATABASE_URL 環境変数 (設定されている場合)
2.  `config.yml` ファイル内の該当する環境の test セクションの設定 (通常、テスト スイートでは `test`)。

この順序の具体例を以下に示します。ここでは、イメージの `environment` 設定を組み合わせると共に、シェル コマンドに `environment` 設定を追加してデータベース接続を有効にしています。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/appName
    docker:
      - image: cimg/ruby:2.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          PG_HOST: localhost
          PG_USER: ubuntu
          RAILS_ENV: test
          RACK_ENV: test
      # The following example uses the official postgres 9.6 image, you may also use cimg/postgres:9.6
      # which includes a few enhancements and modifications. どちらのイメージも使用できます。
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

この例では、PostgreSQL 9.6のデフォルトユーザーとポートとして、 `$DATABASE_URL` を指定しています。 バージョン 9.5では、デフォルトのポートが 5432 ではなく 5433 になっています。 他のポートを指定するには、`$DATABASE_URL` と `psql` の呼び出し箇所をすべて変更します。

## Go アプリケーションと PostgreSQL の設定例
{: #example-go-app-with-postgresql }

以下の設定例に関する詳しい説明や、アプリケーションのパブリックコードリポジトリについては、[Go 言語ガイド]({{ site.baseurl }}/ja/language-go/)を参照してください。

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI Go images available at: https://hub.docker.com/r/circleci/golang/
      - image: cimg/go:1.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL images available at: https://hub.docker.com/r/circleci/postgres/
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: circleci-demo-go
          POSTGRES_DB: circle_test

    environment:
      TEST_RESULTS: /tmp/test-results

    steps:
      - checkout
      - run: mkdir -p $TEST_RESULTS

      - restore_cache:
          keys:
            - go-mod-v1-{% raw %}{{ checksum "go.sum" }}{% endraw %}

      - run:
          name: Get dependencies
          command: |
            go get -v

      - run:
          name: Get go-junit-report for setting up test timings on CircleCI
          command: |
            go get github.com/jstemmer/go-junit-report
            # Remove go-junit-report from go.mod
            go mod tidy

      #  Wait for Postgres to be ready before proceeding
      - run:
          name: Waiting for Postgres to be ready
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: Run unit tests
          environment: # environment variables for the database url and path to migration files
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
      - run: make

      - save_cache:
          key: go-mod-v1-{% raw %}{{ checksum "go.sum" }}{% endraw %}
          paths:
            - "/go/pkg/mod"

      - run:
          name: Start service
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
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

## MYSQL プロジェクトの例
{: #example-mysql-project }

以下の例では、PHP コンテナと共に、MYSQL をセカンダリコンテナとしてセットアップしています。

{:.tab.mysql_example.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/php:8.1-browsers # ステップが実行されるプライマリコンテナ
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
      - image: cimg/mysql:8.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:
      - checkout
      - run:
      # プライマリコンテナは MySQL ではないので、準備ができるまでスリープコマンドを実行します。
          name: MySQL が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z 127.0.0.1 3306 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for MySQL && exit 1
      - run:
          name: MySQL CLI のインストール; ダミー データのインポート; サンプル クエリの実行
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

{:.tab.mysql_example.Server_3}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
  build:
    docker:
      - image: cimg/php:8.1-browsers # ステップが実行されるプライマリコンテナ
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
      - image: cimg/mysql:8.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:
      - checkout
      - run:
      # プライマリコンテナは MySQL ではないので、準備ができるまでスリープコマンドを実行します。
          name: MySQL が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z 127.0.0.1 3306 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for MySQL && exit 1
      - run:
          name: MySQL CLI のインストール; ダミー データのインポート; サンプル クエリの実行
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

{:.tab.mysql_example.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with 
# browser testing require the use of the CircleCI browser-tools orb, available 
# with config version 2.1.
version: 2
jobs:
  build:
    docker:
      - image: cimg/php:7.1 # The primary container where steps are run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/mysql:8.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:
      - checkout
      - run:
      # Our primary container isn't MYSQL so run a sleep command until it's ready.
          name: MySQL が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z 127.0.0.1 3306 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for MySQL && exit 1
      - run:
          name: MySQL CLI のインストール; ダミー データのインポート; サンプル クエリの実行
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

MySQL をプライマリかつ唯一のコンテナにすることもできますが、この例ではそのようにしていません。 より実践的なユース ケースとして、この例では PHP Docker イメージをプライマリ コンテナとして使用し、MySQL が起動してから、データベースに関連する `run` コマンドを実行しています。

データベースが起動したら、`mysql` クライアントをプライマリ コンテナにインストールします。これで、プロジェクトのルートにあるとしたダミー データ `sql-data/dummy.sql` に接続してインポートするコマンドを実行できます。 このダミー データには、例として一連の SQL コマンドが格納されています。

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


## 関連項目
{: #see-also }


サービスイメージやデータベースのテストステップの使用に関するひと通りの知識を、[データベースの設定]({{ site.baseurl }}/ja/databases/)で紹介しています。
