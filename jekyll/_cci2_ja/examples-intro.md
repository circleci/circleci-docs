---
layout: classic-docs
title: "サンプル"
short-title: "サンプル"
description: "CircleCI 2.0 サンプルの紹介"
categories: [migration]
order: 1
---


CircleCI を使用して、Linux、Android、iOS 上で動作するアプリケーションをビルド、テスト、およびデプロイすることができます。 以下のスニペットでは、各プラットフォーム用にジョブの設定をカスタマイズする方法に重点を置いて解説しています。 1つの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで、複数のプラットフォーム上で動作するジョブを設定することも可能です。

## Linux と Docker

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # プライマリコンテナは、最初にリストしたイメージのインスタンスです。 ジョブのコマンドは、このコンテナ内で実行されます。
    docker:
      - image: circleci/node:4.8.2-jessie
    # セカンダリコンテナは、2番目にリストしたイメージのインスタンスです。プライマリコンテナ上に公開されているポートをローカルホストで利用できる共通ネットワーク内で実行されます。
      - image: mongo:3.4.4-jessie
    steps:
      - checkout
      - run:
          name: npm を更新
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: npm wee をインストール
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - node_modules
```

{% endraw %}

## Linux と Machine

**メモ：**将来の料金改定では、Machine の使用に追加料金が必要になる可能性があります。

デフォルトのマシンイメージを使用して Machine Executor を使用するには、`.circleci/config.yml` で machine キーを true に設定します。

```yaml
version: 2
jobs:
  build:
    machine: true
```

## Android

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: circleci/android:api-25-alpha
    environment:
      JVM_OPTS: -Xmx3200m
    steps:
      - checkout
      - restore_cache:
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
#      - run:
#         name: Chmod パーミッション # Gradlew Dependencies のパーミッションが失敗する場合は、これを使用します。
#         command: sudo chmod +x ./gradlew
      - run:
          name: 依存関係をダウンロード
          command: ./gradlew androidDependencies
```

{% endraw %}

## iOS

    jobs:
      build-and-test:
        macos:
          xcode: "9.3.0"
        steps:
          ...
          - run:
              name: テストを実行
              command: fastlane scan
              environment:
                SCAN_DEVICE: iPhone 6
                SCAN_SCHEME: WebTests



## 関連項目

上記のサンプルで使用されている Executor タイプの詳細については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。
