---
layout: classic-docs
title: "高度な構成"
short-title: "高度な構成"
description: "高度な構成のオプションと機能の概要"
categories:
  - migration
order: 2
---

CircleCI supports many advanced configuration options and features, check out the snippets below to get an idea of what is possible, and get tips for optimizing your advanced configurations.

## スクリプトのチェック

Use the shellcheck orb to check all scripts in a project. Check the [shellcheck page in the orb registry](https://circleci.com/orbs/registry/orb/circleci/shellcheck) for versioning and further usage examples (remember to replace x.y.z with a valid version):

```yaml
version: 2.1

orbs:
  shellcheck: circleci/shellcheck@x.y.z

workflows:
  shellcheck:
    jobs:

      - shellcheck/check
```

You can also use shellcheck with version 2 config, without using the orb, as follows:

```yaml
version: 2

jobs:
  shellcheck:
    docker:

      - image: nlknguyen/alpine-shellcheck:v0.4.6
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Check Scripts
          command: |
            find . -type f -name '*.sh' | wc -l
            find . -type f -name '*.sh' | xargs shellcheck --external-sources
```

For more information on using shell scripts in your config, see the [Using Shell Scripts]({{site.baseurl}}/2.0/using-shell-scripts/) guide.

## Browser Testing

Use Selenium to manage in-browser tesing:

```yaml
version: 2

jobs:
  build:
    docker:

      - image: circleci/node-jessie-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
```

For more information on browser testing, see the [Browser Testing]({{site.baseurl}}/2.0/browser-testing/) guide.

## Database Testing

Use a service container to run database testing:

```yaml
version: 2
jobs:
  build:

    # Primary container image where all commands run
    docker:

      - image: circleci/python:3.6.2-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          TEST_DATABASE_URL: postgresql://root@localhost/circle_test

    # Service container image

      - image: circleci/postgres:9.6.5-alpine-ram
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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

For more information on configuring databases, see the [Configuring Databases]({{site.baseurl}}/2.0/databases/) guide.

## Docker コマンドによる Docker イメージのビルド

Run Docker commands to build Docker images. Set up a remote Docker environment when your primary executor is Docker:

```yaml
version: 2

jobs:
  build:
    docker:

      - image: <primary-container-image>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker # sets up remote docker container in which all docker commands will be run

      - run:
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test

```

For more information on building Docker images, see the [Building Docker Images]({{site.baseurl}}/2.0/building-docker-images/) guide.

## 高度な構成のヒント

Here are a few tips for optimization and maintaining a clear configuration file.

- 長いインライン bash スクリプトを使用するのはやめましょう。特に多数のジョブで使用する場合は注意してください。 長い bash スクリプトはリポジトリに移動し、クリアで読みやすい設定ファイルにします。
- フル チェック アウトを行わない場合は、[ワークスペース]({{site.baseurl}}/2.0/workflows/#ワークスペースによるジョブ間のデータ共有)を使用してジョブに外部スクリプトをコピーすることができます。
- 早く終わるジョブをワークフローの先頭に移動させます。 たとえば、lint や構文チェックは、実行時間が長く計算コストが高いジョブの前に実行する必要があります。
- ワークフローの*最初*に setup ジョブを実行すると、何らかの事前チェックだけでなく、後続のすべてのジョブのワークスペースの準備に役立ちます。

## 関連項目

[Optimizations]({{ site.baseurl }}/2.0/optimizations/) [Configuration Cookbook]({{ site.baseurl }}/2.0/configuration-cookbook/)