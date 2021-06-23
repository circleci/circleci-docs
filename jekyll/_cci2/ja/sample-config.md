---
layout: classic-docs
title: "config.yml のサンプル ファイル"
short-title: "config.yml のサンプル ファイル"
description: "config.yml のサンプル ファイル"
categories:
  - migration
order: 2
version:
  - Cloud
  - Server v2.x
---

[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) のサンプル ファイルをご紹介します。

* 目次
{:toc}

## シンプルな設定ファイル サンプル
{: #simple-configuration-examples }

### 同時実行ワークフロー
{: #concurrent-workflow }

以下に、同時実行ワークフローの設定ファイル サンプルを示します。ここでは、`build` ジョブと `test` ジョブを一度に実行しています。 ジョブ制御の同時実行化、シーケンシャル化、もしくは承認して処理を続行するワークフローについて、詳しくは[ワークフローに関するページ]({{ site.baseurl }}/2.0/workflows)を参照してください。

次の図に、以下の設定ファイル サンプルのワークフロー ビューを示します。 ![同時実行ワークフローのグラフ]({{ site.baseurl }}/assets/img/docs/concurrent-workflow-map.png)

{:.tab.basic-concurrent.Cloud}
```yaml
version: 2.1

# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the test job"

# ジョブの実行順の指定
workflows:
  build_and_test:
    jobs:
      - build
      - test
```

{:.tab.basic-concurrent.Server}
```yaml
version: 2

# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the test job"

# ジョブの実行順の指定
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```

### 順次実行ワークフロー
{: #sequential-workflow }

以下に、ジョブの順次実行ワークフローの設定ファイル サンプルを示します。ここでは、まず `build` ジョブを実行し、`build` ジョブの完了後 `test` ジョブを実行しています。 ジョブ制御の同時実行化、シーケンシャル化、もしくは承認して処理を続行するワークフローについて、詳しくは[ワークフローに関するページ]({{ site.baseurl }}/2.0/workflows)を参照してください。

次の図に、ジョブを 1 つずつ順番に実行する以下の設定ファイル サンプルのワークフロー ビューを示します。![順次実行ワークフローのグラフ]({{ site.baseurl }}/assets/img/docs/sequential-workflow-map.png)

{:.tab.basic-sequential.Cloud}
```yaml
version: 2.1

# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the test job"

# ジョブの実行順の指定
workflows:
  build_and_test:
    jobs:
      - build
      - test
          requires:
            - build
```

{:.tab.basic-sequential.Server}
```yaml
version: 2
# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the build job"
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: echo "this is the test job"

# ジョブの実行順の指定
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
          requires:
            - build
```

### 承認ジョブ
{: #approval-job }

以下に、承認ステップを使用するジョブの順次実行ワークフローの例を示します。 まず `build` ジョブ、次に `test` ジョブが実行されます。その後、`type: approval` が設定された `hold` ジョブでワークフローは待機状態になり、手動で承認が行われると `deploy` ジョブが実行されます。 ジョブ制御の同時実行化、シーケンシャル化、もしくは承認して処理を続行するワークフローについて、詳しくは[ワークフローに関するページ]({{ site.baseurl }}/2.0/workflows)を参照してください。

次の図に、以下の設定ファイル サンプルのワークフロー ビューを示します。 この図は 3 部構成であり、アプリで hold ステップをクリックすると表示される承認ポップアップと、`hold` ジョブが承認され `deploy` ジョブが実行された後のワークフロー ビューも示されています。

![承認ワークフローのグラフ]({{ site.baseurl }}/assets/img/docs/approval-workflow-map.png)

{:.tab.approval.Cloud}
```yaml
version: 2.1

# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-build-commands
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-test-commands
  deploy:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-deploy-commands

# ジョブの実行順の指定
workflows:
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
      - hold:
          type: approval
          requires:
            - build
            - test
      - deploy:
          requires:
            - hold
```

{:.tab.approval.Server}
```yaml
version: 2

# このプロジェクトで実行するジョブの定義
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-build-commands
  test:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-test-commands
  deploy:
    docker:
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: my-deploy-commands

# ジョブの実行順の指定
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
      - hold:
          type: approval
          requires:
            - build
            - test
      - deploy:
          requires:
            - hold
```

## 順次実行ワークフローの設定例
{: #sample-configuration-with-sequential-workflow }

以下に、次の CircleCI 設定機能を使用した `.circleci/config.yml` ファイル サンプルを示します。

* 順次実行ワークフロー
* Orb (Cloud の `version: 2.1` 設定ファイルのみ): node Orb でキャッシュを自動処理しています。キャッシュの保存と復元の方法については Server の `version: 2.0` サンプルを参照してください。
* セカンダリ サービス コンテナ
* ワークスペース
* アーティファクトの保存

{:.tab.complex-sequential.Cloud}
```yaml
version: 2.1

orbs:
  node: circleci/node@3.0.0

jobs:
  build:
    working_directory: ~/mern-starter
    # node Orb で指定されている Docker コンテナ設定を再利用
    executor: node/default
    steps:
      - checkout
      # 最新の npm のインストール - node Orb が自動処理
      - node/install-npm
      # 依存関係のインストール - インストールと依存関係のキャッシュは node Orb が自動処理
      - node/install-packages:
          app-dir: ~/mern-starter
          cache-path: node_modules
          override-ci-command: npm i
      # 後続のジョブ (test) 用にワークスペースを保存
      - persist_to_workspace:
          root: .
          paths:
            - .

  test:
    docker:
      # 最初に記述したイメージのインスタンスがプライマリ コンテナになります。 ジョブのコマンドはこのコンテナ内で実行されます。
      - image: cimg/node:current
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      # 2 番目に記述されたイメージのインスタンスがセカンダリ コンテナになります。このインスタンスは、ローカルホスト上のプライマリ コンテナのポートを通じて共通ネットワークで動作します。
      - image: mongo:4.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      # build ジョブのワークスペースを再利用
      - attach_workspace:
          at: .
      - run:
          name: MongoDB がローカルホストとして利用可能であることを示すデモ
          command: |
            curl -sSJL https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
            sudo apt update
            sudo apt install mongodb-org
            mongo localhost --eval 'db.serverStatus()'
      - run:
          name: テスト
          command: npm test
      - run:
          name: コード カバレッジの生成
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      # アーティファクトとして保存する対象には 1 つのファイルまたはディレクトリを指定できます
      - store_artifacts:
          path: test-results.xml
          destination: deliverable.xml
      - store_artifacts:
          path: coverage
          destination: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
```

{:.tab.complex-sequential.Server}
{% raw %}
```yaml
version: 2

jobs:
  build:
    working_directory: ~/mern-starter
      # 最初に記述したイメージのインスタンスがプライマリ コンテナになります。 ジョブのコマンドはこのコンテナ内で実行されます。
    docker:
      - image: circleci/node:4.8.2-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    # 2 番目に記述されたイメージのインスタンスがセカンダリ コンテナになります。このインスタンスは、ローカルホスト上のプライマリ コンテナのポートを通じて共通ネットワークで動作します。
      - image: mongo:3.4.4-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run:
          name: npm の更新
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: npm wee のインストール
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
  test:
    docker:
      - image: circleci/node:4.8.2-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      - image: mongo:3.4.4-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run:
          name: テスト
          command: npm test
      - run:
          name: コード カバレッジの生成
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
          filters:
            branches:
              only: master
```
{% endraw %}

上記の例では、順次実行ワークフローを使用し、かつ `test` ジョブをマスター ブランチでのみ実行するよう設定しています。 ジョブ制御の同時実行化、シーケンシャル化、もしくは承認して処理を続行するワークフローについて、詳しくは[ワークフローに関するページ]({{ site.baseurl }}/2.0/workflows)を参照してください。

## ファンイン・ファンアウト ワークフローの設定例
{: #sample-configuration-with-fan-infan-out-workflow }
以下に、ファンイン・ファンアウト ワークフローの設定例を 2 つ示します。

Server の `2.0` 設定ファイル サンプルの詳細については、[GitHub 上の完全版デモ リポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)を参照してください。

Cloud の `2.1` 設定ファイル サンプルの詳細については、次のワークフローのグラフを参照してください

![ファンイン・ファンアウト]({{ site.baseurl }}/assets/img/docs/fan-in-out-example.png)

{:.tab.fan-in-our.Cloud}
{% raw %}
```yaml
version: 2.1

orbs:
    docker: circleci/docker@1.0.1

jobs:
    prepare-dependencies:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        steps:
            - checkout
            - run:
                  name: コンピューティングのバージョン番号
                  command: echo "0.0.${CIRCLE_BUILD_NUM}-${CIRCLE_SHA1:0:7}" | tee version.txt
            - restore_cache:
                  keys:
                      - yarn-deps-{{ checksum "yarn.lock" }}
                      - yarn-deps
            - run:
                  name: yarn のインストール
                  command: yarn install
            - save_cache:
                  paths:
                      - node_modules
                  key: yarn-deps-{{ checksum "yarn.lock" }}-{{ epoch }}
            - store_artifacts:
                  path: yarn.lock
            - persist_to_workspace:
                  root: .
                  paths:
                      - .

    build-production:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: 本番環境でのビルド
                  command: |
                      export __BUILD_VERSION="$(cat version.txt)"
                      yarn build
            - store_artifacts:
                  path: dist/server.js
            - persist_to_workspace:
                  root: .
                  paths:
                      - .

    build-docker-image:
        machine:
            image: ubuntu-1604:202004-01
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: __BUILD_VERSION 環境変数の設定
                  command: |
                      echo "export __BUILD_VERSION=\"$(cat version.txt)\"" >> $BASH_ENV
            - docker/check:
                  registry: $DOCKER_REGISTRY
            - docker/build:
                  image: $DOCKER_IMAGE_NAME
                  tag: $__BUILD_VERSION
                  registry: $DOCKER_REGISTRY
            - docker/push:
                  image: $DOCKER_IMAGE_NAME
                  tag: $__BUILD_VERSION
                  registry: $DOCKER_REGISTRY

    test:
        docker:
            - image: node:current-alpine
              auth:
                username: mydockerhub-user
                password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
        parallelism: 2
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: テストの実行
                  command: |
                      circleci tests glob '**/*.test.ts' | circleci tests split --split-by timings | xargs yarn test:ci
            - store_artifacts:
                  path: test-results
            - store_test_results:
                  path: test-results

    deploy-docker-image:
        machine:
            image: ubuntu-1604:202004-01
        steps:
            - attach_workspace:
                  at: .
            - run:
                  name: __BUILD_VERSION 環境変数の設定
                  command: |
                      echo "export __BUILD_VERSION=\"$(cat version.txt)\"" >> $BASH_ENV
            - docker/check:
                  registry: $DOCKER_REGISTRY
            - docker/pull:
                  images: $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$__BUILD_VERSION
            - run:
                  name: イメージへの latest タグの付加
                  command: docker tag $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$__BUILD_VERSION $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest
            - docker/push:
                  image: $DOCKER_IMAGE_NAME
                  tag: latest
                  registry: $DOCKER_REGISTRY

workflows:
    version: 2
    build-test-deploy:
        jobs:
            - prepare-dependencies
            - build-production:
                  requires:
                      - prepare-dependencies
            - build-docker-image:
                  context: docker-hub
                  requires:
                      - build-production
            - test:
                  requires:
                      - prepare-dependencies
            - deploy-docker-image:
                  context: docker-hub
                  requires:
                      - build-docker-image
                      - test
```
{% endraw %}

{:.tab.fan-in-our.Server}
{% raw %}
```yaml
version: 2.0

jobs:
  checkout_code:
    docker:
      - image: circleci/ruby:2.4-node-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: ~/circleci-demo-workflows
    steps:
      - checkout
      - save_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows

  bundle_dependencies:
    docker:
      - image: circleci/ruby:2.4-node-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle install --path vendor/bundle
      - save_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
          paths:
            - ~/circleci-demo-workflows/vendor/bundle

  rake_test:
    docker:
      - image: circleci/ruby:2.4-node-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run: bundle exec rake db:create db:schema:load
      - run:
          name: テストの実行
          command: bundle exec rake

  precompile_assets:
    docker:
      - image: circleci/ruby:2.4-node-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
      - image: circleci/postgres:9.4.12-alpine
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run:
          name: アセットのプリコンパイル
          command: bundle exec rake assets:precompile
      - save_cache:
          key: v1-assets-{{ .Environment.CIRCLE_SHA1 }}
          paths:
            - ~/circleci-demo-workflows/public/assets

  deploy:
    machine:
        enabled: true
    working_directory: ~/circleci-demo-workflows
    environment:
      HEROKU_APP: still-shelf-38337
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - restore_cache:
          key: v1-assets-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: マスターから Heroku へのデプロイ
          command: |
            git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP.git master

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - checkout_code
      - bundle_dependencies:
          requires:
            - checkout_code
      - rake_test:
          requires:
            - bundle_dependencies
      - precompile_assets:
          requires:
            - bundle_dependencies
      - deploy:
          requires:
            - rake_test
            - precompile_assets
```
{% endraw %}

**注:** ジョブを実行できるのは、そのジョブの依存関係が満たされているときのみなので、事前に実行される上流ジョブすべての依存関係が必要になります。 そのため、`requires:` キーのブロックで、直近の依存関係のみを指定する必要があります。

## 複数の Executor タイプを利用する設定例
{: #sample-configuration-with-multiple-executor-types }

1 つのワークフローのなかで、複数の [Executor タイプ](https://circleci.com/docs/2.0/executor-types/)を利用できます。

`Example-1` では、Linux、Windows、macOS のそれぞれでプロジェクトのビルドおよびテストを行っています。

`Example-2` では、iOS アプリのプロジェクトに関する部分を macOS でビルドし、それ以外の iOS ツール([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker でビルドしています。

{:.tab.multiple-executors.Example-1}
```yaml
version: 2.1

orbs:
  github-release: haskell-works/github-release@1.3.3

parameters:
  src-repo-url:
    type: string
    default: https://github.com/esnet/iperf.git
  branch-name:
    type: string
    default: "3.8.1"
  common-build-params:
    type: string
    default: "--disable-shared --disable-static"

jobs:
  build-linux:
    docker:
      - image: archlinux/base
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    parameters:
      label:
        type: string
        default: iperf3-linux
    steps:
      - run:
          name: 依存関係のインストール
          command: pacman -Syu --noconfirm openssl git gcc make awk tar
      - run:
          name: iperf3 のクローン
          command: git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
      - run:
          name: iperf3 のビルド
          working_directory: iperf
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            ./configure --prefix=$IPERF3_MAKE_PREFIX << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
      - run:
          name: tarball の作成
          command: tar -cJf << parameters.label >>.tar.xz << parameters.label >>
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.tar.xz
      - store_artifacts:
          path: << parameters.label >>.tar.xz

  build-windows:
    machine:
      image: windows-server-2019-vs2019:stable
      shell: powershell.exe
    resource_class: windows.medium
    parameters:
      label:
        type: string
        default: iperf3-cygwin64
    steps:
      - run:
          name: Cygwin インストーラーのダウンロード
          shell: bash.exe
          command: |
            curl -sSJOL https://cygwin.com/setup-x86_64.exe
      - run:
          name: Cygwin と必須パッケージのインストール
          command: .\setup-x86_64.exe -q -s https://mirrors.kernel.org/sourceware/cygwin/ -P libssl-devel,git,gcc-core,make
      - run:
          name: Cygwin を使用した iperf3 のビルド
          shell: C:\\cygwin64\\bin\\bash.exe --login -eo pipefail
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            cd $CIRCLE_WORKING_DIRECTORY
            git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
            cd iperf
            ./configure --prefix=$IPERF3_MAKE_PREFIX << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
            cp /usr/bin/cygwin1.dll /usr/bin/cygcrypto-1.1.dll /usr/bin/cygz.dll -t $IPERF3_MAKE_PREFIX/bin
      - run:
          name: zip ファイルの作成
          command: |
            $ProgressPreference = "SilentlyContinue"
            Compress-Archive .\\<< parameters.label >> .\\<< parameters.label >>.zip
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.zip
      - store_artifacts:
          path: << parameters.label >>.zip

  build-macos:
    macos:
      xcode: 11.5.0
    parameters:
      label:
        type: string
        default: iperf3-macos
    steps:
      - run:
          name: iperf3 のクローン
          command: git clone << pipeline.parameters.src-repo-url >> -b << pipeline.parameters.branch-name >>
      - run:
          name: iperf3 のビルド
          working_directory: iperf
          command: |
            CIRCLE_WORKING_DIRECTORY=$(eval "echo $CIRCLE_WORKING_DIRECTORY")
            IPERF3_MAKE_PREFIX=$CIRCLE_WORKING_DIRECTORY/<< parameters.label >>
            ./configure --prefix=$IPERF3_MAKE_PREFIX --with-openssl=$(brew --prefix openssl) << pipeline.parameters.common-build-params >>
            make
            mkdir -p $IPERF3_MAKE_PREFIX
            make install
            # 事後実行
            cd $IPERF3_MAKE_PREFIX/bin
            # リンクされている OpenSSL ライブラリを現在のディレクトリにコピーし
            # リンカーにそれらを参照するように指示
            otool -L iperf3 | grep openssl | awk '{ print $1 }' | while read dylib
            do
              name=$(basename $dylib)
              cp $dylib ./
              chmod u+w $name
              install_name_tool -change $dylib @executable_path/$name iperf3
            done
            # 同様に libssl も変更
            otool -L libssl.1.1.dylib | grep openssl | awk '{ print $1 }' | while read dylib
            do
              install_name_tool -change $dylib @executable_path/$(basename $dylib) libssl.1.1.dylib
            done
      - run:
          name: zip ファイルの作成
          command: zip -r << parameters.label >>.zip << parameters.label >>
      - persist_to_workspace:
          root: .
          paths:
            - << parameters.label >>.zip
      - store_artifacts:
          path: << parameters.label >>.zip

  test-linux:
    docker:
      - image: cimg/base:stable
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    parameters:
      label:
        type: string
        default: iperf3-linux
    steps:
      - attach_workspace:
          at: ./
      - run:
          name: << parameters.label >>.tar.xz の展開
          command: tar -xf << parameters.label >>.tar.xz
      - run:
          name: 実行可能ファイルのテスト
          command: << parameters.label >>/bin/iperf3 -v
      - run:
          name: サーバーとして実行
          command: << parameters.label >>/bin/iperf3 -s
          background: true
      - run:
          name: クライアントとして実行
          command: << parameters.label >>/bin/iperf3 -c localhost -R

  test-windows:
    machine:
      image: windows-server-2019-vs2019:stable
      shell: powershell.exe
    resource_class: windows.medium
    parameters:
      label:
        type: string
        default: iperf3-cygwin64
    steps:
      - attach_workspace:
          at: .
      - run:
          name: iperf3-cygwin64.zip の展開
          command: |
            $ProgressPreference = "SilentlyContinue"
            Expand-Archive .\\<< parameters.label >>.zip .
      - run:
          name: 実行可能ファイルのテスト
          command: .\\<< parameters.label >>\bin\iperf3.exe -v
      - run:
          name: サーバーとして実行
          command: .\\<< parameters.label >>\bin\iperf3.exe -s
          background: true
      - run:
          name: クライアントとして実行
          command: .\\<< parameters.label >>\bin\iperf3.exe -c localhost -R

  test-macos:
    macos:
      xcode: 11.5.0
    parameters:
      label:
        type: string
        default: iperf3-macos
    steps:
      - attach_workspace:
          at: .
      - run:
          name: プリインストールされている OpenSSL のアンインストール
          command: brew uninstall --ignore-dependencies openssl
      - run:
          name: << parameters.label >> の展開
          command: unzip << parameters.label >>
      - run:
          name: 実行可能ファイルのテスト
          command: << parameters.label >>/bin/iperf3 -v
      - run:
          name: サーバーとして実行
          command: << parameters.label >>/bin/iperf3 -s
          background: true
      - run:
          name: クライアントとして実行
          command: << parameters.label >>/bin/iperf3 -c localhost -R

  release:
    executor: github-release/default
    steps:
      - attach_workspace:
          at: .
      - run:
          name: コンピューティングのバージョン番号
          command: |
            echo "export IPERF3_BUILD_VERSION=\"<< pipeline.parameters.branch-name>>-${CIRCLE_BUILD_NUM}-${CIRCLE_SHA1:0:7}\"" | tee -a $BASH_ENV
      - github-release/release:
          tag: v$IPERF3_BUILD_VERSION
          title: $IPERF3_BUILD_VERSION
          artefacts-folder: .

workflows:
  version: 2
  build-test-release:
    jobs:
      - build-linux
      - build-windows
      - build-macos
      - test-linux:
          requires:
            - build-linux
      - test-windows:
          requires:
            - build-windows
      - test-macos:
          requires:
            - build-macos
      - release:
          requires:
            - test-linux
            - test-windows
            - test-macos
          context: github
          filters:
            branches:
              only: master
```

{:.tab.multiple-executors.Example-2}
{% raw %}
```yaml
version: 2.1

jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    steps:
      - checkout
      - run:
          name: CocoaPods のインストール
          command: pod install --verbose
      - run:
          name: テストのビルドと実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests
      - store_test_results:
          path: test_output/report.xml
      - store_artifacts:
          path: /tmp/test-results
          destination: scan-test-results
      - store_artifacts:
          path: ~/Library/Logs/scan
          destination: scan-logs

  swiftlint:
    docker:
      - image: dantoml/swiftlint:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:
      - image: dantoml/danger:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - run: danger

workflows:
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```
{% endraw %}

## 関連項目
{: #see-also }
{:.no_toc}

* このページのサンプルで扱った各コンセプトの詳細については、[コンセプトに関するページ]({{ site.baseurl }}/2.0/concepts/#configuration)および[ワークフローに関するページ]({{ site.baseurl }}/2.0/workflows/)を参照してください。
* 個々の構成キーの詳細については、[設定ファイルのリファレンス ページ]({{ site.baseurl }}/2.0/configuration-reference/)を参照してください。
* CircleCI を使用するパブリック プロジェクトの一覧については、「[パブリック リポジトリの例]({{ site.baseurl }}/2.0/example-configs/)」を参照してください。
