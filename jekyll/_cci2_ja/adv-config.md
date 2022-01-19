---
layout: classic-docs
title: "高度な設定"
short-title: "高度な設定"
description: "高度な設定のオプションと機能の概要"
categories:
  - 移行
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI では、高度な設定のオプションと機能を数多くサポートしています。 下記を参照して、どんなことができるかを確認してください。 高度な設定を最適化するヒントも紹介します。

## スクリプトのチェック
{: #check-your-scripts }

プロジェクト内のすべてのスクリプトをチェックするには、シェルチェック Orb を使用します。 [Orb レジストリのシェルチェックのページ](https://circleci.com/developer/orbs/orb/circleci/shellcheck)でバージョン管理と詳しい使用例を確認してください ( x.y.z を有効なバージョンに変更してください)。

```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  shellcheck:
    jobs:
      - shellcheck/check

```

バージョン 2 の設定でも、Orb を使わずにシェルチェックを以下のように使用できます。

```yaml
version: 2
jobs:
  shellcheck:
    docker:
      - image: nlknguyen/alpine-shellcheck:v0.4.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      - checkout
      - run:
          name: スクリプトのチェック
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

シェルスクリプトを設定で使用する場合の詳細は、 [シェルスクリプトの使用ガイド]({{site.baseurl}}/ja/2.0/using-shell-scripts/)を参照してください。

## ブラウザーでのテスト
{: #browser-testing }

Selenium を使用して、ブラウザでのテストを管理します。

```yaml
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:buster-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
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

ブラウザーでのテストの詳細については、 [ブラウザーでのテストガイド]({{site.baseurl}}/ja/2.0/browser-testing/) をご覧ください。

## データベースのテスト
{: #database-testing }

サービスコンテナを使用して、データベースのテストを実行します。

``` yaml
version: 2
jobs:
  build:

    # すべてのコマンドを実行するプライマリコンテナです。
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test

    # サービスコンテナのイメージです。
      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
```

データベースの設定についての詳細は、 [データベースの設定ガイド]({{site.baseurl}}/ja/2.0/databases/) を参照してください。

## Docker コマンドによる Docker イメージのビルド
{: #run-docker-commands-to-build-your-docker-images }

Docker コマンドを実行して Docker イメージをビルドします。 プライマリ Executor が Docker の場合、リモートの Docker 環境をセットアップします。

``` yaml
version: 2

jobs:
  build:
    docker:
      - image: <primary-container-image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します。
    steps:
      # ... アプリのビルド/テストステップです ...

      - setup_remote_docker # すべての Docker コマンドが実行されるリモート Docker コンテナを設定します。

      - run:
          name: コンテナの起動と動作確認
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test

```

Docker イメージのビルドに関する詳細は、 [Docker イメージのビルドガイド]({{site.baseurl}}/ja/2.0/building-docker-images/) を参照してください。

## 高度な設定のヒント
{: #tips-for-advanced-configuration }

設定ファイルを最適化し、明確に保つためのヒントを紹介します。

- 長いインライン bash スクリプトは使用しないでください。 特に多数のジョブで使用する場合は注意してください。 長い bash スクリプトはリポジトリに移動し、明確で読みやすい設定ファイルにします。
- フル チェック アウトを行わない場合は、[ワークスペース]({{site.baseurl}}/ja/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を使用してジョブに外部スクリプトをコピーすることができます。
- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前に実行する必要があります。
- ワークフローの*最初*に セットアップジョブを実行すると、何らかの事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備に役立ちます。


## 関連項目
{: #see-also }

[Optimizations]({{ site.baseurl }}/ja/2.0/optimizations/) [Configuration Cookbook]({{ site.baseurl }}/ja/2.0/configuration-cookbook/)
