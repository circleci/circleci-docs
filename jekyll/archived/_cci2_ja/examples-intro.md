---
layout: classic-docs
title: "サンプル"
short-title: "サンプル"
description: "CircleCI サンプルの紹介"
categories:
  - 移行
order: 1
version:
  - クラウド
  - Server v3.x
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
    # プライマリ コンテナは、最初にリストしたイメージのインスタンスです。 ジョブのコマンドはこのコンテナ内で実行されます。
    docker:
      - image: cimg/node:17.3.0
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
{: #linux-with-machine }

**メモ:** 今後の料金改定により、Machine の使用に追加料金が必要になる可能性があります。

デフォルトのマシン イメージを使用して Machine Executor を使用するには、`.circleci/config.yml` で machine キーを true に設定します。

```yaml
version: 2
jobs:
  build:
    machine: true
```

## Android
{: #android }

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: cimg/android:2021.10.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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
```

{% endraw %}

## macOS
{: #macos }
```yml
jobs:
  build-and-test:
    macos:
      xcode: "12.5.1"
    steps:
      ...
      - run:
          name: テストの実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

## Windows
{: #windows }

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@2.2.0 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

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

{:.tab.windowsblock.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

## 関連項目
{: #see-also }

上記のサンプルで使用されている Executor タイプの詳細については、[こちら]({{ site.baseurl }}/ja/2.0/executor-intro/)を参照してください。
