---
layout: classic-docs
title: iOS プロジェクトのチュートリアル
short-title: iOS プロジェクトのチュートリアル
categories:
  - platforms
description: CircleCI 2.0 上での iOS アプリケーションの設定
order: 20
---

ここでは、以下のセクションに沿って、CircleCI を使用して iOS アプリケーションプロジェクトのビルド、テスト、デプロイを自動化する方法について説明していきます。

- 目次
{:toc}

**Note:** There is also documentation for [testing iOS]({{ site.baseurl}}/2.0/testing-ios/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## 概要
{:.no_toc}

The following sections walk through how to write Jobs and Steps that use `xcodebuild` for this application, how to set up code signing and a provisioning profile in the CircleCI environment, and how to deploy with Fastlane.

## 前提条件
{:.no_toc}

- CircleCI にプロジェクトを追加します。詳細については「[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/)」を参照してください。
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1つの共有スキームがあり、選択されたスキームにテストアクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログボックスを開きます。![Xcode Scheme Selector]({{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ]({{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## テストの実行

For iOS projects, it is possible to run your tests with Fastlane Scan as follows:

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
    
    

Refer to [the Xcode version section]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) of the iOS testing document for the complete list of supported versions.

## コード署名と証明書

Refer to [the code signing doc]({{ site.baseurl }}/2.0/ios-codesigning/) for details.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]({{ site.baseurl }}/2.0/sample-config/) document for customizations.

## 依存関係のインストール

To install dependencies from homebrew, for example, use a `run` step with the appropriate command:

        steps:
          - run:
              name: Homebrew 依存関係をインストール
              command: brew install yarn
          - run:
              name: Node 依存関係をインストール
              command: yarn install
    

## テストの実行

The `run` step is also used to run your tests as in the following example of the short form `run` syntax:

        steps:
          - run: fastlane scan
    

### デプロイ
{:.no_toc}

To deploy your application with CircleCI using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools) specify an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

    version: 2
    jobs:
      test:
        macos:
          xcode: "9.3.0"
        steps:
          - checkout
          - run: fastlane scan
      deploy:
        macos:
          xcode: "9.3.0"
        steps:
          - checkout
          - deploy:
              name: デプロイ
              command: fastlane release_appstore
    
    workflows:
      version: 2
      test_release:
        jobs:
    
          - test
          - deploy:
              requires:
                test
              filters:
                branches:
                  only: release
    

## 高度な設定

See the [Testing iOS Applications on macOS](https://circleci.com/docs/2.0/testing-ios/) document for more advanced details on configuring iOS projects.

## GitHub 上のサンプルアプリケーション

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) for an example of how to build, test and sign an iOS project using Fastlane on CircleCI 2.0.