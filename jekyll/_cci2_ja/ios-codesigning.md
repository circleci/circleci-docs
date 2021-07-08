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

## iOS プロジェクトの基本構成
このドキュメントは、iOS プロジェクトまたは Mac プロジェクトが CircleCI 2.0 上に正しく構築されていること、また Bundle と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

This document assumes that you already have an iOS or Mac project building correctly on CircleCI 2.0. It also assumes that you use Bundle and Fastlane, and have a `Gemfile`, `Appfile` and `Fastfile` checked into your repo.

**Note:** CircleCI only officially supports Fastlane Match for codesigning. Other methods may be used, but are not guaranteed to work and are unsupported.

**メモ:** fastlane match を使用して CircleCI 2.0 上でコード署名をセットアップするには、CircleCI プロジェクトに「ユーザー キーを追加」する必要があります。 コード署名のセットアップは、CircleCI 1.0 の場合とは大きく異なります。 2.0 ではコード署名に CircleCI アプリケーションを使用する必要がなく、以下の構成手順を実施するだけでセットアップが完了します。 この 2.0 ドキュメントはその点を踏まえて作成されています。

コード署名は、ユーザーのアプリおよび App Store ビルドのアドホック ディストリビューションを生成するように構成する必要があります。

## fastlane match のセットアップ
{: #setting-up-fastlane-match }

Code signing must be configured to generate ad-hoc distributions of your app and App Store builds.

[fastlane match](https://codesigning.guide/) は [fastlane ツール](https://fastlane.tools/)の 1 つであり、開発環境と CircleCI の両方でコード署名をシームレスに構成できます。 fastlane match は、ユーザーのすべてのコード署名キーとプロビジョニング プロファイルを GitHub リポジトリに格納し、必要なキーとプロファイルを 1 つのコマンドでダウンロードしてインストールします。

ユーザー リポジトリのルートで `bundle exec fastlane match init` を実行して、match リポジトリを構成する手順を実行します。 次に `bundle exec fastlane match adhoc` を実行して、アドホック ディストリビューションのキーとプロファイルを生成してインストールします。

### fastlane match で使用する Xcode プロジェクトを準備する
アドホック ビルドに関する項目は以下のように設定します。
{:.no_toc}

match をセットアップする前に、ユーザーの Xcode プロジェクトのコード署名を以下のように構成していることを確認する必要があります。

* **[Build Settings (ビルド設定)] -> [Code Signing Style (コード署名スタイル)]** を *[Manual (手動)]* に設定
* **[Build Settings (ビルド設定)] -> [Development Team (開発チーム)]** を開発チーム ID に設定
* **[Build Settings (ビルド設定)] -> [Code Signing Identity (コード署名 ID)]** を以下のように設定
  * デバッグ設定: *[iOS Developer (iOS 開発者)]*
  * リリース設定: *[iOS Distribution (iOS ディストリビューション)]*

In the target that you will be using for ad-hoc builds:
* **[Build Settings (ビルド設定)] -> [Provisioning Profile (Deprecated) (プロビジョニング プロファイル (非推奨))]** を *[Match AdHoc (Match アドホック)]* プロファイルに設定

### fastlane レーンに match を追加する
{: #adding-match-to-the-fastlane-lane }
{:.no_toc}

CircleCI では、ユーザー アプリのアドホック ビルドを生成するたびに fastlane match を実行する必要があります。 専用のカスタム fastlane レーンを作成しておくと便利です。 以下のような fastlane を作成することをお勧めします。

**メモ:** `fastlane match` を正しく動作させるには、`Fastfile` の `before_all` ブロックに `setup_circle_ci` を追加する*必要があります*。 そうすることで、一時的な fastlane キーチェーンが確実に使用されます。

```
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
```

### CircleCI プロジェクトにユーザー キーを追加する
{: #adding-a-user-key-to-the-circleci-project }
{:.no_toc}

GitHub から証明書とキーを fastlane match にダウンロードするには、プロジェクト リポジトリと証明書リポジトリ (またはキー リポジトリ) の両方にアクセス権を持つユーザー キーを CircleCI プロジェクトに追加する必要があります。 プロジェクト設定で **[Permissions (権限)] -> [Checkout SSH Keys (SSH 鍵のチェック アウト)] -> [Add user key (ユーザー キーの追加)]** に移動して、[Authorize with GitHub (GitHub で承認)] ボタンをクリックします。

**メモ:** この手順により、[Authorize with GitHub (GitHub で承認)] ボタンをクリックするユーザーと同じ GitHub 権限が CircleCI プロジェクトに付与されます。

`Matchfile` では、`git_url` は **HTTPS** URL ではなく、**SSH** URL (`git@github.com:...` 形式) にする必要があります。 SSH URL 形式にせずに match を使用すると、認証エラーが発生する可能性があります。 たとえば、以下のようになります。

```
git_url("git@github.com:fastlane/certificates")
app_identifier("tools.fastlane.app")
username("user@fastlane.tools")
```

環境変数 `FL_OUTPUT_DIR:` を設定すると、fastlane がそのディレクトリに Xcode および fastlane ログを出力するようになり、ログがアーティファクトとしてアップロードされるため、トラブルシューティングが容易になります。

fastlane match を使用して iOS アプリのコード署名を構成する方法の例として、[`circleci-demo-ios` GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios)を参照してください。

### 暗号化された環境変数に match パスフレーズを追加する
{: #adding-the-match-passphrase-to-the-encrypted-environment-variables }
{:.no_toc}

GitHub リポジトリに格納してあるキーとプロファイルを fastlane match で復号化できるようにするには、match のセットアップ手順で設定した暗号化パスフレーズを CircleCI プロジェクトの暗号化された環境変数に追加する必要があります。

CircleCI のプロジェクト設定で **[Build Settings (ビルド設定)] -> [Environment Variables (環境変数)]** に移動して `MATCH_PASSWORD` 変数を追加し、その値に暗号化パスフレーズを設定します。 設定したパスフレーズは、暗号化されたまま格納されます。

### CircleCI 上で fastlane テスト レーンを起動する
{: #invoking-the-fastlane-test-lane-on-circleci }
{:.no_toc}

match を構成して、その呼び出しをアドホック レーンに追加すると、そのアドホック レーンを CircleCI で実行できます。 以下の `config.yml` では、`development` ブランチにプッシュするたびにアドホック ビルドが作成されます。

```yaml
CircleCI 2.0 上で iOS プロジェクトまたは Mac プロジェクトをまだ構成していない場合、「<a href="{{ site.baseurl }}/ja/2.0/testing-ios/">macOS 上の iOS アプリケーションのテスト</a>」で構成手順を確認できます。
```

## サンプルの設定ファイル
{: #sample-configuration-files }

iOS プロジェクトおよび Mac プロジェクトに対してコード署名をセットアップする設定ファイルのベスト プラクティスは以下のとおりです。

```
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "すべてのテストを実行"
  lane :test do
    scan
  end

  desc "アドホック ビルド"
  lane :adhoc do
    match(type: "adhoc")
    gym(export_method: "ad-hoc")
  end
end
```

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "9.0"
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: test
    shell: /bin/bash --login -o pipefail
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
      xcode: "9.0"
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: adhoc
    shell: /bin/bash --login -o pipefail
    steps:

      - checkout
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: output

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

By setting the `FL_OUTPUT_DIR:` env, that will tell Fastlane to output the XCode and Fastlane logs to that directory, so they get uploaded as artifacts for ease in troubleshooting.

## GitHub 上のサンプル アプリケーション
{: #example-application-on-github }

**メモ:**: fastlane match を使用せずに進める場合は、その方法を紹介している[こちらのブログ記事](https://medium.com/@m4rr/circleci-2-0-and-the-ios-code-signing-df434d0086e2)を参照してください。
