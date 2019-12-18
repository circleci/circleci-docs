---
layout: classic-docs
title: "iOS プロジェクトのコード署名の設定"
short-title: "iOS プロジェクトのコード署名"
description: "iOS または Mac アプリのコード署名を設定する方法"
categories: [platforms]
order: 40
---

ここでは、CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名を設定するガイドラインについて説明します。

* 目次
{:toc}

## iOS プロジェクトの基本設定

このドキュメントは、iOS プロジェクトまたは Mac プロジェクトが CircleCI 2.0 上に正しくビルドされていること、また Bundle と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

**メモ：**fastlane match を使用して CircleCI 2.0 上でコード署名を設定するには、CircleCI プロジェクトに*ユーザーキーを追加*する必要があります。 コード署名の設定は、CircleCI 1.0 の場合とは大きく異なります。2.0 ではコード署名に CircleCI アプリを使用する必要がなく、以下のコンフィグ手順を実施するだけで設定が完了します。この 2.0 ドキュメントはその点を踏まえて作成されています。

CircleCI 2.0 上で iOS プロジェクトまたは Mac プロジェクトをまだ設定していない場合、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/ja/2.0/testing-ios/)」で設定手順を確認できます。

## fastlane match の設定

コード署名は、ユーザーのアプリおよび App Store ビルドのアドホックディストリビューションを生成するように設定されている必要があります。

[fastlane match](https://codesigning.guide/) は [fastlane ツール](https://fastlane.tools/)の 1つであり、開発環境と CircleCI の両方でコード署名をシームレスに設定できます。 fastlane match は、ユーザーのすべてのコード署名キーとプロビジョニングプロファイルを GitHub リポジトリに格納し、必要なキーとプロファイルを 1つのコマンドでダウンロードしてインストールします。

ユーザーリポジトリのルートで `bundle exec fastlane match init` を実行して、match リポジトリを設定する手順を実行します。 設定が完了したら、`bundle exec fastlane match development` を実行して開発キーとプロファイルを生成してインストールします。次に `bundle exec fastlane match adhoc` を実行して、アドホックディストリビューションのキーとプロファイルを生成してインストールします。

### fastlane match で使用する Xcode プロジェクトの準備
{:.no_toc}

match を設定する前に、ユーザーの Xcode プロジェクトのコード署名が以下のように設定されていることを確認する必要があります。

* **[Build Settings (ビルド設定)] -> [Code Signing Style (コード署名スタイル)]** が [*Manual (手動)*] に設定されている
* **[Build Settings (ビルド設定)] -> [Development Team (開発チーム)]** がユーザーの開発チーム ID に設定されている
* **[Build Settings (ビルド設定)] -> [Code Signing Identity (コード署名 ID)] ** が以下のように設定されている
  * デバッグ設定：*[iOS Developer (iOS 開発者)]*
  * リリース設定：*[iOS Distribution (iOS ディストリビューション)]*

アドホックビルドに対して使用するターゲットでは、以下のように設定する必要があります。 * **[Build Settings (ビルド設定)] -> [Provisioning Profile (Deprecated) (プロビジョニングプロファイル (非推奨))]** が *[Match AdHoc (Match アドホック)]* プロファイルに設定されている

### fastlane レーンへの match の追加
{:.no_toc}

CircleCI では、ユーザーアプリのアドホックビルドを生成するたびに fastlane match を実行する必要があります。専用のカスタム fastlane レーンを作成しておくと便利です。 以下のような Fastfile を作成することをお勧めします。

**メモ：**`fastlane match` を正しく動作させるには、`Fastfile` で `setup_circle_ci` を `before_all` に追加する*必要があります*。 そうすることで、一時的な fastlane キーチェーンが確実に使用されます。

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

GitHub から証明書とキーを fastlane match にダウンロードするには、プロジェクトリポジトリと証明書リポジトリまたはキーリポジトリの両方にアクセス権を持つユーザーキーを CircleCI プロジェクトに追加する必要があります。 プロジェクト設定で **[Permissions (権限)] -> [Checkout SSH Keys (SSH キーをチェックアウト)] -> [Add user key (ユーザーキーを追加)]** に移動して、[*Authorize with GitHub (GitHub で承認)*] ボタンをクリックします。

**メモ：**この手順が完了すると、[*Authorize with GitHub (GitHub で承認)*] ボタンをクリックするユーザーと同じ GitHub 権限が CircleCI プロジェクトに付与されます。

`Matchfile` では、`git_url` は **HTTPS** URL ではなく、(`git@github.com:...` 形式の) **SSH** URL にする必要があります。 SSH URL 形式にせずに match を使用すると、認証エラーが発生する可能性があります。 たとえば、以下のようになります。

    git_url("git@github.com:fastlane/certificates")
    app_identifier("tools.fastlane.app")
    username("user@fastlane.tools")


プロジェクトリポジトリおよびキーリポジトリにのみアクセス権を持つマシンユーザーを作成し、そのマシンユーザーを使用してユーザーキーを作成して、CircleCI プロジェクトに付与される GitHub アクセス権のレベルを下げることをお勧めします。

ユーザーキーを追加すると、CircleCI 上でプロジェクトリポジトリとコード署名証明書リポジトリまたはキーリポジトリの両方が GitHub からチェックアウトできるようになります。

### 暗号化された環境変数への match パスフレーズの追加
{:.no_toc}

GitHub リポジトリに格納してあるキーとプロファイルを fastlane match で復号化するには、match のセットアップ手順で設定した暗号化パスフレーズを CircleCI プロジェクトの暗号化された環境変数に追加する必要があります。

CircleCI のプロジェクト設定で **[Build Settings (ビルド設定)] -> [Environment Variables (環境変数)]** に移動して `MATCH_PASSWORD` 変数を追加し、その値に暗号化パスフレーズを設定します。 設定したパスフレーズは、暗号化されたまま格納されます。

### CircleCI 上での fastlane テストレーンの起動
{:.no_toc}

match を設定して、その呼び出しをアドホックレーンに追加した後、アドホックレーンを CircleCI で実行します。 以下の `config.yml` では、`development` ブランチにプッシュするたびにアドホックビルドが作成されるようになります。

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

iOS プロジェクトおよび Mac プロジェクトに対してコード署名を設定するためのベストプラクティスを以下に示します。

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
          name: fastlane
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
          name: fastlane
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

`FL_OUTPUT_DIR:` 環境変数を設定すると、fastlane はそのディレクトリに Xcode および fastlane ログを出力するようになり、対象のログがアーティファクトとしてアップロードされるため、トラブルシューティングが容易になります。

## GitHub 上のサンプルアプリケーション

fastlane match を使用して iOS アプリのコード署名を設定する方法の例については、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios)を参照してください。

## 関連項目
{:.no_toc}

fastlane と CircleCI による CI の設定について確認したい場合は、Medium の Sixt Labs Techblog に投稿されている Franz Busch 氏の記事「[Continuous integration and delivery with fastlane and CircleCI (fastlane と CircleCI を活用した継続的インテグレーションおよびデリバリー)](https://medium.com/sixt-labs-techblog/continuous-integration-and-delivery-at-sixt-91ca215670a0)」を参照してください。
