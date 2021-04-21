---
layout: classic-docs
title: "2.0 config.yml のサンプル ファイル"
short-title: "2.0 config.yml のサンプル ファイル"
description: "2.0 config.yml のサンプル ファイル"
categories:
  - migration
order: 2
---

[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) のサンプル ファイルをご紹介します。

* 目次
{:toc}

CircleCI 2.0 の設定ファイルには、`version: 2` の新しいキーが導入されました。 この新しいキーにより、1.0 でのビルドを継続しながら 2.0 を使用できます。つまり、あるプロジェクトでは 1.0 をそのまま使用し、別のプロジェクトでは 2.0 を使用できます。 `jobs`、`steps`、`workflows` のキーによって、制御性が向上し、実行の各段階でのステータス取得が可能になることで、フィードバックの報告頻度を高められます。 詳細については、[ジョブとステップ]({{ site.baseurl }}/2.0/jobs-steps/)、および[ワークフロー]({{ site.baseurl }}/2.0/workflows/)に関する各ドキュメントを参照してください。

<!-- Unsure this paragraph should still and mention 1.0 builders ... also should probably mention 2.1-->

個々の構成キーの詳細については、[構成のリファレンス ]({{ site.baseurl }}/2.0/configuration-reference/)を参照してください。

## 並列ジョブの構成例

2.0 `.circleci/config.yml` ファイルの例を以下に示します。

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

上記は並列ジョブワークフローの例です。処理時間を短縮するために、`build` ジョブと `test` ジョブを並列で実行しています。 並列実行、順次実行、および手動承認のワークフローによってジョブをオーケストレーションする詳しい方法については、[ワークフローに関するドキュメント]({{ site.baseurl }}/2.0/workflows)を参照してください。

## 順次実行ワークフローの構成例

2.0 `.circleci/config.yml` ファイルの例を以下に示します。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # プライマリ コンテナは、最初にリストしたイメージのインスタンスです。 ジョブのコマンドは、このコンテナ内で実行されます。
    docker:
      - image: circleci/node:4.8.2-jessie
    # セカンダリ コンテナは、2 番目にリストしたイメージのインスタンスです。プライマリ コンテナ上に公開されているポートをローカルホストで利用できる共通ネットワーク内で実行されます。
      - image: mongo:3.4.4-jessie
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
      - image: mongo:3.4.4-jessie
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

上記は、`test` ジョブが master ブランチでのみ実行されるように構成された順次実行ワークフローの例です。 並列実行、順次実行、および手動承認のワークフローによってジョブをオーケストレーションする詳しい方法については、[ワークフローに関するドキュメント]({{ site.baseurl }}/2.0/workflows)を参照してください。

## ファンイン・ファンアウト ワークフローの構成例

ファンイン/ファンアウト ワークフローの構成例を以下に示します。 詳細については、[GitHub での完全なデモ リポジトリ](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)を参照してください。

ジョブはその依存関係が満たされている場合にのみ実行できるため、波及するすべてのアップストリーム ジョブの依存関係が必要になることに注意してください。また、そのため、`requires:` ブロック内に指定する必要があるのは隣接するアップストリーム依存関係だけです。

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
          name: Heroku への master のデプロイ
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

## 複数の Executor タイプを含む構成例 (macOS と Docker)

同じワークフロー内で、複数の [Executor タイプ](https://circleci.com/ja/docs/2.0/executor-types/)を使用することができます。 以下の例では、プッシュされる iOS プロジェクトは macOS 上でビルドされ、その他の iOS ツール ([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker で実行されます。

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
          name: CocoaPods Spec のフェッチ
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
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

## 関連項目
{:.no_toc}

CircleCI を使用するパブリックのプロジェクトの一覧については、[パブリック リポジトリの例]({{ site.baseurl }}/2.0/example-configs/)を参照してください。