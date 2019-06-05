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

## 概要

{:.no_toc}

アプリケーションで `xcodebuild` を使用するジョブとステップを記述する方法、CircleCI 環境でコード署名とプロビジョニングプロファイルを設定する方法、および fastlane を使用してデプロイする方法について、順番に説明していきます。

## 前提条件

{:.no_toc}

- CircleCI にプロジェクトを追加します。詳細については「[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/)」を参照してください。
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1つの共有スキームがあり、選択されたスキームにテストアクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログボックスを開きます。![Xcode Scheme Selector]({{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ]({{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## テストの実行

iOS プロジェクトでは、fastlane Scan を使用して以下のようにテストを実行できます。

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



サポートされるバージョンの一覧は、iOS アプリのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#supported-xcode-versions)」セクションで確認してください。

## コード署名と証明書

詳細については「[iOS プロジェクトのコード署名の設定]({{ site.baseurl }}/ja/2.0/ios-codesigning/)」を参照してください。

カスタムツールの使用や独自スクリプトの実行を目的としてビルドプロセスをさらにカスタマイズする場合は、`config.yml` ファイルを使用します。カスタマイズの詳細については「[2.0 config.yml の設定例]({{ site.baseurl }}/ja/2.0/sample-config/)」を参照してください。

## 依存関係のインストール

たとえば Homebrew から依存関係をインストールする場合は、`run` ステップを使用して適切なコマンドを指定します。

        steps:
          - run:
              name: Homebrew 依存関係をインストール
              command: brew install yarn
          - run:
              name: Node 依存関係をインストール
              command: yarn install


## テストの実行

以下の短い `run` 構文例のように、`run` ステップを使用してテストを実行することもできます。

        steps:
          - run: fastlane scan


### デプロイ

{:.no_toc}

[fastlane](https://fastlane.tools) の [gym](https://github.com/fastlane/fastlane/tree/master/gym) と [deliver](https://github.com/fastlane/fastlane/tree/master/deliver) を使用して CircleCI でアプリケーションをデプロイするには、識別子、リリースを実行するブランチまたはパターン、および複数のコマンドを指定してリリースを実行します。

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

iOS プロジェクトの高度な設定の詳細については、[macOS 上の iOS アプリケーションのテストに関するドキュメント](https://circleci.com/docs/ja/2.0/testing-ios/)を参照してください。

## GitHub 上のサンプルアプリケーション

CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、および署名する例については、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
