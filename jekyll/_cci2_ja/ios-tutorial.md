---
layout: classic-docs
title: iOS プロジェクトのチュートリアル
short-title: iOS プロジェクトのチュートリアル
categories:
  - platforms
description: CircleCI 2.0 上での iOS アプリケーションのセットアップ
order: 20
version:
  - Cloud
---

以下のセクションに沿って、CircleCI を使用して iOS アプリケーション プロジェクトのビルド、テスト、デプロイを自動化する方法について説明していきます。

* 目次
{:toc}

**メモ:** 「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)」や「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/hello-world-macos/)」も併せてご覧ください。

## 概要
{: #overview }
{:.no_toc}

iOS プロジェクトでは、fastlane Scan を使用して以下のようにテストを実行できます。

## 前提条件
サポートされるバージョンの一覧は、iOS アプリのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。
{:.no_toc}

- CircleCI にプロジェクトを追加します。 詳細については「[Hello World]({{ site.baseurl }}/ja/2.0/hello-world/)」を参照してください。
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1 つの共有スキームがあり、選択されたスキームにテスト アクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログ ボックスを開きます。![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## テストの実行
たとえば Homebrew から依存関係をインストールする場合は、`run` ステップを使用して適切なコマンドを指定します。

以下の短い `run` 構文例のように、`run` ステップを使用してテストを実行することもできます。

```
jobs:
  build-and-test:
    macos:
      xcode: "9.3.0"
    steps:
      ...
      - run:
          name: テストの実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

詳細については「[iOS プロジェクトのコード署名の設定]({{ site.baseurl }}/ja/2.0/ios-codesigning/)」を参照してください。

## コード署名と証明書
[fastlane](https://fastlane.tools) の [gym](https://github.com/fastlane/fastlane/tree/master/gym) と [deliver](https://github.com/fastlane/fastlane/tree/master/deliver) を使用して CircleCI でアプリケーションをデプロイするには、識別子、リリースを実行するブランチまたはパターン、および複数のコマンドを指定してリリースを実行します。

iOS プロジェクトの高度な構成の詳細については、[macOS 上の iOS アプリケーションのテストに関するドキュメント](https://circleci.com/ja/docs/2.0/testing-ios/)を参照してください。

CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、および署名する例については、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。

## 依存関係のインストール
{: #installing-dependencies }

To install dependencies from homebrew, for example, use a `run` step with the appropriate command:

```
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

The `run` step is also used to run your tests as in the following example of the short form `run` syntax:

```
    steps:

      - run: fastlane scan
```

### デプロイ
{: #deployment }
{:.no_toc}

To deploy your application with CircleCI using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools) specify an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

```
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
```

## 高度な構成
{: #advanced-configuration }

See the [Testing iOS Applications on macOS](https://circleci.com/docs/2.0/testing-ios/) document for more advanced details on configuring iOS projects.

## GitHub 上のサンプル アプリケーション
{: #example-application-on-github }

アプリケーションで `xcodebuild` を使用するジョブとステップを記述する方法、CircleCI 環境でコード署名とプロビジョニング プロファイルをセットアップする方法、および fastlane を使用してデプロイする方法について、順番に説明していきます。
