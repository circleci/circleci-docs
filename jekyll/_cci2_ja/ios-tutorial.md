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

以下のセクションに沿って、CircleCI を使用して iOS アプリケーション プロジェクトのビルド、テスト、デプロイを自動化する方法について説明していきます。

* 目次
{:toc}

**Note:** There is also documentation for [testing iOS]({{site.baseurl}}/testing-ios/) and [getting started on MacOS]({{site.baseurl}}/hello-world-macos/).

## 概要
{: #overview }
{:.no_toc}

アプリケーションで `xcodebuild` を使用するジョブとステップを記述する方法、CircleCI 環境でコード署名とプロビジョニングプロファイルを設定する方法、および fastlane を使用してデプロイする方法について、順番に説明していきます。

## 前提条件
{: #prerequisites }
{:.no_toc}

- Add your project to CircleCI, see [Hello World]({{site.baseurl}}/hello-world/).
- このチュートリアルは、対象のプロジェクト用の Xcode ワークスペースに少なくとも 1 つの共有スキームがあり、選択されたスキームにテスト アクションがあることを前提としています。 まだ共有スキームがない場合は、以下の手順に従って Xcode に共有スキームを追加してください。

1. プロジェクトの Xcode ワークスペースを開きます。
2. 下図のように、Scheme Selector を使用してスキームの管理ダイアログ ボックスを開きます。![Xcode Scheme Selector]({{site.baseurl}}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. スキームの管理ダイアログで、ビルドするスキームを選択し、[Shared (共有)] チェックボックスをオンにします。![スキームの管理ダイアログ]({{site.baseurl}}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. スキームをコミットし、プッシュします。

## テストの実行
{: #running-tests }

iOS プロジェクトでは、fastlane Scan を使用して以下のようにテストを実行できます。

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

Refer to [the Xcode version section]({{site.baseurl}}/using-macos/#supported-xcode-versions) of the iOS testing document for the complete list of supported versions.

## コード署名と証明書
{: #code-signing-and-certificates }

Refer to [the code signing doc]({{site.baseurl}}/ios-codesigning/) for details.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]({{ site.baseurl }}/sample-config/) document for customizations.

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

See the [Testing iOS Applications on macOS]({{site.baseurl}}/testing-ios/) document for more advanced details on configuring iOS projects.

## GitHub 上のサンプルアプリケーション
{: #example-application-on-github }

CircleCI  で fastlane を使用して iOS プロジェクトをビルド、テスト、および署名する方法は、[`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
