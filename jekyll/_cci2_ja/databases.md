---
layout: classic-docs
title: "データベースの構成"
short-title: "データベースの構成"
description: "ここでは、正式な CircleCI ビルド済み Docker コンテナ イメージを CircleCI  でデータベースサービスに使用する方法について説明します。"
order: 35
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

ここでは、正式な CircleCI ビルド済み Docker コンテナ イメージを CircleCI  でデータベースサービスに使用する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI の [CircleCI Docker Hub](https://hub.docker.com/search?q=circleci&type=image) には、言語とサービスごとにビルド済みイメージが用意されています。 これは、各種の便利な要素をイメージに追加したデータベースのようなものです。

以下には、`build` という 1 つのジョブが含まれている  [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの例を示しています。 Executor に Docker が選択されており、最初のイメージとなるのは、すべての処理が実行されるプライマリ コンテナです。 この例には 2 番目のイメージがあり、これがサービスイメージとして使用されます。 最初のイメージのプログラミング言語は Python です。 Python イメージには `pip` がインストールされており、ブラウザーのテスト用に `-browsers` があります。 サービスイメージによって、データベースなどの別のサービスへのアクセスが可能となります。

## PostgreSQL データベースのテスト例
{: #postgresql-database-testing-example }

プライマリ イメージでは、設定ファイルに `environment` キーで環境変数が定義されており、URL が指定されています。 この URL により、これが PostgreSQL データベースであることが示されているので、デフォルトでは PostgreSQL デフォルト ポートが使用されます。 このビルド済みの CircleCi イメージには、データベースとユーザーがあらかじめ含まれています。 ユーザー名は `postgres`、データベースは `circle_test` です。 このため、すぐにこのユーザー名とデータベースを使用してイメージを使用できます。 ご自身で構成する必要はありません。

以下のように CircleCI 設定ファイルで `postgres` に `POSTGRES_USER` 環境変数を設定して、イメージにロールを追加します。

```yml
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
```

{% raw %}

```yml
version: 2.1

jobs:
  build:

    # Primary container image where all commands run
    docker:
      - image: cimg/python:3.10
        environment:
          TEST_DATABASE_URL: postgresql://postgres@localhost/circle_test
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    # Service container image
      - image: cimg/postgres:14.0
        environment:
          POSTGRES_USER: postgres
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
```

{% endraw %}

`steps` では最初に `checkout` が実行され、その後 Postgres クライアントツールがインストールされます。 `cimg/postgres:14.0` イメージでは、クライアント固有のデータベースアダプターはインストールされません。 たとえば、Python で PostgreSQL データベースとやり取りするために `psychopg2` のインストールが必要になる場合があります。 イメージの一覧は、[ビルド済み CircleCI サービスイメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#next-gen-service-images) のページをご確認ください。

In this example, the config installs the PostgreSQL client tools, `postgresql-client` via `apt-get`, to get access to `psql`. Installing packages in images requires administrator privileges, therefore `sudo` is used - a password is not required.

Two commands follow the `postgresql-client` installation that interact with the database service. These are SQL commands that create a table called test and insert a value into that table. After committing changes and pushing them, the build is automatically triggered on CircleCI and spins up the primary container.

**メモ:** CircleCI では、複数のコンビニエンス環境変数がプライマリ コンテナに挿入されます。 これらの変数は、その後のビルドの際に条件の中で使用できます。 For example, CIRCLE_NODE_INDEX and CIRCLE_NODE_TOTAL are related to concurrent execution environments. 詳細については、[特定の環境変数を使用したビルドに関するドキュメント]({{ site.baseurl }}/ja/2.0/env-vars/#定義済み環境変数)を参照してください。

When the database service spins up, it automatically creates the database `circle_test` and the `postgres` role that you can use to log in and run your tests. Then the database tests run to create a table and insert a value into it.

## オプションのカスタマイズ
{: #optional-customization }

このセクションでは、ビルドをさらにカスタマイズしたり、競合状態を避けたりするための追加のオプション設定について説明します。

### PostgreSQL イメージの最適化
{: #optimizing-postgresql-images }
{:.no_toc}

The `cimg/postgres` Docker image uses regular persistent storage on disk. Storing the database in a ramdisk may improve performance. This can be done by setting the `PGDATA: /dev/shm/pgdata/data` environment variable in the service container image config.

### バイナリの使用
{: #using-binaries }
{:.no_toc}

`pg_dump`、`pg_restore`、および類似ユーティリティを使用するには、`pg_dump` の呼び出し時にも正しいバージョンが使用されるように追加の設定を行う必要があります。 以下の行を `config.yml` ファイルに追加して、`pg_*` または同等のデータベースユーティリティを有効にします。

```yml
    steps:
    # Postgres 12.0 バイナリをパスに追加します。
       - run: echo 'export PATH=/usr/lib/postgresql/12.0/bin/:$PATH' >> $BASH_ENV
```

### Dockerize を使用した依存関係の待機
{: #using-dockerize-to-wait-for-dependencies }
{:.no_toc}

ジョブで複数の Docker コンテナを使用している場合、コンテナ内のサービスが開始される前にジョブがサービスを使用しようとすると、競合状態が発生することがあります。 たとえば、PostgreSQL コンテナが実行されていても、接続を受け入れる準備ができていない場合などです。 この問題を回避するには、`dockerize` を使用して依存関係を待機します。 以下の例は、CircleCI `config.yml` ファイルでこの問題を回避する方法を示しています。

```yml
version: 2.0
jobs:
  build:
    working_directory: /your/workdir
    docker:
      - image: your/image_for_primary_container
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: your_postgres_user
          POSTGRES_DB: your_postgres_test
    steps:
      - checkout
      - run:
          name: install dockerize
          command: wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && sudo tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
          environment:
            DOCKERIZE_VERSION: v0.6.1
      - run:
          name: Wait for db
          command: dockerize -wait tcp://localhost:5432 -timeout 1m
```

同じ方法を以下のデータベースにも適用できます。

- MySQL

`dockerize -wait tcp://localhost:3306 -timeout 1m`

- Redis

`dockerize -wait tcp://localhost:6379 -timeout 1m`

Redis では CLI も使用可能です。

`sudo apt-get install redis-tools ; while ! redis-cli ping 2>/dev/null ; do sleep 1 ; done`

- Web サーバーなどの他のサービス

`dockerize -wait http://localhost:80 -timeout 1m`

## 関連項目
{: #see-also }
{:.no_toc}

他の設定ファイルの例については、「[データベースの設定例]({{ site.baseurl }}/ja/2.0/postgres-config/)」を参照してください。

