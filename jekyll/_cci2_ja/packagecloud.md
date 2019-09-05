---
layout: classic-docs
title: packagecloud へのパッケージのパブリッシュ
categories:
  - how-to
description: CircleCI を使用して packagecloud にパッケージをパブリッシュする方法
---

[packagecloud](https://packagecloud.io) は、ホスティングされているパッケージリポジトリサービスです。 packagecloud を使用すると、事前設定なしで npm、Maven (Java)、Python、apt、yum、RubyGem の各リポジトリをホスティングすることができます。

* 目次
{:toc}

## 環境変数の設定

### `$PACKAGECLOUD_TOKEN` の設定

CircleCI のプロジェクト設定で、packagecloud API トークンの値を含む環境変数を `PACKAGECLOUD_TOKEN` という名前で作成します。 この環境変数は、packagecloud API で直接認証する場合、または packagecloud CLI を使用して認証する場合に使用されます。

packagecloud CLI は、リポジトリとやり取りするときに、システムから自動的にこの環境変数を読み取ります。

なお、機密性のある環境変数を Git にチェックインした状態で維持する必要があり、変数が暗号化されているという場合には、「[circleci/encrypted-files](https://github.com/circleci/encrypted-files)」に概要が記載されているプロセスに従ってください。

{:.no_toc}

### packagecloud:enterprise 用の `$PACKAGECLOUD_URL` の設定

***packagecloud:enterprise をお使いの方は、`$PACKAGECLOUD_URL` のみを設定してください***

これは、packagecloud:enterprise を使用している場合にのみ行う設定です。 CircleCI のプロジェクト設定で、`$PACKAGECLOUD_URL` 環境変数に packagecloud:enterprise のインストール用 URL を設定します。

## packagecloud CLI のインストール

CircleCI で packagecloud CLI を使用するには、RubyGems を使用してインストールします。そのためには、`.circleci/config.yml` でパッケージをデプロイするように設定したジョブの下に、以下の `run` ステップを追加します。

    - run:
       name: packagecloud CLI をインストール
       command: gem install package_cloud


CLI は、自動的に `$PACKAGECLOUD_TOKEN` 環境変数を使用して、packagecloud サービスに対して認証を行います。

### 依存関係のキャッシュの使用

後続のビルドのためにこの依存関係をキャッシュするには、`Gemfile` に `package_cloud` gem を追加して、「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」に記載された CircleCI のガイダンスに従ってください。

## packagecloud CLI でのパッケージのプッシュ

ビルドプロセスはパッケージのタイプによって異なりますが、パッケージを packagecloud リポジトリにプッシュする方法はきわめて単純です。 CircleCI のビルドからパッケージをリポジトリに追加するには、ユーザーの `deploy` 設定に packagecloud CLI を使用するステップを追加します。

以下に `.circleci/config.yml` ファイル全体の例を示します。ここでは、Git リポジトリをチェックアウトし、`make` タスク (パッケージをビルドするように設定した任意のコマンド) を実行してから、パッケージを packagecloud リポジトリにデプロイします。

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/ruby:2.3-jessie
jobs:
  build:
    <<: *defaults
    steps:
      - checkout
      - run:
          name: パッケージをビルド
          command: make
      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: packagecloud CLI をインストール
          command: gem install package_cloud
      - run:
          name: deb パッケージをプッシュ
          command: package_cloud push example-user/example-repo/debian/jessie debs/packagecloud-test_1.1-2_amd64.deb
workflows:
  version: 2
  package-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
```

## `npm` パッケージのデプロイ

CircleCI ユーザーは、packagecloud でホスティングされている npm レジストリにパッケージを直接デプロイできます。

### テストジョブの設定

このジョブは、NodeJS プロジェクト内でプロジェクトコードを取り出し、その依存関係をインストールし、さらにテストを実行します。

```yaml
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします
          - v1-dependencies-

      - run: npm install
      - run:
          name: テストを実行
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
```

### デプロイジョブの設定

次にデプロイジョブを設定します。 このジョブは、packagecloud npm リポジトリに対して認証およびパブリッシュを行います。

```yaml
jobs:
...
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: レジストリの URL を設定
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: レジストリで認証
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: パッケージをパブリッシュ
          command: npm publish
```

* *レジストリの URL を設定*：このコマンドで、`npm` CLI によって使用される URL をレジストリに設定します。
* *レジストリで認証*：`npm` CLI によって使用される `authToken` に、プロジェクト設定で設定されている環境変数を設定します。
* *パッケージをパブリッシュ*：packagecloud 上で設定された npm レジストリにパッケージをパブリッシュします。

packagecloud npm レジストリの URL の形式を以下に示します。

    https://packagecloud.io/:username/:repo_name/npm/


`.circleci/config.yml` の全体は以下のようになります。

```yaml
version: 2
defaults: &defaults
  working_directory: ~/repo
  docker:
    - image: circleci/node:8.9.1
jobs:
  test:
    <<: *defaults
    steps:
      - checkout

      - restore_cache:
          keys:
          - v1-dependencies-.
          # 正確な一致が見つからない場合は、最新のキャッシュの使用にフォールバックします
          - v1-dependencies-

      - run: npm install
      - run:
          name: テストを実行
          command: npm test

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-

      - persist_to_workspace:
          root: ~/repo
          paths: .
  deploy:
    <<: *defaults
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          name: レジストリの URL を設定
          command: npm set registry https://packagecloud.io/example-user/example-repo/npm/
      - run:
          name: レジストリで認証
          command: echo "//packagecloud.io/example-user/example-repo/npm/:_authToken=$PACKAGECLOUD_TOKEN" > ~/repo/.npmrc
      - run:
          name: パッケージをパブリッシュ
          command: npm publish
workflows:
  version: 2
  test-deploy:
    jobs:
      - test
      - deploy:
          requires:
            - test
```

workflows セクションは、`test` ジョブと `deploy` ジョブを連結して、ビルドプロセス内の連続したステップにします。

packagecloud への npm パッケージのパブリッシュの詳細については、CircleCI のブログ記事「[Publishing npm Packages Using CircleCI 2.0 (CircleCI 2.0 を使用した npm パッケージのパブリッシュ)](https://circleci.com/blog/publishing-npm-packages-using-circleci-2-0/)」をご覧ください。

## packagecloud API の使用方法

packagecloud には、パッケージリポジトリを管理するための堅牢な API も用意されています。 API の詳細、パッケージをアップロードおよび削除する方法、複数のリポジトリにプロモートする方法については、[packagecloud API](https://packagecloud.io/docs/api) をご確認ください。

{:.no_toc}

## 関連項目

[アーティファクトの保存とアクセス]({{ site.baseurl }}/2.0/artifacts/)
