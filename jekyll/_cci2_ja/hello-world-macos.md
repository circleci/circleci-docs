---
layout: classic-docs
title: "CircleCI での macOS アプリケーションの設定"
description: "CircleCI での最初の macOS プロジェクト"
version:
  - クラウド
---

CircleCI の **macOS 実行環境**で継続的インテグレーションを開始する方法について説明します。 If you still need to get acquainted with CircleCI, it is recommended to checkout the [getting started guide]({{site.baseurl }}/getting-started). You may also wish to visit the documentation for [testing iOS]({{ site.baseurl}}/testing-ios/) and [an example iOS project]({{ site.baseurl }}/ios-tutorial/).

## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要
{: #overview-of-the-macos-executor }

macOS 実行環境 (`executor`) は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプル アプリケーションをセットアップする必要があります。

## サンプルアプリケーション
{: #example-application }

このサンプルアプリケーションは、シンプルな mac アプリです。 5分間のタイマーが実行され、単体テストが含まれています (このアプリは macOS 実行環境の説明に使用するためだけのものであり、 実際のアプリケーションははるかに複雑です)。

macOS 実行環境についての理解を深めていただければ、CircleCI を利用して以下のことが可能になります。

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

サンプル アプリケーションのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェック アウトできます。

下記のサンプル設定ファイルのコードを実行しテストする場合は、GitHub からサンプルアプリケーションをフォークまたは複製する必要があるのでご注意ください。 このサンプル設定ファイルが、すべての Xcode プロジェクトで動作するとは限りません。

## サンプル設定ファイル
{: #example-configuration-file }

このアプリケーションでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build:
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
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
      - store_artifacts: # store this build output. Read more: https://circleci.com/docs/artifacts/
          path: app.zip
          destination: app

workflows:
  test_build:
    jobs:
      - test
      - build:
        requires: # sequence the build job to run after test
          test
```

上記の例の `.circleci/config.yml` には下記が含まれています。

- Picking an [`executor`]({{ site.baseurl }}/configuration-reference/#docker) to use
- Pulling code via the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) key
- Xcode でのテストの実行
- アプリケーションのビルド
- Compressing our application and storing it with the [`store_artifacts`]({{ site.baseurl }}/configuration-reference/#store_artifacts) key.

You can learn more about the `.circleci/config.yml` file in the [Configuration Reference]({{site.baseurl}}/configuration-reference/).


## 次のステップ
{: #next-steps }

macOS Executor は iOS アプリケーションのテストとビルドに広く使用されていますが、継続的インテグレーションの設定が複雑になる可能性があります。 iOS アプリケーションのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ios-tutorial)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/ios-codesigning)
