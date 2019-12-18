---
layout: classic-docs
title: "データベースの設定"
short-title: "データベースの設定"
description: "PostgreSQL の設定例"
categories: [configuring-jobs]
order: 35
---

ここでは、正式な CircleCI ビルド済み Docker コンテナイメージを CircleCI 2.0 でデータベースサービスに使用する方法について説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI の [CircleCI Docker Hub](https://hub.docker.com/r/circleci/) には、言語とサービスごとにビルド済みイメージが用意されています。これは、各種の便利な要素をイメージに追加したデータベースのようなものです。

以下の例は、`build` という 1つのジョブが含まれている 2.0 [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを示しています。 Executor に Docker が選択されており、最初のイメージとなるのは、すべての処理が実行されるプライマリコンテナです。 この例には 2番目のイメージがあり、これがサービスイメージとして使用されます。 最初のイメージは、プログラミング言語の Python です。 Python イメージには `pip` がインストールされており、ブラウザーのテスト用に `-browsers` があります。 2番目のイメージから、データベースなどにアクセスできます。

## PostgreSQL データベースのテスト例

プライマリイメージでは、コンフィグに `environment` キーで環境変数が定義されており、URL が指定されています。 この URL により、これが PostgreSQL データベースであることが示されているので、デフォルトでは PostgreSQL デフォルトポートが使用されます。 このビルド済みの CircleCi イメージには、データベースとユーザーがあらかじめ含まれています。 ユーザー名は `root`、データベースは `circletest` です。 このため、すぐにこのユーザー名とデータベースを使用してイメージを使用できます。自身でユーザー名とデータベースを設定する必要はありません。

この例の Postgres イメージは、あらかじめ少し変更されています (末尾に `-ram` が追加されています)。 このイメージはメモリ内で実行され、ディスクへの負荷は発生しません。そのため、このイメージを使用すると PostgreSQL データベースでのテストのパフォーマンスが大幅に向上します。

{% raw %}

```yaml
version: 2
jobs:
  build:

    # すべてのコマンドを実行する場所となるプライマリコンテナイメージ

    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test

    # サービスコンテナイメージ

      - image: circleci/postgres:9.6.5-alpine-ram

    steps:
      - checkout
      - run: sudo apt-get update
      - run: sudo apt-get install postgresql-client-9.6
      - run: whoami
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "CREATE TABLE test (name char(25));"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "INSERT INTO test VALUES ('John'), ('Joanna'), ('Jennifer');"
      - run: |
          psql \
          -d $TEST_DATABASE_URL \
          -c "SELECT * from test"
```

{% endraw %}

`steps` では最初に `checkout` が実行され、その後 Postgres クライアントツールがインストールされます。 `postgres:9.6.5-alpine-ram` イメージでは、クライアント固有のデータベースアダプターはインストールされません。 たとえば、Python で PostgreSQL データベースとやり取りするために `psychopg2` のインストールが必要になる場合があります。 [CircleCI のビルド済みサービスイメージの説明]({{ site.baseurl }}/ja/2.0/circleci-images/#サービスイメージ)で、イメージの一覧と、このビルド設定のビデオを参照できます。

この例のコンフィグでは、`psql` にアクセスするために PostgreSQL クライアントツールがインストールされます。 **メモ：**ここで `sudo` を実行しているのは、ほとんどのコンテナがデフォルトで実行される一方で、root アカウントではイメージが実行されないためです。 CircleCI のデフォルトでは circle アカウントでコマンドが実行されるため、管理者権限や root 権限で実行するときは、コマンドの前に `sudo` を追加する必要があります。

`postgresql-client-9.6` のインストールの後には、データベースサービスとやり取りするための 3つのコマンドがあります。 これらは SQL コマンドで、test というテーブルを作成し、値をそのテーブルに挿入して、テーブルから選択します。 変更をコミットして GitHub にプッシュすると、CircleCI でビルドが自動的にトリガーされ、プライマリコンテナがスピンアップされます。

**メモ：**CircleCI では、複数のコンビニエンス環境変数がプライマリコンテナに挿入されます。これらの変数は、その後のビルドの際に条件の中で使用できます。 たとえば、CIRCLE_NODE_INDEX と CIRCLE_NODE_TOTAL は並列ビルドに関連しています。詳細については、[特定の環境変数を使用したビルドに関するドキュメント]({{ site.baseurl }}/ja/2.0/env-vars/#built-in-environment-variables)を参照してください。

データベースサービスがスピンアップされると、データベースの `circlecitest` および `root` ロールが自動的に作成されます。これらは、ログインとテストの実行時に使用できます。 データベースサービスは `root` ではなく、`circle` アカウントを使用して実行されます。 次に、データベースのテストが実行されてテーブルが作成され、値がそのテーブルに挿入されます。テーブルで SELECT が実行されると、値が取得されます。

## オプションのカスタマイズ

このセクションでは、ビルドをさらにカスタマイズしたり、競合状態を避けたりするための追加のオプション設定について説明します。

### Postgres イメージの最適化
{:.no_toc}

デフォルトの `circleci/postgres` Docker イメージは、ディスク上の通常の固定記憶域を使用します。 `tmpfs` を使用すると、テストの実行速度が向上し、リソースの使用量を抑えられる可能性があります。 `tmpfs` ストレージを利用するバリアントを使用するには、`-ram` を `circleci/postgres` タグ (`circleci/postgres:9.6-alpine-ram`など) に付加します。

また、PostGIS も使用可能です。上記の例では、`circleci/postgres:9.6-alpine-postgis-ram` のようになります。

### バイナリの使用
{:.no_toc}

`pg_dump`、`pg_restore`、および類似ユーティリティを使用するには、`pg_dump` の呼び出し時にも正しいバージョンが使用されるように追加の設定を行う必要があります。 以下の行を `config.yml` ファイルに追加して、`pg_*` または同等のデータベースユーティリティを有効にします。

         steps:
        # Postgres 9.6 バイナリをパスに追加します。
           - run: echo 'export PATH=/usr/lib/postgresql/9.6/bin/:$PATH' >> $BASH_ENV


### Dockerize を使用した依存関係の待機
{:.no_toc}

ジョブで複数の Docker コンテナを使用している場合、コンテナ内のサービスが開始される前にジョブがサービスを使用しようとすると、競合状態が発生することがあります。 たとえば、PostgreSQL コンテナが実行されていても、接続を受け入れる準備ができていない場合などです。 この問題を回避するには、`dockerize` を使用して依存関係を待機します。 以下の例は、CircleCI `config.yml` ファイルでこの問題を回避する方法を示しています。

```yaml
version: 2.0
jobs:
  build:
    working_directory: /your/workdir
    docker:
      - image: your/image_for_primary_container
      - image: postgres:9.6.2-alpine
        environment:
          POSTGRES_USER: your_postgres_user
          POSTGRES_DB: your_postgres_test
    steps:
      - checkout
      - run:
          name: dockerize をインストール
          command: wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && sudo tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
          environment:
            DOCKERIZE_VERSION: v0.3.0
      - run:
          name: db を待機
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
{:.no_toc}

他の設定ファイルの例については、「[データベースの設定例]({{ site.baseurl }}/ja/2.0/postgres-config/)」を参照してください。
