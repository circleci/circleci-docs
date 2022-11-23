---
layout: classic-docs
title: "CircleCI での macOS アプリケーションの設定"
description: "CircleCI での最初の macOS プロジェクト"
contentTags:
  platform:
    - クラウド
---

This document describes how to get started with CI/CD using a **macOS execution environment** on CircleCI. If you need to learn the basics of CircleCI, see the [getting started guide]({{site.baseurl }}/getting-started). You may also want to visit the documentation for [testing and setting up iOS projects]({{ site.baseurl}}/testing-ios/).

## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要
{: #overview-of-the-macos-executor }

macOS 実行環境は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプル アプリケーションをセットアップする必要があります。

## サンプルアプリケーション
{: #example-application }

このサンプルアプリケーションは、シンプルな mac アプリです。 The app runs a 5 minute timer and contains a single unit test. Real-world applications will be far more complex. This app simply serves as an introduction to the macOS execution environment.

In this example app, CircleCI is configured to help with the following:

- Run tests using XCode on the macOS virtual machine whenever we push a change to the repository.
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

サンプル アプリケーションのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェック アウトできます。

下記のサンプル設定ファイルのコードを実行しテストする場合は、GitHub からサンプルアプリケーションをフォークまたは複製する必要があるのでご注意ください。 このサンプル設定ファイルが、すべての Xcode プロジェクトで動作するとは限りません。

## サンプル設定ファイル
{: #example-configuration-file }

このアプリケーションでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

For a full list of supported Xcode versions, see the [using macOS](/docs/using-macos/#supported-xcode-versions) page.

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 14.1.0 # indicate our selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build: 
    macos:
      xcode: 14.1.0 # indicate our selected version of Xcode
    steps: 
      - checkout
      - run:
          # build our application
          name: Build Application
          command: xcodebuild
      - run:
          # compress Xcode's build output so that it can be stored as an artifact
          name: Compress app for storage
          command: zip -r app.zip build/Release/circleci-demo-macos.app
      - store_artifacts: # store this build output. Read more: https://circleci.com/docs/2.0/artifacts/
          path: app.zip
          destination: app

workflows:
  test_build:
    jobs:
      - test
      - build:
          requires:
            - test
```

上記の例の `.circleci/config.yml` には下記が含まれています。

- Specify an [`executor`](/docs/configuration-reference/#macos)
- Pull code using the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) key
- Run tests with Xcode
- Build the application
- Compress the application and store it using the [`store_artifacts`]({{ site.baseurl }}/configuration-reference/#store_artifacts) key.

`.circleci/config.yml` ファイルの詳細については、[設定ファイルのリファレンス]({{site.baseurl}}/ja/configuration-reference/)を参照してください。


## 次のステップ
{: #next-steps }

macOS Executor は iOS アプリケーションのテストとビルドに広く使用されていますが、継続的インテグレーションの設定が複雑になる可能性があります。 iOS アプリケーションのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/ja/testing-ios)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/ja/ios-codesigning)
