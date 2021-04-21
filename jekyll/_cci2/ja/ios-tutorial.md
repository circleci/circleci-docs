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

* TOC
{:toc}

**Note:** There is also documentation for [testing iOS]({{ site.baseurl}}/2.0/testing-ios/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## 概要
{:.no_toc}

アプリケーションで `xcodebuild` を使用するジョブとステップを記述する方法、CircleCI 環境でコード署名とプロビジョニング プロファイルをセットアップする方法、および fastlane を使用してデプロイする方法について、順番に説明していきます。

## 前提条件
{:.no_toc}

- Add your project to CircleCI, see [Hello World]({{ site.baseurl }}/2.0/hello-world/).
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1 つの共有スキームがあり、選択されたスキームにテスト アクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログ ボックスを開きます。![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## Running tests

iOS プロジェクトでは、fastlane Scan を使用して以下のようにテストを実行できます。

```
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    steps:
      ...
      - run:
          name: テストの実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

サポートされるバージョンの一覧は、iOS アプリのテストに関するドキュメントの「[サポートされている Xcode のバージョン]({{ site.baseurl }}/2.0/testing-ios/#サポートされている-xcode-のバージョン)」セクションで確認してください。

## Code signing and certificates

詳細については「[iOS プロジェクトのコード署名の設定]({{ site.baseurl }}/2.0/ios-codesigning/)」を参照してください。

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]({{ site.baseurl }}/2.0/sample-config/) document for customizations.

## Installing dependencies

たとえば Homebrew から依存関係をインストールする場合は、`run` ステップを使用して適切なコマンドを指定します。

```
    steps:
      - run:
          name: Homebrew 依存関係のインストール
          command: brew install yarn
      - run:
          name: Node 依存関係のインストール
          command: yarn install
```

## Running tests

以下の短い `run` 構文例のように、`run` ステップを使用してテストを実行することもできます。

```
    steps:
      - run: fastlane scan
```

### デプロイ
{:.no_toc}

[fastlane](https://fastlane.tools) の [gym](https://github.com/fastlane/fastlane/tree/master/gym) と [deliver](https://github.com/fastlane/fastlane/tree/master/deliver) を使用して CircleCI でアプリケーションをデプロイするには、識別子、リリースを実行するブランチまたはパターン、および複数のコマンドを指定してリリースを実行します。

```
version: 2.1
jobs:
  test:
    macos:
      xcode: 11.3.0
    steps:
      - checkout
      - run: fastlane scan
  deploy:
    macos:
      xcode: 11.3.0
    steps:
      - checkout
      - deploy:
          name: Deploy
          command: fastlane release_appstore

workflows:
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

## Advanced configuration

iOS プロジェクトの高度な構成の詳細については、[macOS 上の iOS アプリケーションのテストに関するドキュメント](https://circleci.com/ja/docs/2.0/testing-ios/)を参照してください。

## Example application on GitHub

CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、および署名する例については、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
