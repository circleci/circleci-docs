---
layout: classic-docs
title: iOS プロジェクトのチュートリアル
short-title: iOS プロジェクトのチュートリアル
categories:
  - プラットフォーム
description: CircleCI 上での iOS アプリケーションの設定
order: 20
version:
  - クラウド
---

This document describes how to automate builds, testing, and deployment of an iOS application project with CircleCI.

**注:** [iOS のテスト]({{site.baseurl}}/ja/testing-ios/)や [macOS での入門ガイド]({{site.baseurl}}/ja/hello-world-macos/)も併せてご覧ください。

## 概要
{: #overview }

アプリケーションで `xcodebuild` を使用するジョブとステップを記述する方法、CircleCI 環境でコード署名とプロビジョニング プロファイルをセットアップする方法、および fastlane を使用してデプロイする方法について、順番に説明していきます。

## 前提条件
{: #prerequisites }
{:.no_toc}

- CircleCI にプロジェクトを追加します。詳細については「[Hello World]({{site.baseurl}}/ja/hello-world/)」を参照してください。
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1 つの共有スキームがあり、選択されたスキームにテスト アクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログ ボックスを開きます。![Xcode Scheme Selector]({{site.baseurl}}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ]({{site.baseurl}}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## テストの実行
{: #running-tests }

詳細については「[iOS プロジェクトのコード署名の設定]({{ site.baseurl }}/ja/2.0/ios-codesigning/)」を参照してください。

```yml
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    steps:
      ...
      - run:
          name: テストの実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests
```

サポートされるバージョンの一覧は、iOS アプリのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{site.baseurl}}/ja/using-macos/#supported-xcode-versions)」セクションで確認してください。

## コード署名と証明書
{: #code-signing-and-certificates }

詳細については「[iOS プロジェクトのコード署名の設定]({{site.baseurl}}/ja/ios-codesigning/)」を参照してください。

カスタムツールを使用したり、ご自身のスクリプトを実行するためにビルドプロセスをさらにカスタマイズする場合は、`config.yml` ファイルを使用します。カスタマイズの詳細については [2.0 config.yml の設定例]({{ site.baseurl }}/ja/sample-config/)を参照してください。

## 依存関係のインストール
{: #installing-dependencies }

たとえば Homebrew から依存関係をインストールする場合は、`run` ステップを使用して適切なコマンドを指定します。

```yml
    steps:

      - run:
          name: Homebrew 依存関係のインストール
          command: brew install yarn

      - run:
          name: Node 依存関係のインストール
          command: yarn install
```

## テストの実行
{: #running-tests }

以下の短い `run` 構文例のように、`run` ステップを使用してテストを実行することもできます。

```yml
    steps:

      - run: fastlane scan
```

### デプロイ
{: #deployment }
{:.no_toc}

[fastlane](https://fastlane.tools) の [gym](https://github.com/fastlane/fastlane/tree/master/gym) と [deliver](https://github.com/fastlane/fastlane/tree/master/deliver) を使用して CircleCI でアプリケーションをデプロイするには、識別子、リリースを実行するブランチまたはパターン、および複数のコマンドを指定してリリースを実行します。

```yml
version: 2.1
jobs:
  test:
    macos:
      xcode: 12.5.1
    steps:
      - checkout
      - run: fastlane scan
  deploy:
    macos:
      xcode: 12.5.1
    steps:
      - checkout
      - run:
          name: Deploy
          command: fastlane release_appstore
```

## 高度な設定
{: #advanced-configuration }

iOS プロジェクトの高度な設定の詳細については、[macOS 上の iOS アプリケーションのテストに関するドキュメント]({{site.baseurl}}/ja/testing-ios/)を参照してください。

## GitHub 上のサンプルアプリケーション
{: #example-application-on-github }

CircleCI  で fastlane を使用して iOS プロジェクトをビルド、テスト、および署名する方法は、[`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
