---
layout: classic-docs
title: "2.0 config.yml の設定例"
short-title: "2.0 config.yml の設定例"
description: "2.0 config.yml の設定例"
categories: [migration]
order: 2
---

このページでは、[`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルの設定例を 3 つあげて解説しています。

* TOC
{:toc}

CircleCI 2.0 の設定ファイルは `version: 2` というキーから始まります。このキーは古い CircleCI 1.0 でビルドしているプロジェクトを CircleCI 2.0 で使えるようにします。言い換えると、他のプロジェクトでは 2.0 を使いながら 1.0 のプロジェクトも引き続き利用できるということです。その後に続く `jobs`、`steps`、`workflows` という 3 つのキーは、ビルド実行時にあらゆる箇所における詳細なフィードバックレポートを確認できるようにします。詳しくは「[ジョブとステップ]({{ site.baseurl }}/ja/2.0/jobs-steps/)」や「 [Workflows]({{ site.baseurl }}/ja/2.0/workflows/)」ページをご覧ください。

## パラレルジョブの設定例

下記は CircleCI 2.0 の `.circleci/config.yml` ファイルの内容です。

{% raw %}

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
  test:
    docker:
      - image: circleci/<language>:<version TAG>
    steps:
      - checkout
      - run: <command>
workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test
```

{% endraw %}

これは、並行処理によって実行時間を短縮する、`build` と `test` の 2 つのパラレルジョブで構成される Workflow の例となります。ジョブ制御のパラレル化、シーケンシャル化、もしくは承認して処理を続行する Workflows について、詳しくは「[Workflows]({{ site.baseurl }}/2.0/workflows)」ページを参照してください。

## シーケンシャル Workflow の設定例

下記は CircleCI 2.0 の `.circleci/config.yml` ファイルの内容です。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # 最初の1行目に指定されたイメージがプライマリコンテナのインスタンスとなります。 ジョブのコマンドはこのコンテナ内で実行されます。
    docker:
      - image: circleci/node:4.8.2-jessie
    # 2 番目に指定されたイメージがセカンダリコンテナのインスタンスとなります。このインスタンスは、ローカルホスト上のプライマリコンテナのポートを通じて共通ネットワークで動作します。
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: npm のアップデート
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
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: テスト
          command: npm test
      - run:
          name: コードカバレッジの生成
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

これは、マスターブランチでのみ実行するよう設定された `test` ジョブを含むシーケンシャル Workflow の例となります。ジョブ制御のパラレル化、シーケンシャル化、あるいは承認して処理を続行する Workflows について、詳しくは「[Workflows]({{ site.baseurl }}/ja/2.0/workflows) 」ページを参照してください。

## ファンイン・ファンアウト Workflow の設定例
下記は複数の依存関係を元にビルドを行うファンイン・ファンアウト Workflow のサンプルです。この設定ファイルを含むデモプロジェクトは [the complete demo repo on GitHub](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) で確認できます。

なお、依存関係が解決しない限りジョブは実行されないことから、事前に実行されるアップストリームジョブの依存関係が一時的に必要となります。そのため、`requires:` キーのブロックで必要な直近の依存関係を指定する形にします。

{% raw %}

```yaml
version: 2.0

jobs:
  checkout_code:
    docker:
      - image: circleci/ruby:2.4-node-jessie
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/postgres:9.4.12-alpine
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
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - restore_cache:
          key: v1-repo-{{ .Environment.CIRCLE_SHA1 }}
      - restore_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run:
          name: コンパイル済みアセット
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
          name: マスターから Heroku にデプロイ
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

## 複数の Executor タイプ (macOS ＋ Docker) を利用する設定例

1 つの Workflow のなかで複数の [Executor タイプ](https://circleci.com/docs/ja/2.0/executor-types/)
を利用できます。 下記の例では、iOS アプリの
プロジェクトに関する部分を macOS でビルドし、
それ以外の iOS ツール
（[SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)）
は Docker でビルドします。

{% raw %}

```yaml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "9.0"

    steps:
      - checkout
      - run:
          name: CocoaPods の Specs リポジトリをフェッチ
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: CocoaPods のインストール
          command: pod install --verbose

      - run:
          name: ビルド、実行テスト
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
    steps:
      - checkout
      - run: danger

workflows:
  version: 2
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```

{% endraw %}

## 関連情報

CircleCI を使用するパブリックプロジェクトのリストについては、「[パブリックリポジトリの例]({{ site.baseurl }}/ja/2.0/example-configs/)」ページを参照してください。
