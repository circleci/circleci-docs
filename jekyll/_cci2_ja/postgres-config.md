---
layout: classic-docs
title: "データベースの設定例"
short-title: "データベースの設定例"
description: "See example database config.yml files using PostgreSQL/Rails and MySQL/Ruby for rails app with structure.sql, go app with postgresql, and mysql project."
order: 35
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

PostgreSQL/Rails および MySQL/Ruby を使用したデータベース [config.yml]({{ site.baseurl }}/2.0/databases/) ファイルの例について、以下のセクションに沿って説明します。

* 目次
{:toc}

## structure.sql を使用した Rails アプリケーション用の CircleCI 設定例
{: #example-circleci-configuration-for-a-rails-app-with-structuresql }

`structure.sql` ファイルを使用して設定した Rails アプリケーションを移行する場合は、`psql` が PATH の場所にインストールされ、以下のように適切な権限が設定されていることを確認してください。これは、circleci/ruby:2.4.1-node イメージには psql がデフォルトでインストールされておらず、`pg` gem を使用してデータベースにアクセスするためです。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-ruby-rails

    # すべてのコマンドを実行するプライマリコンテナのイメージです。
    docker:
      - image: circleci/ruby:2.4.1-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          RAILS_ENV: test
          PGHOST: 127.0.0.1
          PGUSER: root

    # [host: localhost]にあるサービスコンテナイメージです。

      - image: circleci/postgres:9.6.2-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          POSTGRES_USER: root
          POSTGRES_DB: circle-test_test

    steps:
      - checkout

      # バンドルキャッシュを復元します。
      - restore_cache:
          keys:
            - rails-demo-{{ checksum "Gemfile.lock" }}
            - rails-demo-

      # 依存関係をバンドルインストールします。
      - run:
          name: Install dependencies
          command: bundle check --path=vendor/bundle || bundle install --path=vendor/bundle --jobs 4 --retry 3

      - run: sudo apt install -y postgresql-client || true

      # バンドルキャッシュを保存します。
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
          name: 並列 RSpec
          command: bin/rails test

      # アーティファクトを保存します。
      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

**注意:** 現在のイメージを拡張して独自のイメージをビルドする方法もあります。その場合には必要なパッケージをインストールし、コミットしてから、Docker ハブなどのレジストリにプッシュしてください。

### 環境のセットアップ例
{: #example-environment-setup }
{:.no_toc}

You must declare your database configuration explicitly because multiple pre-built or custom images may be in use. たとえば、Rails は以下の順序でデータベース URL の使用を試みます。

1.  DATABASE_URL 環境変数 (設定されている場合)
2.  `config.yml` ファイル内の該当する環境の test セクションの設定 (通常、テスト スイートでは `test`)。

この順序の具体例を以下に示します。ここでは、イメージの `environment` 設定を組み合わせると共に、シェル コマンドに `environment` 設定を追加してデータベース接続を有効にしています。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/appName
    docker:
      - image: ruby:2.3.1-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          PG_HOST: localhost
          PG_USER: ubuntu
          RAILS_ENV: test
          RACK_ENV: test
      # 以下の例では公式のPostgres 9.6 イメージを使用していますが、 いくつかの機能強化とカスタマイズが加えられた
      # circleci/postgres:9.6 も使用可能です。 どちらのイメージも使用できます。
      
      - image: postgres:9.6-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          POSTGRES_USER: ubuntu
          POSTGRES_DB: db_name
    steps:
      - checkout
      - run:
          name: Ruby の依存関係をインストール
          command: bundle install
      - run:
          name: データベースのセットアップ
          command: |
            bundle exec rake db:create db:schema:load --trace
            bundle exec rake db:migrate
        environment:
          DATABASE_URL: "postgres://ubuntu@localhost:5432/db_name"
```

この例では、PostgreSQL 9.6のデフォルトユーザーとポートとして、 `$DATABASE_URL` を指定しています。 バージョン 9.5では、デフォルトのポートが 5432 ではなく 5433 になっています。 他のポートを指定するには、`$DATABASE_URL` と `psql` の呼び出し箇所をすべて変更します。

## Go アプリケーションと PostgreSQL の設定例
{: #example-go-app-with-postgresql }

以下の設定例に関する詳しい説明や、アプリケーションのパブリック コード リポジトリについては、[Go 言語ガイド]({{ site.baseurl }}/ja/2.0/language-go/)を参照してください。

{% raw %}

```yaml
version: 2
jobs:
  build:
    docker:
      # CircleCI Go イメージは: https://hub.docker.com/r/circleci/golang/をご覧ください。
      - image: circleci/golang:1.12
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      # CircleCI PostgreSQL イメージはt: https://hub.docker.com/r/circleci/postgres/をご覧ください。
      - image: circleci/postgres:9.6-alpine
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
            - go-mod-v1-{{ checksum "go.sum" }}

      - run:
          name: 依存関係の取得
          command: |
            go get -v

      - run:
          name: Get go-junit-report を取得してCircleCI でテストのタイミングを設定する
          command: |
            go get github.com/jstemmer/go-junit-report
            # go.mod からgo-junit-report を削除します。　
            go mod tidy

      #  Postgres が準備できるまで待機し、その後処理します。
      - run:
          name: Postgres が準備できるまで待機
          command: dockerize -wait tcp://localhost:5432 -timeout 1m

      - run:
          name: ユニットテストの実行
          environment: # データベース URL 用の環境変数と移行ファイルへのパスを指定します。
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: |
            trap "go-junit-report <${TEST_RESULTS}/go-test.out > ${TEST_RESULTS}/go-test-report.xml" EXIT
            make test | tee ${TEST_RESULTS}/go-test.out
      - run: make

      - save_cache:
          key: go-mod-v1-{{ checksum "go.sum" }}
          paths:
            - "/go/pkg/mod"

      - run:
          name: サービスの開始
          environment:
            CONTACTS_DB_URL: "postgres://circleci-demo-go@localhost:5432/circle_test?sslmode=disable"
            CONTACTS_DB_MIGRATIONS: /home/circleci/project/db/migrations
          command: ./workdir/contacts
          background: true

      - run:
          name: サービスが稼働しているかどうかの確認
          command: |
            sleep 5
            curl --retry 10 --retry-delay 1 -X POST --header "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' http://localhost:8080/contacts
      - store_artifacts:
          path: /tmp/test-results
          destination: raw-test-output

      - store_test_results:
          path: /tmp/test-results
```

{% endraw %}

## MYSQL プロジェクトの例
{: #example-mysql-project }

以下の例では、PHP コンテナと共に、MYSQL をセカンダリ コンテナとしてセットアップしています。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/php:7.1-apache-node-browsers # ステップを実行するプライマリコンテナです。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
      - image: circleci/mysql:8.0.4
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
      # プライマリコンテナは MYSQL ではないので、準備ができるまでスリープコマンドを実行します。
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


サービスイメージやデータベースのテストステップの使用に関するひと通りの知識を、[データベースの設定]({{ site.baseurl }}/ja/2.0/databases/)で紹介しています。
