---
layout: classic-docs
title: "データベースの設定"
short-title: "データベースの設定"
description: "ここでは、正式な CircleCI ビルド済み Docker コンテナイメージを CircleCI  でデータベースサービスに使用する方法について説明します。"
order: 35
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

ここでは、正式な CircleCI ビルド済み Docker コンテナイメージを CircleCI  でデータベースサービスに使用する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI の [CircleCI Developer Hub](https://circleci.com/developer/images) には、言語とサービスごとにビルド済みイメージが用意されています。 これは、各種の便利な要素をイメージに追加したデータベースのようなものです。

以下には、`build` という 1 つのジョブが含まれている [`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルの例を示しています。 Executor に Docker が選択されており、最初のイメージとなるのは、すべての処理が実行されるプライマリ コンテナです。 この例には 2 番目のイメージがあり、これがサービスイメージとして使用されます。 最初のイメージのプログラミング言語は Python です。 Python イメージには `pip` がインストールされており、ブラウザーのテスト用に `-browsers` があります。 サービスイメージによって、データベースなどの別のサービスへのアクセスが可能となります。

## PostgreSQL データベースのテスト例
{: #postgresql-database-testing-example }

プライマリ イメージでは、設定ファイルに `environment` キーで環境変数が定義されており、URL が指定されています。 この URL により、これが PostgreSQL データベースであることが示されているので、デフォルトでは PostgreSQL デフォルト ポートが使用されます。 このビルド済みの CircleCI イメージには、データベースとユーザーがあらかじめ含まれています。 ユーザー名は `postgres`、データベースは `circle_test` です。 このため、すぐにこのユーザー名とデータベースを使用してイメージを使用できます。 ご自身で設定する必要はありません。

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

`steps` では最初に `checkout` が実行され、その後 Postgres クライアントツールがインストールされます。 `cimg/postgres:14.0` イメージでは、クライアント固有のデータベースアダプターはインストールされません。 たとえば、Python で PostgreSQL データベースとやり取りするために `psychopg2` のインストールが必要になる場合があります。 イメージの一覧は、[ビルド済み CircleCI サービスイメージ]({{ site.baseurl }}/ja/circleci-images/#next-gen-service-images) のページをご確認ください。

この例では、 `psql` にアクセスできるよう、設定で PostgreSQL クライアントツール、`postgresql-client` を `apt-get` からインストールします。 イメージのインストールパッケージには管理者の権限が必要なため、`sudo` が使われます。パスワードは不要です。

`postgresql-client-` のインストールの後には、データベースサービスとやり取りするための 2 つのコマンドがあります。 これらは SQL コマンドで、test というテーブルを作成し、そのテーブルに値を挿入します。 変更をコミットして GitHub にプッシュすると、CircleCI でビルドが自動的にトリガーされ、プライマリコンテナがスピンアップされます。

**注:** CircleCI では、複数のコンビニエンス環境変数がプライマリコンテナに挿入されます。 これらの変数は、その後のビルドの際に条件の中で使用できます。 たとえば、CIRCLE_NODE_INDEX と CIRCLE_NODE_TOTAL は同時実行環境に関連しています。 詳細については、[特定の環境変数を使用したビルドに関するドキュメント]({{ site.baseurl }}/ja/env-vars/#built-in-environment-variables)を参照してください。

データベースサービスがスピンアップされると、データベースの `circle_test` および `postgres` ロールが自動的に作成されます。これらは、ログインとテストの実行時に使用できます。 その後、データベーステストを実行してテーブルを作成し、そのテーブルに値を挿入します。

## オプションのカスタマイズ
{: #optional-customization }

このセクションでは、ビルドのさらなるカスタマイズや競合状態を避けるための追加のオプション設定について説明します。

### PostgreSQL イメージの最適化
{: #optimizing-postgresql-images }
{:.no_toc}

`circleci/postgres` Docker イメージは、ディスク上の通常の固定記憶域を使用します。 データベースを RAM ディスクに保存するとパフォーマンスが向上する場合があります。 これは、サービスコンテナイメージ設定ファイルの `PGDATA: /dev/shm/pgdata/data` 環境変数の設定で行えます。

### バイナリの使用
{: #using-binaries }
{:.no_toc}

`pg_dump`、`pg_restore`、および類似ユーティリティを使用するには、`pg_dump` の呼び出し時にも正しいバージョンが使用されるように追加の設定を行う必要があります。 以下の行を `config.yml` ファイルに追加して、`pg_*` または同等のデータベースユーティリティを有効にします。

```yml
    steps:
    # Postgres 12.0 バイナリをパスに追加します。
       - run: echo 'export PATH=/usr/lib/postgresql/1bin/:"$PATH"' >> "$BASH_ENV"
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

他の設定ファイルの例については、「[データベースの設定例]({{ site.baseurl }}/ja/postgres-config/)」を参照してください。

