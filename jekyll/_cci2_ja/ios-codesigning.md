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
{: #basic-configuration-of-ios-projects }

このドキュメントは、iOS プロジェクトまたは Mac プロジェクトが CircleCI 2.0 上に正しく構築されていること、また Bundle と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

CircleCI 2.0 上で iOS プロジェクトまたは Mac プロジェクトをまだ構成していない場合、[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/ja/2.0/testing-ios/)で構成手順を確認できます。

**Note:** CircleCI only officially supports Fastlane Match for codesigning. Other methods may be used, but are not guaranteed to work and are unsupported.

## fastlane match のセットアップ
{: #setting-up-fastlane-match }

コード署名は、ユーザーのアプリおよび App Store ビルドのアドホック ディストリビューションを生成するように構成する必要があります。

[fastlane match](https://codesigning.guide/) は [fastlane ツール](https://fastlane.tools/)の 1 つであり、開発環境と CircleCI の両方でコード署名をシームレスに構成できます。 fastlane match は、ユーザーのすべてのコード署名キーとプロビジョニング プロファイルを GitHub リポジトリに格納し、必要なキーとプロファイルを 1 つのコマンドでダウンロードしてインストールします。

In this example configuration, we will set up and use a git repository for storage.

To set up Fastlane Match:

* On your local machine, open Terminal and navigate to the root directory of your repository
* Run `bundle exec fastlane match init`
* Follow the instructions to configure the Match repository
* After the above is complete, run `bundle exec fastlane match development` to generate and install the Development certificates and profiles
* 次に `bundle exec fastlane match adhoc` を実行して、アドホック ディストリビューションのキーとプロファイルを生成してインストールします。

### fastlane match で使用する Xcode プロジェクトを準備する
{: #preparing-your-xcode-project-for-use-with-fastlane-match }
{:.no_toc}

match をセットアップする前に、ユーザーの Xcode プロジェクトのコード署名を以下のように構成していることを確認する必要があります。

* **Signing & Capabilities -> Signing** uncheck *Automatically manage signing* for both Debug and Release
* **Signing & Capabilities -> Provisioning Profile** choose the appropriate profile created by Fastlane Match (e.g., `match adhoc com.circleci.helloworld`)

### fastlane レーンに match を追加する
{: #adding-match-to-the-fastlane-lane }
{:.no_toc}

CircleCI では、ユーザー アプリのアドホック ビルドを生成するたびに fastlane match を実行する必要があります。 The easiest way to do this is to add the `match` action to the lane which builds your app.

**メモ:** `fastlane match` を正しく動作させるには、`Fastfile` の `before_all` ブロックに `setup_circle_ci` を追加する*必要があります*。 This ensures that a temporary Fastlane keychain with full permissions is used. Without using this you may see build failures or inconsistent results.

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

GitHub から証明書とキーを fastlane match にダウンロードするには、プロジェクト リポジトリと証明書リポジトリ (またはキー リポジトリ) の両方にアクセス権を持つユーザー キーを CircleCI プロジェクトに追加する必要があります。 

To add a user key:

* In the CircleCI application, go to your project’s settings by clicking the the Project Settings button (top-right on the Pipelines page of the project).
* On the Project Settings page, click on SSH Keys (vertical menu on the left).
* Click the *Add User Key* button and follow the steps to authorize CircleCI

**メモ:** この手順により、[Authorize with GitHub (GitHub で承認)] ボタンをクリックするユーザーと同じ GitHub 権限が CircleCI プロジェクトに付与されます。

`Matchfile` では、`git_url` は **HTTPS** URL ではなく、**SSH** URL (`git@github.com:...` 形式) にする必要があります。 SSH URL 形式にせずに match を使用すると、認証エラーが発生する可能性があります。 たとえば、以下のようになります。

```
git_url("git@github.com:fastlane/certificates")
app_identifier("tools.fastlane.app")
username("user@fastlane.tools")
```

ジェクト リポジトリおよびキー リポジトリにのみアクセス権を持つマシン ユーザーを作成し、そのマシン ユーザーを使用してユーザー キーを作成して、CircleCI プロジェクトに付与される GitHub アクセス権のレベルを下げることをお勧めします。

ユーザー キーを追加すると、CircleCI 上でプロジェクト リポジトリとコード署名証明書リポジトリ (またはキー リポジトリ) の両方が GitHub からチェック アウトできるようになります。

### 暗号化された環境変数に match パスフレーズを追加する
{: #adding-the-match-passphrase-to-the-project }
{:.no_toc}

GitHub リポジトリに格納してあるキーとプロファイルを fastlane match で復号化できるようにするには、match のセットアップ手順で設定した暗号化パスフレーズを CircleCI プロジェクトの暗号化された環境変数に追加する必要があります。

CircleCI のプロジェクト設定で **[Build Settings (ビルド設定)] -> [Environment Variables (環境変数)]** に移動して `MATCH_PASSWORD` 変数を追加し、その値に暗号化パスフレーズを設定します。 Set its value to your encryption passphrase. 設定したパスフレーズは、暗号化されたまま格納されます。

### CircleCI 上で fastlane テスト レーンを起動する
{: #invoking-the-fastlane-test-lane-on-circleci }
{:.no_toc}

match を構成して、その呼び出しをアドホック レーンに追加すると、そのアドホック レーンを CircleCI で実行できます。 以下の `config.yml` では、`development` ブランチにプッシュするたびにアドホック ビルドが作成されます。

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: 12.5.0
    steps:
      # ...
      - run: bundle exec fastlane test

  adhoc:
    macos:
      xcode: 12.5.0
    steps:
      # ...
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

## サンプルの設定ファイル
{: #sample-configuration-files }

The best practice configuration for setting up code signing for iOS projects is as follows:

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

By setting the `FL_OUTPUT_DIR:` env, that will tell Fastlane to output the XCode and Fastlane logs to that directory, so they get uploaded as artifacts for ease in troubleshooting.

## GitHub 上のサンプル アプリケーション
{: #example-application-on-github }

fastlane match を使用して iOS アプリのコード署名を構成する方法の例として、[`circleci-demo-ios` GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios)を参照してください。
