---
layout: classic-docs
title: "サンプル"
short-title: "サンプル"
description: "CircleCI 2.0 サンプルの紹介"
categories:
  - migration
order: 1
version:
  - Cloud
  - Server v2.x
---


CircleCI を使用して、Linux、Android、iOS 上で動作するアプリケーションをビルド、テスト、およびデプロイすることができます。 以下のスニペットでは、各プラットフォーム用にジョブの構成をカスタマイズする方法に重点を置いて解説しています。 1 つの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで、複数のプラットフォーム上で動作するジョブを構成することも可能です。

## Linux と Docker
{: #linux-with-docker }

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # プライマリ コンテナは、最初にリストしたイメージのインスタンスです。 The job's commands run in this container.
    docker:
      - image: circleci/node:4.8.2-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4-jessie
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
```

{% endraw %}

## Linux と Machine
デフォルトのマシン イメージを使用して Machine Executor を使用するには、`.circleci/config.yml` で machine キーを true に設定します。

**メモ:** 今後の料金改定により、Machine の使用に追加料金が必要になる可能性があります。

To use the machine executor with the default machine image, set the machine key to true in `.circleci/config.yml`:

```yaml
version: 2
jobs:
  build:
    machine: true
```

## Android
上記のサンプルで使用されている Executor タイプの詳細については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/)を参照してください。

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
#         name: Chmod パーミッション # Gradlew Dependencies のパーミッションが失敗する場合は、これを使用します
#         command: sudo chmod +x ./gradlew
      - run:
          name: 依存関係のダウンロード
          command: ./gradlew androidDependencies
#         command: sudo chmod +x ./gradlew
      - run:
          name: 依存関係のダウンロード
          command: ./gradlew androidDependencies
#         command: sudo chmod +x ./gradlew
      - run:
          name: Download Dependencies
          command: ./gradlew androidDependencies
```

{% endraw %}

## iOS
{: #macos }
_The macOS executor is not currently available on self-hosted installations of CircleCI Server_

```
jobs:
  build-and-test:
    macos:
      xcode: "11.3.0"
    steps:
      ...
      - run:
          name: テストの実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

## 関連項目
{: #windows }

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor:
      name: win/default # executor type
      size: "medium" # resource class, can be "medium", "large", "xlarge", "2xlarge", defaults to "medium" if not specified

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

## See also
{: #see-also }

Learn more about the [executor types]({{ site.baseurl }}/2.0/executor-types/) used in the examples above.
