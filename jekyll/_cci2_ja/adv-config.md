---
layout: classic-docs
title: "高度な構成"
short-title: "高度な構成"
description: "高度な構成のオプションと機能の概要"
categories:
  - migration
order: 2
---

CircleCI は、高度な構成のためのオプションと機能を数多くサポートしています。何ができるかについては、以下のスニペットを参照してください。高度な構成を最適化するヒントも紹介します。

## スクリプトのチェック

```yaml
version: 2
jobs:
  shellcheck:
    docker:
      - image: nlknguyen/alpine-shellcheck:v0.4.6
    steps:
      - checkout
      - run:
          name: スクリプトのチェック
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

## ブラウザーでのテスト

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node-jessie-browsers
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Selenium のダウンロード
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Selenium の起動
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

## データベースのテスト

```yaml
version: 2
jobs:
  build:

    # すべてのコマンドを実行する場所となるプライマリ コンテナ イメージ

    docker:

      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test

    # サービス コンテナ イメージ

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

## Docker コマンドによる Docker イメージのビルド

```yaml
jobs:
  build:
    steps:
      # ... アプリのビルド・テストに関する記述 ...

      - setup_remote_docker

      - run:
          name: コンテナの起動と動作の検証
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test

```

## 高度な構成のヒント

設定ファイルを最適化し、クリアに保つためのヒントを紹介します。

- 長いインライン bash スクリプトを使用するのはやめましょう。特に多数のジョブで使用する場合は注意してください。 長い bash スクリプトはリポジトリに移動し、クリアで読みやすい設定ファイルにします。
- フル チェック アウトを行わない場合は、[ワークスペース]({{site.baseurl}}/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を使用してジョブに外部スクリプトをコピーすることができます。
- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前に実行する必要があります。
- ワークフローの*最初*に setup ジョブを実行すると、何らかの事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備に役立ちます。

## 関連項目

[最適化]({{ site.baseurl }}/2.0/optimizations/)