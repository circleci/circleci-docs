---
layout: classic-docs
title: "iOS プロジェクトの 1.0 から 2.0 への移行"
short-title: "iOS プロジェクトの 1.0 から 2.0 への移行"
description: "iOS プロジェクトを CircleCI 1.0 から 2.0 へ移行する方法"
categories: [platforms]
order: 10
---

ここでは、iOS プロジェクトを CircleCI 1.0 から 2.0 へ移行するうえでのガイドラインについて説明します。

* 目次
{:toc}

## 概要

macOS 向け CircleCI 2.0 のリリースに伴い、2.0 プラットフォームで強化された以下の機能が iOS プロジェクトで利用できるようになりました。

* [Workflows](https://circleci.com/docs/ja/2.0/workflows/)：新しいシンプルなキーセットを設定して、ジョブやステップをきわめて柔軟に組織化できます。 迅速なフィードバック、再実行までの時間短縮、リソースの最適化が可能になるため、開発をスピードアップできます。

* [高度なキャッシュ](https://circleci.com/docs/ja/2.0/caching/)：実行ごとにファイルをキャッシュして、ビルドの処理を高速化します。制御しやすいキーと、ジョブ全体のキャッシュの保存・復元ポイントをきめ細かく指定できるキャッシュオプションが提供されています。 制御可能なキーを使用して、実行ごとにあらゆるファイルをキャッシュできます。

## 2.0 iOS プロジェクト設定のサンプル

この設定ファイルのサンプルは、CircleCI 2.0 上のほぼすべての iOS プロジェクトで正常に動作します。

```yaml
# .circleci/config.yml

# コンフィグのバージョンを指定します (バージョン 2 が最新)
version: 2

# 現在のプロジェクトのジョブを定義します
jobs:
  build-and-test:

    # 使用する Xcode バージョンを指定します
    macos:
      xcode: "8.3.3"
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output

    # プロジェクトのビルドに必要なステップを定義します
    steps:

      # VCS プロバイダーからコードを取得します

      - checkout

      # CocoaPods Specs を HTTPS でダウンロードし (Git よりも高速)、
      # CocoaPods をインストールします

      - run:
          name: CocoaPods をインストール
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
            pod install

      # テストを実行します

      - run:
          name: テストを実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

      - store_test_results:
          path: output/scan
      - store_artifacts:
          path: output

  deploy:
    macos:
      xcode: "8.3.3"
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output

    steps:

      - checkout

      # fastlane match を使用してコード署名を設定します

      - run:
          name: コード署名を設定
          command: fastlane match development --readonly

      # アプリケーションのリリースバージョンをビルドします

      - run:
          name: IPA をビルド
          command: fastlane gym

      # ジョブのアーティファクトに IPA ファイルを格納します

      - store_artifacts:
          path: output/MyApp.ipa

      # デプロイします

      - run:
          name: App Store にデプロイ
          command: fastlane spaceship

workflows:
  version: 2
  build-and-deploy:
    jobs:

      - build-and-test
      - deploy:
          requires:
            - build-and-test
          filters:
            branches:
              only: master
```

## ベストプラクティス

ビルドの一貫性を維持するために、2.0 の `.circleci/config.yml` ファイルを CircleCI の iOS プロジェクトにプッシュする前に、Gemfile を追加し、fastlane match を使用してコード署名を設定しておくことをお勧めします。

### Gemfile
{:.no_toc}

iOS プロジェクトに Gemfile をまだ追加していない場合は、追加することをお勧めします。 Gemfile をチェックインし、Bundler を使用して gem をインストールおよび実行することで、最新バージョンの fastlane と CocoaPodsをビルドで使用できるようになります。

Gemfile の例を以下に示します。

    # Gemfile

    source 'https://rubygems.org'
    gem 'fastlane'
    gem 'cocoapods'


### fastlane match によるコード署名の設定
{:.no_toc}

CircleCI 2.0 で iOS プロジェクトのコード署名を設定する手順については、\[コード署名に関するガイド\]({{ site.baseurl}}/ja/2.0/ios-codesigning)を参照してください。

## 2.0 設定ファイルの作成

以下のセクションでは、iOS プロジェクトの 2.0 設定構文の例を示します。 CircleCI では iOS プロジェクト向けの部分的なコンフィグ変換機能も提供しています。詳細については「\[1.0 から 2.0 への config-translation エンドポイントを使用する\]({{ site.baseurl}}/ja/2.0/config-translation)」を参照してください。 1.0 プロジェクトに `circle.yml` が**ない**場合は、1.0 プロジェクトから初期コンフィグファイルを生成するスクリプトを [CircleCI Config Generator](https://github.com/CircleCI-Public/circleci-config-generator/blob/master/README.md) から入手してください。

### ジョブ名と Xcode バージョン
{:.no_toc}

2.0 `.circleci/config.yml` ファイル冒頭の数行で、ジョブの名前と、使用する Xcode のバージョンを指定します。

    version: 2
    jobs:
      build-and-test:
        macos:
          xcode: "8.3.3"
    ...
      deploy:
        macos:
          xcode: "8.3.3"
    ...


### ビルドステップキー
{:.no_toc}

トップレベルの `steps` キーには、特定のジョブで実行されるすべてのビルドステップが含まれます。

    jobs:
      build-and-test:
        steps:
          - ...
          - ...


利用できるステップの種類は「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」で確認できます。 **メモ：**macOS のビルドでは Docker がサポートされていません。

### プロジェクトコードのチェックアウト
{:.no_toc}

コードのチェックアウトのステップは、`steps` の下に最初に記述される項目の 1つです。

    jobs:
      build-and-test:
        steps:
          - checkout


### Bundler でインストールされた RubyGems のキャッシュ
{:.no_toc}

CircleCI 2.0 では、*キャッシュキー*に基づいてキャッシュの保存と復元を行います。 ここでは `Gemfile.lock` の内容に基づいて RubyGems をキャッシュする方法を示します。

{% raw %}

```yaml
jobs:
  build-and-deploy:
    environment:
      BUNDLE_PATH: vendor/bundle  # gem をインストールし、キャッシュで使用するためのパス
    steps:
      # 他のステップをここに追加します
      - restore_cache:
          keys:
          - v1-gems-{{ checksum "Gemfile.lock" }}
          # 完全に一致するものが見つからない場合は、フォールバックして最新のキャッシュを使用します
          - v1-gems-
      # gem をインストールします
      - run:
          name: バンドルインストール
          command: bundle check || bundle install
          environment:
            BUNDLE_JOBS: 4
            BUNDLE_RETRY: 3
      - save_cache:
          key: v1-gems-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle
```

{% endraw %}

Gemfile.lock の内容を変更するたびに、新しいキャッシュが作成されます。 キャッシュキーと `checksum` 以外のキーオプションの詳細については、[こちらのドキュメント]({{ site.baseurl }}/ja/2.0/caching/)を参照してください。

### CocoaPods のインストール
{:.no_toc}

[CocoaPods](https://cocoapods.org/) を既にリポジトリにチェック*イン*している場合、依存関係は正しくピックアップされるため、この手順を行う必要はありません。 一方、CocoaPods がリポジトリに含まれて*いない*場合は、CocoaPods を `.circleci/config.yml` にインストールする必要があります。

`pod install` を使用して CocoaPods をインストールすると、CocoaPods Specs リポジトリ全体がフェッチされるため、その分貴重なビルドの時間が奪われてしまいます。 CircleCI では `pod install` の実行を高速化してビルド時間を短縮できるよう、Git ではなく HTTPS で CocoaPods Specs をキャッシュする方法が利用できます。

HTTPS を使用して CocoaPods Specs をフェッチしてから、`pod install` を実行するコンフィグスニペットの例を以下に示します。

{% raw %}
jobs:
      build-and-deploy:
        steps:
          ...

          - run:
              name: CocoaPods をインストール
              command: |
                curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
                pod install
{% endraw %}

Pods をコンフィグにインストールせずに、リポジトリにチェックインする方法については、[こちらの CocoaPods ガイド](https://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)を参照してください。

### テストの実行
{:.no_toc}

[fastlane Scan](https://github.com/fastlane/fastlane/tree/master/scan) を使用して、以下のようにテストを実行できます。

```yaml
jobs:
  build-and-deploy:
    steps:
      # 他のステップをここに追加します
      - run:
          name: テストを実行
          command: bundle exec fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests
```

`bundle exec fastlane scan` コマンドはカスタムのテストコマンドに置き換えることができます。このコマンドに渡す環境変数も変更可能です。 なお、テストコマンドが複数行にわたる場合は、1つのステップ内に複数のコマンドを記述できます。

    jobs:
      build-and-deploy:
        steps:
          ...
          - run:
              name: テストを実行
              command: |
                make build
                make test


### アーティファクト、テスト結果、診断ファイルの保存
{:.no_toc}

CircleCI 2.0 ではジョブのアーティファクトが自動的に収集されません。{% comment %} TODO: Job {% endcomment %}ビルドで生成されるファイルに CircleCI アプリケーションからアクセスしたい場合は、`store_artifacts` ステップを使用して、該当のファイルを明示的に収集しておく必要があります。

CircleCI アプリケーションで XML テストの結果を表示させるには、`.circleci/config.yml` ファイルに `store_test_results` ステップを追加します。

また、ログをアーティファクトとして保存するには、以下の例に示すように `store_artifacts` ステップを使用します。

    jobs:
      build-and-deploy:
        steps:
          ...
          - store_test_results:
              path: output/scan
          - store_artifacts:
              path: output


上記のステップの詳細については、「[ビルドアーティファクトの保存]({{ site.baseurl}}/ja/2.0/artifacts/)」と「[テストメタデータの収集]({{ site.baseurl}}/ja/2.0/collect-test-data/)」を参照してください。

### Workflows を使用したデプロイ
{:.no_toc}

2.0 では Workflows を利用できるため、アプリケーションのデプロイに関するすべてのコマンドを独自のジョブに抽出することをお勧めします。

```yaml
jobs:
  # 他のジョブをここに追加します
  deploy:
    macos:
      xcode: 8.3.3
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output

    steps:

      - checkout

      # fastlane match を使用してコード署名を設定します

      - run:
          name: コード署名を設定
          command: fastlane match development --readonly

      # アプリケーションのリリースバージョンをビルドします

      - run:
          name: IPA をビルド
          command: bundle exec fastlane gym

      # ビルドアーティファクトに IPA ファイルを格納します

      - store_artifacts:
          path: output/MyApp.ipa
          destination: ipa

      # デプロイします

      - run:
          name: App Store にデプロイ
          command: bundle exec fastlane spaceship
```

上記のデプロイジョブの例では、Xcode のバージョンを指定し、リリースバージョンを生成するコマンドを追加し、それをアーティファクトとして保存した後で、App Store に送信しています。

以下のスニペットでは、デプロイジョブを実行する条件を指定した Workflows セクションを `.circleci/config.yml` ファイルに追加しています。

    version: 2
    jobs:
    ...
    workflows:
      version: 2
      build-and-deploy:
        jobs:
          - build-and-test
          - deploy:
              requires:
                - build-and-test
              filters:
                branches:
                  only: master


上記の例では、CircleCI はリポジトリへのプッシュごとに `build-and-test` ジョブを実行し、`build-and-test` ジョブが正常に完了した後に初めて master ブランチでデプロイジョブを実行します。

Workflows の他の使用例については、[ワークフローの組織化に関するドキュメント]({{ site.baseurl }}/ja/2.0/workflows/)を参照してください。

## GitHub 上のサンプルアプリケーション

CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
