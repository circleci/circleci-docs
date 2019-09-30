---
layout: classic-docs
title: "高度なコンフィグ"
short-title: "高度なコンフィグ"
description: "高度なコンフィグのオプションと機能の概要"
categories:
  - migration
order: 2
---

CircleCI supports many advanced configuration options and features, check out the snippets below to get an idea of what is possible, as well as tips for optimizing advanced configurations.

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
          name: スクリプトをチェック
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
          name: Selenium をダウンロード
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Selenium を起動
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

## データベースのテスト

```yaml
version: 2
jobs:
  build:

    # Primary container image where all commands run

    docker:

      - image: circleci/python:3.6.2-stretch-browsers
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test

    # Service container image

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
          name: コンテナを起動し、動作していることを検証
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test

```

## Tips for Advanced Configuration

Here are a few tips for optimization and maintaining a clear configuration file.

- Avoid using large inline bash scripts, especially if used across many jobs. Consider moving large bash scripts into your repo to clean up your config and improve readability.
- [Workspaces]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs) can be used to copy external scripts between jobs if you don't want to do a full checkout.
- Move the quickest jobs up to the start of your workflows. For example, lint or syntax checking should happen before longer-running, more computationally expensive jobs.
- Using a "setup" job at the *start* of a workflow can be helpful to do some preflight checks and populate a workspace for all the following jobs.

## See Also

[Optimizations]({{ site.baseurl }}/2.0/optimizations/)