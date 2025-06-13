---
layout: classic-docs
title: "CircleCI での macOS アプリケーションの設定"
description: "CircleCI での最初の macOS プロジェクト"
contentTags:
  platform:
    - クラウド
---

CircleCI の **macOS 実行環境**で CI/CD を開始する方法について説明します。 CircleCI の基本事項について学びたい場合は、[入門ガイド]({{site.baseurl }}/getting-started)を参照してください。 また、[iOS プロジェクトのテストと設定]({{ site.baseurl}}/ja/testing-ios/)も併せてご覧ください。

## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要
{: #overview-of-the-macos-executor }

macOS 実行環境は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプルアプリをセットアップする必要があります。

## サンプルアプリ
{: #example-application }

このサンプルアプリは、シンプルな mac アプリです。 このアプリでは、5 分間のタイマーが実行され、単体テストが 1 つ含まれています。 実際のアプリはこれよりはるかに複雑です。 このアプリは単に mac OS 実行環境について説明するためのものです。

このサンプルアプリでは、CircleCI は以下を実現するように設定されています。

- リポジトリに変更をプッシュすると、常に mac OS の仮想マシンで XCode を使ってテストを実行する
- テストが正常に完了した後、コンパイルされたアプリをアーティファクトとして作成してアップロードする

このサンプルアプリのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェックアウトできます。

下記のサンプル設定ファイルのコードを実行しテストする場合は、GitHub からサンプルアプリをフォークまたは複製する必要があるのでご注意ください。 このサンプル設定ファイルが、すべての Xcode プロジェクトで動作するとは限りません。

## サンプル設定ファイル
{: #example-configuration-file }

このアプリでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

サポートされている Xcode のバージョンの全リストは、[macOS の使用](/docs/using-macos/#supported-xcode-versions)のページでご確認ください。

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 14.2.0 # indicate your selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build: 
    macos:
      xcode: 14.2.0 # indicate your selected version of Xcode
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

上記の例の `.circleci/config.yml` には以下が含まれています。

- [`executor`](/docs/configuration-reference/#macos) の指定
- [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリのビルド
- アプリの圧縮と [`store_artifacts`]({{ site.baseurl }}/ja/configuration-reference/#store_artifacts) キーによる保存

`.circleci/config.yml` ファイルの詳細については、[設定ファイルのリファレンス]({{site.baseurl}}/ja/configuration-reference/)を参照してください。


## 次のステップ
{: #next-steps }

macOS Executor は iOS アプリのテストとビルドに広く使用されていますが、継続的インテグレーションの設定が複雑になる可能性があります。 iOS アプリのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリのテスト]({{ site.baseurl }}/ja/testing-ios)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/ja/ios-codesigning)
