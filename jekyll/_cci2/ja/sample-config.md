---
layout: classic-docs
title: "config.yml の設定例"
short-title: "config.yml の設定例"
description: "2.0 config.yml の設定例"
categories:
  - migration
order: 2
---
このページでは [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルの設定例を以下の内容に沿って解説しています。

* 目次
{:toc}

CircleCI 2.0 の設定ファイルは `version: 2` というキーから始まります。 このキーは古い CircleCI 1.0 でビルドしているプロジェクトを CircleCI 2.0 で使えるようにします。言い換えると、他のプロジェクトでは 2.0 を使いながら 1.0 のプロジェクトも引き続き利用できるということです。 その後に続く `jobs`、`steps`、`workflows` という 3 つのキーは、ビルド実行時にあらゆる箇所における詳細なフィードバックレポートを確認できるようにします。 詳しくは [ジョブとステップ]({{ site.baseurl }}/2.0/jobs-steps/)、および [Workflows]({{ site.baseurl }}/2.0/workflows/) でチェックしてください。

## Sample Configuration with Parallel Jobs

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

This example shows a parallel job workflow where the `build` and `test` jobs run in parallel to save time. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with parallel, sequential, and manual approval workflows.

## Sample Configuration with Sequential Workflow

Following is a sample 2.0 `.circleci/config.yml` file.

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
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - node_modules
  test:
    docker:
      - image: circleci/node:4.8.2-jessie
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: Test
          command: npm test
      - run:
          name: Generate code coverage
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

This example shows a sequential workflow with the `test` job configured to run only on the master branch. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with parallel, sequential, and manual approval workflows.

## Sample Configuration with Fan-in/Fan-out Workflow

Following is a sample configuration for a Fan-in/Fan-out workflow. Refer to [the complete demo repo on GitHub](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) for details.

Note that since a job can only run when its dependencies are satisfied it transitively requires the dependencies of all upstream jobs, this means only the immediate upstream dependencies need to be specified in the `requires:` blocks.

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
          name: Run tests
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
          name: Precompile assets
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
          name: Deploy Master to Heroku
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

## Sample Configuration with Multiple Executor Types (macOS + Docker)

It is possible to use multiple [executor types](https://circleci.com/docs/2.0/executor-types/) in the same workflow. In the following example each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

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
          name: Fetch CocoaPods Specs
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: Install CocoaPods
          command: pod install --verbose

      - run:
          name: Build and run tests
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

See the [Example Public Repos]({{ site.baseurl }}/2.0/example-configs/) document for a list of public projects that use CircleCI.