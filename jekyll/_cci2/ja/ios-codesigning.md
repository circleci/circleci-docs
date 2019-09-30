---
layout: classic-docs
title: "iOS プロジェクトのコード署名の設定"
short-title: "iOS プロジェクトのコード署名"
description: "iOS または Mac アプリのコード署名を設定する方法"
categories:
  - platforms
order: 40
---

ここでは、CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名を設定するガイドラインについて説明します。

* 目次
{:toc}

## iOS プロジェクトの基本設定

このドキュメントは、iOS プロジェクトまたは Mac プロジェクトが CircleCI 2.0 上に正しくビルドされていること、また Bundle と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

**Note:** Setting up code signing on CircleCI 2.0 using Fastlane Match requires *adding a User key** to your CircleCI project. コード署名の設定は、CircleCI 1.0 の場合とは大きく異なります。2.0 ではコード署名に CircleCI アプリを使用する必要がなく、以下のコンフィグ手順を実施するだけで設定が完了します。この 2.0 ドキュメントはその点を踏まえて作成されています。

**Note**: If you would like to proceed without using Fastlane Match, [this blog post](https://medium.com/@m4rr/circleci-2-0-and-the-ios-code-signing-df434d0086e2) provides an overview of how you can do this with CircleCI.

If you have not yet configured your iOS or Mac project on CircleCI 2.0, you can find the configuration instructions in the [Testing iOS Applications on macOS document]({{ site.baseurl }}/2.0/testing-ios/).

## fastlane match の設定

Code signing must be configured to generate ad-hoc distributions of your app and App Store builds.

[Fastlane Match](https://codesigning.guide/) is one of the [Fastlane tools](https://fastlane.tools/), and it allows for seamless configuration on code signing in both the development environment and on CircleCI. Fastlane Match stores all of your code signing keys and provisioning profiles in a GitHub repository, and downloads and installs the necessary keys and profiles with a single command.

In the root of your repository, run `bundle exec fastlane match init` and follow the instructions to configure the Match repository. After configuration is complete, run `bundle exec fastlane match development` to generate and install the Development keys and profiles, and then run `bundle exec
fastlane match adhoc` to generate and install the Ad-hoc distribution keys and profiles.

### fastlane match で使用する Xcode プロジェクトの準備
{:.no_toc}

Before setting up Match you must ensure that the code signing settings in your Xcode project are configured as follows:

* **[Build Settings (ビルド設定)] -> [Code Signing Style (コード署名スタイル)]** が [*Manual (手動)*] に設定されている
* **[Build Settings (ビルド設定)] -> [Development Team (開発チーム)]** がユーザーの開発チーム ID に設定されている
* **[Build Settings (ビルド設定)] -> [Code Signing Identity (コード署名 ID)] ** が以下のように設定されている 
  * デバッグ設定：*[iOS Developer (iOS 開発者)]*
  * リリース設定：*[iOS Distribution (iOS ディストリビューション)]*

In the target that you will be using for ad-hoc builds:

* **Build Settings -> Provisioning Profile (Deprecated)** is set to the *Match AdHoc* profile.

### fastlane レーンへの match の追加
{:.no_toc}

On CircleCI, Fastlane Match will need to be run every time you are going to generate an Ad-hoc build of your app. The easiest way to achieve that is to create a custom Fastlane lane just for that. It is best practice to create a Fastfile similar to the following:

**Note:** For `fastlane match` to work correctly, you *must* add `setup_circle_ci` to `before_all` in your `Fastfile`. This ensures that a temporary Fastlane keychain is used.

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
    
      desc "アドホックビルド"
      lane :adhoc do
        match(type: "adhoc")
        gym(export_method: "ad-hoc")
      end
      ...
    end
    

### CircleCI プロジェクトへのユーザーキーの追加
{:.no_toc}

To enable Fastlane Match to download the certificates and the keys from GitHub, it is necessary to add a user key with access to both the project repo and the certificates / keys repo to the CircleCI project. In the project settings, navigate to **Permissions -> Checkout SSH Keys -> Add user key** and click *Authorize with GitHub*.

**Note:** This action will give the CircleCI project the same GitHub permissions as the user who will be clicking the *Authorize with GitHub* button.

In your `Matchfile`, the `git_url` should be an **SSH** URL ( in the `git@github.com:...` format), rather than a **HTTPS** URL. Otherwise you may see authentication errors when you attempt to use match. For example:

    git_url("git@github.com:fastlane/certificates")
    app_identifier("tools.fastlane.app")
    username("user@fastlane.tools")
    

It is best practice to create a machine user with access to just the project repo and the keys repo, and use that machine user to create a user key to reduce the level of GitHub access granted to the CircleCI project.

After you have added a user key, CircleCI will be able to checkout both the project repo and the code signing certificates / keys repo from GitHub.

### 暗号化された環境変数への match パスフレーズの追加
{:.no_toc}

To enable Fastlane Match to decrypt the keys and profiles stored in the GitHub repo, it is necessary to add the encryption passphrase that you configured in the Match setup step to the CircleCI project's encrypted environment variables.

In the project settings on CircleCI, navigate to **Build Settings -> Environment Variables** and add the `MATCH_PASSWORD` variable, and set its value to your encryption passphrase. The passphrase will be stored encrypted at rest.

### CircleCI 上での fastlane テストレーンの起動
{:.no_toc}

After you have configured Match and added its invocation into the Ad-hoc lane, you can run that lane on CircleCI. The following `config.yml` will create an Ad-hoc build every time you push to the `development` branch:

    # .circleci/config.yml
    version: 2
    jobs:
      build-and-test:
        macos:
          xcode: "9.0"
        steps:
          ...
          - run: bundle exec fastlane test
          ...
    
      adhoc:
        macos:
          xcode: "9.0"
        steps:
          ...
    
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
    

## サンプルの設定ファイル

The best practice configuration for setting up code signing for iOS and Mac projects is as follows:

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
    
      desc "アドホックビルド"
      lane :adhoc do
        match(type: "adhoc")
        gym(export_method: "ad-hoc")
      end
    end
    

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

## GitHub 上のサンプルアプリケーション

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) for an example of how to configure code signing for iOS apps using Fastlane Match.

## 関連項目
{:.no_toc}

To read a blog post by Franz Busch at Sixt about their setup for CI with Fastlane and CircleCI, refer to the [Continuous integration and delivery with fastlane and CircleCI](https://medium.com/sixt-labs-techblog/continuous-integration-and-delivery-at-sixt-91ca215670a0) blog post on Medium.