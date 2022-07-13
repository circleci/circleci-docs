---
layout: classic-docs
title: "iOS プロジェクトのコード署名のセットアップ"
short-title: "iOS プロジェクトのコード署名"
description: "iOS または Mac アプリのコード署名をセットアップする方法"
categories:
  - プラットフォーム
order: 40
version:
  - Cloud
---

ここでは、CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名をセットアップするガイドラインを紹介します。

* 目次
{:toc}

## iOS プロジェクトの基本設定
{: #basic-configuration-of-ios-projects }

このドキュメントは、iOS プロジェクトが 推奨されるベストプラクティスを使用してCircleCI 上に正しくビルドされていることを前提としています。 また Bundler と fastlane を使用しており、`Gemfile`、`Appfile` および `Fastfile` がリポジトリにチェックインされていることを前提としています。

If you have not yet configured your iOS project on CircleCI, you can find the configuration instructions in the [Testing iOS Applications document]({{ site.baseurl }}/testing-ios/).

**注意:** CircleCI が正式にサポートしているのは fastlane match によるコード署名のみです。 それ以外の方法も使用できますが、動作を保証するものではなく、サポートもしていません。

## fastlane match のセットアップ
{: #setting-up-fastlane-match }

コード署名は、ユーザーのアプリおよび App Store ビルドのアドホックディストリビューションを生成するように設定されている必要があります。

[fastlane match](https://codesigning.guide/) は [fastlane ツール](https://fastlane.tools/)の 1 つであり、開発環境と CircleCI の両方でコード署名をシームレスに設定できます。 fastlane match は、ユーザーのすべてのコード署名キーとプロビジョニング プロファイルを GitHub リポジトリに格納し、必要なキーとプロファイルを 1 つのコマンドでダウンロードしてインストールします。

この設定例では、ストレージとして git リポジトリを設定して使用します。

fastlane match のセットアップ:

* ローカルのマシンで、ターミナルを開き、リポジトリのルートディレクトリに移動します。
* `bundle exec fastlane match init`を実行します。
* 指示に従い、match レポジトリを設定します。
* 上記が完了したら、 `bundle exec fastlane match development` を実行し、開発証明書とプロファイルを生成してインストールします。
* 次に `bundle exec fastlane match adhoc` を実行し、アドホック ディストリビューションの証明書とプロファイルを生成してインストールします。

### fastlane match で使用する Xcode プロジェクトを準備する
{: #preparing-your-xcode-project-for-use-with-fastlane-match }
{:.no_toc}

match を設定する前に、ユーザーの Xcode プロジェクトのコード署名が以下のように設定されていることを確認する必要があります。

* **[Signing & Capabilities(署名と機能)] > [Signing(署名)]のチェックを外す** *: デバグとリリースの署名を自動管理します* 。
* **[Signing & Capabilities (署名と機能)] > プロフィールのプロビジョニング**:  fastlane matchで作成された適切なプロファイルを選択します（例：`match adhoc com.circleci.helloworld`）。

### fastlane レーンに match を追加する
{: #adding-match-to-the-fastlane-lane }
{:.no_toc}

CircleCI では、ユーザー アプリのアドホック ビルドを生成するたびに fastlane match を実行する必要があります。 これを行う最も簡単な方法は、アプリをビルドするレーンに `match` アクションを追加することです。

**注意:** `fastlane match` を正しく動作させるには、`Fastfile` の `before_all` ブロックに `setup_circle_ci` を追加する*必要があります*。 そうすることで、全アクセス権を持つ一時的な fastlane キーチェーンが確実に使用されます。 これを使用しないと、ビルドに失敗したり、一貫性のない結果になる可能性があります。

```ruby
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

GitHub から証明書とキーを fastlane match にダウンロードするには、プロジェクトリポジトリと証明書リポジトリまたはキーリポジトリの両方にアクセス権を持つユーザーキーを CircleCI プロジェクトに追加する必要があります。

ユーザーキーを追加するには、

* CircleCI アプリケーションでは、 [Project Settings (プロジェクトの設定)] ボタン (プロジェクトのパイプラインのページの右上にあります) をクリックして、プロジェクトの設定に移動します。
* プロジェクトの設定ページで、\[SSH Keys (SSH キー)\] (左の縦型メニュー) をクリックします。
* *[Add User Key (ユーザーキーを追加)]* ボタンをクリックし、手順に従って CircleCI の認証を行います。

**注意:** この手順により、[Authorize with GitHub (GitHub で承認)] ボタンをクリックするユーザーと同じ GitHub アクセス権が CircleCI プロジェクトに付与されます。

`Matchfile` では、`git_url` は **HTTPS** URL ではなく、**SSH** URL (`git@github.com:...` 形式) にする必要があります。 SSH URL 形式にせずに match を使用すると、認証エラーが発生する可能性があります。 たとえば、以下のようになります。

```ruby
git_url("git@github.com:fastlane/certificates")
app_identifier("tools.fastlane.app")
username("user@fastlane.tools")
```

プロジェクトリポジトリおよびキーリポジトリにのみアクセス権を持つマシンユーザーを作成し、そのマシンユーザーを使用してユーザーキーを作成して、CircleCI プロジェクトに付与される GitHub アクセス権のレベルを下げることをお勧めします。

ユーザーキーを追加すると、CircleCI は GitHub から プロジェクトのリポジトリとfastlane matchのリポジトリの両方をチェックアウトできるようになります。

### 暗号化された環境変数に match パスフレーズを追加する
{: #adding-the-match-passphrase-to-the-project }
{:.no_toc}

GitHub リポジトリに格納してあるキーとプロファイルを fastlane match で復号化できるようにするには、match のセットアップ手順で設定した暗号化パスフレーズを CircleCI プロジェクトの暗号化された環境変数に追加する必要があります。

CircleCI のプロジェクト設定で **Environment Variables (環境変数)]** に移動して `MATCH_PASSWORD` 変数を追加します。 その値には、暗号化パスフレーズを設定してください。 設定したパスフレーズは、暗号化されたまま格納されます。

### CircleCI でのアプリのビルドとコード署名
{: #invoking-the-fastlane-test-lane-on-circleci }
{:.no_toc}

match を構成して、その呼び出しをアドホック レーンに追加すると、そのアドホック レーンを CircleCI で実行できます。 以下の `config.yml` では、`development` ブランチにプッシュするたびにアドホック ビルドが作成されます。

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    steps:
      # ...
      - run: bundle exec fastlane test

  adhoc:
    macos:
      xcode: 12.5.1
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

## サンプル設定ファイル
{: #sample-configuration-files }

iOS プロジェクトおよび Mac プロジェクトに対してコード署名をセットアップする設定ファイルのベスト プラクティスは以下のとおりです。

```ruby
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
      xcode: 12.5.1
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
      xcode: 12.5.1
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

`FL_OUTPUT_DIR:` 環境変数を設定すると、fastlane はそのディレクトリに Xcode および fastlane ログを出力するようになり、対象のログがアーティファクトとしてアップロードされるため、トラブルシューティングが容易になります。

## GitHub 上のサンプル アプリケーション
{: #example-application-on-github }

fastlane match を使用して iOS アプリのコード署名を構成する方法の例として、[`circleci-demo-ios` GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios)を参照してください。
