---
layout: classic-docs
title: "iOS プロジェクトのコード署名のセットアップ"
short-title: "iOS プロジェクトのコード署名"
description: "iOS または Mac アプリのコード署名をセットアップする方法"
categories:
  - platforms
order: 40
version:
  - Cloud
---

CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名をセットアップするガイドラインを紹介します。

* 目次
{:toc}

## Basic configuration of iOS projects

このドキュメントは、iOS プロジェクトまたは Mac プロジェクトが CircleCI 2.0 上に正しく構築されていること、また Bundle と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

**Note:** CircleCI only officially supports Fastlane Match for codesigning. Other methods may be used, but are not guaranteed to work and are unsupported.

**Note:** Setting up code signing on CircleCI 2.0 using Fastlane Match requires **adding a User key** to your CircleCI project. Setting up code signing is quite different than it was in CircleCI 1.0. The 2.0 documentation has been updated to reflect that the CircleCI app is not used, only the config instructions below are used for code signing in 2.0.

CircleCI 2.0 上で iOS プロジェクトまたは Mac プロジェクトをまだ構成していない場合、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/2.0/testing-ios/)」で構成手順を確認できます。

## fastlane match のセットアップ

コード署名は、ユーザーのアプリおよび App Store ビルドのアドホック ディストリビューションを生成するように構成する必要があります。

[fastlane match](https://codesigning.guide/) は [fastlane ツール](https://fastlane.tools/)の 1 つであり、開発環境と CircleCI の両方でコード署名をシームレスに構成できます。 fastlane match は、ユーザーのすべてのコード署名キーとプロビジョニング プロファイルを GitHub リポジトリに格納し、必要なキーとプロファイルを 1 つのコマンドでダウンロードしてインストールします。

ユーザー リポジトリのルートで `bundle exec fastlane match init` を実行して、match リポジトリを構成する手順を実行します。 構成が完了したら、`bundle exec fastlane match development` を実行して、開発キーとプロファイルを生成してインストールします。次に `bundle exec fastlane match adhoc` を実行して、アドホック ディストリビューションのキーとプロファイルを生成してインストールします。

### Preparing your Xcode project for use with Fastlane Match
{:.no_toc}

match をセットアップする前に、ユーザーの Xcode プロジェクトのコード署名を以下のように構成していることを確認する必要があります。

* **[Build Settings (ビルド設定)] -> [Code Signing Style (コード署名スタイル)]** を *[Manual (手動)]* に設定
* **[Build Settings (ビルド設定)] -> [Development Team (開発チーム)]** を開発チーム ID に設定
* **[Build Settings (ビルド設定)] -> [Code Signing Identity (コード署名 ID)]** を以下のように設定 
  * デバッグ設定: *[iOS Developer (iOS 開発者)]*
  * リリース設定: *[iOS Distribution (iOS ディストリビューション)]*

アドホック ビルドに関する項目は以下のように設定します。

* **[Build Settings (ビルド設定)] -> [Provisioning Profile (Deprecated) (プロビジョニング プロファイル (非推奨))]** を *[Match AdHoc (Match アドホック)]* プロファイルに設定

### Adding Match to the Fastlane lane
{:.no_toc}

CircleCI では、ユーザー アプリのアドホック ビルドを生成するたびに fastlane match を実行する必要があります。専用のカスタム fastlane レーンを作成しておくと便利です。 以下のような fastlane を作成することをお勧めします。

**メモ:** `fastlane match` を正しく動作させるには、`Fastfile` の `before_all` ブロックに `setup_circle_ci` を追加する*必要があります*。 そうすることで、一時的な fastlane キーチェーンが確実に使用されます。

    # fastlane/Fastfile
    default_platform :ios
    
    platform :ios do
      before_all do
        setup_circle_ci
      end
    
      desc "テストをビルドして実行"
      lane :test do
        scan
      end
    
      desc "アドホック ビルド"
      lane :adhoc do
        match(type: "adhoc")
        gym(export_method: "ad-hoc")
      end
      ...
    end
    

### Adding a user key to the CircleCI project
{:.no_toc}

GitHub から証明書とキーを fastlane match にダウンロードするには、プロジェクト リポジトリと証明書リポジトリ (またはキー リポジトリ) の両方にアクセス権を持つユーザー キーを CircleCI プロジェクトに追加する必要があります。 プロジェクト設定で **[Permissions (権限)] -> [Checkout SSH Keys (SSH 鍵のチェック アウト)] -> [Add user key (ユーザー キーの追加)]** に移動して、[Authorize with GitHub (GitHub で承認)] ボタンをクリックします。

**メモ:** この手順により、[Authorize with GitHub (GitHub で承認)] ボタンをクリックするユーザーと同じ GitHub 権限が CircleCI プロジェクトに付与されます。

`Matchfile` では、`git_url` は **HTTPS** URL ではなく、**SSH** URL (`git@github.com:...` 形式) にする必要があります。 SSH URL 形式にせずに match を使用すると、認証エラーが発生する可能性があります。 たとえば、以下のようになります。

    git_url("git@github.com:fastlane/certificates")
    app_identifier("tools.fastlane.app")
    username("user@fastlane.tools")
    

プロジェクト リポジトリおよびキー リポジトリにのみアクセス権を持つマシン ユーザーを作成し、そのマシン ユーザーを使用してユーザー キーを作成して、CircleCI プロジェクトに付与される GitHub アクセス権のレベルを下げることをお勧めします。

ユーザー キーを追加すると、CircleCI 上でプロジェクト リポジトリとコード署名証明書リポジトリ (またはキー リポジトリ) の両方が GitHub からチェック アウトできるようになります。

### Adding the Match passphrase to the encrypted environment variables
{:.no_toc}

GitHub リポジトリに格納してあるキーとプロファイルを fastlane match で復号化できるようにするには、match のセットアップ手順で設定した暗号化パスフレーズを CircleCI プロジェクトの暗号化された環境変数に追加する必要があります。

CircleCI のプロジェクト設定で **[Build Settings (ビルド設定)] -> [Environment Variables (環境変数)]** に移動して `MATCH_PASSWORD` 変数を追加し、その値に暗号化パスフレーズを設定します。 設定したパスフレーズは、暗号化されたまま格納されます。

### CircleCI 上で fastlane テスト レーンを起動する
{:.no_toc}

match を構成して、その呼び出しをアドホック レーンに追加すると、そのアドホック レーンを CircleCI で実行できます。 以下の `config.yml` では、`development` ブランチにプッシュするたびにアドホック ビルドが作成されます。

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    steps:
      # inc steps to complete build and test
      - run: bundle exec fastlane test

  adhoc:
    macos:
      xcode: 11.3.0
    steps:
      # inc steps required to complete job

      - run: bundle exec fastlane adhoc

workflows:
  version: 2
  build-test-adhoc:
    jobs:

      - build-and-test
      - adhoc:
          filters:
            branches:
              only: development
          requires:
            - build-and-test
```

## Sample configuration files

iOS プロジェクトおよび Mac プロジェクトに対してコード署名をセットアップする設定ファイルのベスト プラクティスは以下のとおりです。

    # fastlane/fastfile
    default_platform :ios
    
    platform :ios do
      before_all do
        setup_circle_ci
      end
    
      desc "Runs all the tests"
      lane :test do
        scan
      end
    
      desc "Ad-hoc build"
      lane :adhoc do
        match(type: "adhoc")
        gym(export_method: "ad-hoc")
      end
    end
    

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: test
    steps:
      - checkout
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: output
      - store_test_results:
          path: output/scan

  adhoc:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: adhoc
    steps:

      - checkout
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: output

workflows:
  build-test-adhoc:
    jobs:

      - build-and-test
      - adhoc:
          filters:
            branches:
              only: development
          requires:
            - build-and-test
```

環境変数 `FL_OUTPUT_DIR:` を設定すると、fastlane がそのディレクトリに Xcode および fastlane ログを出力するようになり、ログがアーティファクトとしてアップロードされるため、トラブルシューティングが容易になります。

## Example application on GitHub

fastlane match を使用して iOS アプリのコード署名を構成する方法の例として、[`circleci-demo-ios` GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios)を参照してください。