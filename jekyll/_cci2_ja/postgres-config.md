---
layout: classic-docs
title: "データベースの構成例"
short-title: "データベースの構成例"
description: "PostgreSQL の構成例"
order: 35
---

PostgreSQL/Rails および MySQL/Ruby を使用したデータベース [config.yml]({{ site.baseurl }}/ja/2.0/databases/) ファイルの例について、以下のセクションに沿って説明します。

## structure.sql を使う Rails アプリケーション用の設定例

`structure.sql` ファイルを使用して構成した Rails アプリケーションを移行する場合は、`psql` が PATH の場所にインストールされ、適切な権限が設定されていることを確認してください。これは、circleci/ruby:2.4.1-node イメージには psql がデフォルトでインストールされておらず、`pg` gem を使用してデータベースにアクセスするためです。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails

    # すべてのコマンドを実行する場所となるプライマリ コンテナ イメージ

    docker:

      - image: circleci/ruby:2.4.1-node
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root

    # `host: localhost` でアクセスできるサービス コンテナ イメージ

      - image: circleci/postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle-test_test

    steps:

      - checkout

      # バンドル キャッシュを復元します

      - restore_cache:
          keys:
            - rails-demo-{{ checksum "Gemfile.lock" }}
            - rails-demo-

      # 依存関係をバンドル インストールします

      - run:
          name: 依存関係のインストール
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # バンドル キャッシュを保存します

      - save_cache:
          key: rails-demo-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run:
          name: データベースのセットアップ
          command: |
            bundle exec rake db:create
            bundle exec rake db:structure:load

      - run:
          name: RSpec の並列実行
          command: bin/rails test

      # アーティファクトを保存します

      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

**メモ:** 現在のイメージを拡張して独自のイメージをビルドする方法もあります。その場合には必要なパッケージをインストールし、コミットしてから、Docker Hub などのレジストリにプッシュしてください。

### 環境のセットアップ例
{:.no_toc}

CircleCI 2.0 では、複数のビルド済みイメージやカスタム イメージが使用されることがあるため、データベース構成は明示的に宣言する必要があります。 たとえば、Rails は以下の順序でデータベース URL の使用を試みます。

1. DATABASE_URL 環境変数 (設定されている場合)
2. `config.yml` ファイル内の該当する環境の test セクションの構成 (通常、テスト スイートでは `test`)。

この順序の具体例を以下に示します。ここでは、イメージの `environment` 設定を組み合わせると共に、シェル コマンドに `environment` 設定を追加してデータベース接続を有効にしています。

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
      # この例では PostgresSQL 9.6 公式イメージを使用しています。
      # circleci/postgres:9.6 も使用可能で、いくつかの機能強化とカスタマイズが加えられています。 いずれかのイメージを使用できます。
      - image: postgres:9.6-jessie
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: db_name
    steps:
      - checkout
      - run:
          name: Ruby の依存関係のインストール
          command: bundle install
      - run: 
          name: データベースのセットアップ
          command: |
            bundle exec rake db:create db:schema:load --trace
            bundle exec rake db:migrate
        environment:
          DATABASE_URL: "postgres://ubuntu@localhost:5432/db_name"
```

この例では、PostgreSQL 9.6 のデフォルトのユーザーとポートとして `$DATABASE_URL` が指定されています。バージョン 9.5 の場合、デフォルトのポートは 5432 ではなく 5433 になります。 他のポートを指定するには、`$DATABASE_URL` と `psql` の呼び出し箇所をすべて変更します。

## Go アプリケーションと PostgreSQL の構成例

以下の構成例に関する詳しい説明や、アプリケーションのパブリック コード リポジトリについては、[Go 言語ガイド]({{ site.baseurl }}/ja/2.0/language-go/)を参照してください。

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI Go イメージは https://hub.docker.com/r/circleci/golang/ で入手できます
      - image: circleci/golang:1.8-jessie
      # CircleCI PostgreSQL イメージは https://hub.docker.com/r/circleci/postgres/ で入手できます
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

      # 通常、このステップはカスタム プライマリ イメージに記述されています
      # この例では、説明のためにここにステップを追加しました

      run: go get github.com/lib/pq
      - run: go get github.com/mattes/migrate
      - run: go get github.com/jstemmer/go-junit-report

      - run:
          name: Postgres が準備できるまで待機
          command: |
            for i in `seq 1 10`;
            do
              nc -z localhost 5432 && echo Success && exit 0
              echo -n .
              sleep 1
            done
            echo Failed waiting for Postgres && exit 1
      - run:
          name: 単体テストの実行
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
          name: サービスの開始
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /go/src/github.com/CircleCI-Public/circleci-demo-go/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: サービスが稼働していることのバリデーション
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

以下の例では、PHP コンテナと共に、MYSQL をセカンダリ コンテナとしてセットアップしています。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-apache-node-browsers # ステップが実行される場所となるプライマリ コンテナ
      - image: circleci/mysql:8.0.4
        environment:
          MYSQL_ROOT_PASSWORD: rootpw
          MYSQL_DATABASE: test_db
          MYSQL_USER: user
          MYSQL_PASSWORD: passw0rd

    steps:

      - checkout
      - run:
      # プライマリ コンテナは MySQL ではないため、準備が完了するまで sleep コマンドを実行します。
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

サービス イメージの使用とデータベースのテスト手順に関する概念的な情報については、「[データベースの構成]({{ site.baseurl }}/ja/2.0/databases/)」を参照してください。
