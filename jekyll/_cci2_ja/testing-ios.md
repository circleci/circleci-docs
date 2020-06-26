---
layout: classic-docs
title: macOS 上の iOS アプリケーションのテスト
short-title: macOS 上の iOS アプリケーションのテスト
categories:
  - platforms
description: macOS 上の iOS アプリケーションのテスト
order: 30
---

以下のセクションに沿って、CircleCI を使用して iOS アプリケーションのテストをセットアップおよびカスタマイズする方法について説明します。

- 目次
{:toc}

**メモ:** 「[iOS プロジェクトのチュートリアル]({{ site.baseurl}}/2.0/ios-tutorial/)」や「[macOS での Hello World]({{ site.baseurl }}/2.0/hello-world-macos/)」も併せてご覧ください。

## 概要
{:.no_toc}

CircleCI では、iOS プロジェクトと macOS プロジェクトをビルドしてテストすることができます。 CircleCI の macOS ビルド イメージにインストールされているソフトウェアのマニフェストについては、macOS ビルド イメージの使用に関するドキュメントを参照してください。

## macOS ビルド コンテナ

各 `macos` ジョブは、macOS が稼働している新しいコンテナ内で実行されます。 CircleCI では、Apple から新しいバージョンの Xcode がリリースされるたびに、新しいコンテナをビルドします。 個々のビルド コンテナのコンテンツは変更されません (ただし、例外的にコンテナをリビルドせざるを得ない状況になることもあります)。 CircleCI では、安定したビルド環境を維持すること、そして `config.yml` ファイルに `xcode` キーを設定して最新のコンテナを選択していただけるようにすることを目標としています。

新しい macOS コンテナに関する情報は、[CircleCI ディスカッション フォーラムの Annoucements (お知らせ) カテゴリ](https://discuss.circleci.com/c/announcements)で確認できます。

## サポートされている Xcode のバージョン

現時点では以下の Xcode バージョンが使用可能です。

- `11.3.0`: Xcode 11.3 beta 1 (ビルド 11C24b)、macOS 10.15 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1657/index.html)
- `11.2.1`: Xcode 11.2.1 (ビルド 11B500)、macOS 10.15 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1532/index.html)
- `11.2.0`: Xcode 11.2.1 (!) (ビルド 11B500)、macOS 10.15 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1532/index.html)
- `11.1.0`: Xcode 11.1 (ビルド 11A1027)、macOS 10.14 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1226/index.html)
- `11.0.0`: Xcode 11.0 (ビルド 11A420a)、macOS 10.14 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1136/index.html)
- `10.3.0`: Xcode 10.3 (ビルド 10G8)、macOS 10.14 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-903/index.html)
- `10.2.1`: Xcode 10.2.1 (ビルド 10E1001)、macOS 10.14 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-594/index.html)
- `10.1.0`: Xcode 10.1 (ビルド 10B61)、macOS 10.13 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-474/index.html)
- `10.0.0`: Xcode 10.0 (ビルド 10A255)、macOS 10.13 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-456/index.html)
- `9.4.1`: Xcode 9.4.1 (ビルド 9F2000)、macOS 10.13 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-430/index.html)
- `9.3.1`: Xcode 9.3.1 (ビルド 9E501)、macOS 10.13 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-419/index.html)
- `9.0.1`: Xcode 9.0.1 (ビルド 9A1004)、macOS 10.12[インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-282/index.html)
- `8.3.3`: Xcode 8.3.3 (ビルド 8E3004b)、macOS 10.12 [インストールされているソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html)

## はじめに

CircleCI アプリケーションの [Add Projects (プロジェクトの追加)] ページで、ビルドしたい macOS プロジェクトを選択します。 **メモ:** 2.0 では、ビルド環境を変更する必要がなくなりました。プロジェクトが macOS としてリストされていない場合は、Linux プロジェクトを選択し、[Operating System (オペレーティング システム)] セクションで「macOS」を選択してください。

## 基本的なセットアップ

プロジェクトで macOS ビルドを有効にしたら、CircleCI が正しいビルド アクションを実行できるように、CircleCI でビルドするスキームを共有します。 既存のスキームを共有するには、Xcode で以下の手順を行います。

1. [Product (プロダクト)] > [Scheme (スキーム)] > [Manage Schemes (スキーム管理)] の順に選択します。
2. 共有したいスキームの [Shared (共有する)] オプションを選択し、[Close (閉じる)] をクリックします。
3. [Source Control (ソース管理)] > [Commit (コミットする)] の順に選択します。
4. 共有データ フォルダーを選択します。
5. テキスト フィールドにコミット メッセージを入力します。
6. プロジェクトを Git で管理している場合は、[Push to remote (リモートにプッシュする)] オプションを選択します。
7. [Commit Files (ファイルをコミットする)] ボタンをクリックします。 新しい `.xcscheme` ファイルが Xcode プロジェクトの下の `xcshareddata/xcschemes` フォルダーに格納されます。
8. CircleCI からアクセスできるように、このファイルを Git リポジトリにコミットします。

単純なプロジェクトであれば、最小限の構成で実行できます。 最小限の設定ファイルの例は、「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)」にて参照してください。

### ベスト プラクティス
{:.no_toc}

基本的なセットアップ手順に加えて、Specs リポジトリ全体をクローンするのではなく、CDN を利用できる CocoaPods 1.8 以降を使用することをお勧めします。 ポッドをすばやくインストールできるようになり、ビルド時間が短縮されます。 1.8 以降では `pod install` ステップのジョブ実行がかなり高速化されるので、1.7 以前を使用している場合はアップグレードを検討してください。

CocoaPods を使用するには、プロファイルの先頭行を次のように記述します。

    source 'https://cdn.cocoapods.org/'
    

1.7 以前からアップグレードする場合はさらに、プロファイルから次の行を削除すると共に、CircleCI 設定ファイルの "Fetch CocoaPods Specs" ステップを削除します。

    source 'https://github.com/CocoaPods/Specs.git'
    

## 高度なセットアップ

高度なセットアップとして、ビルド ジョブやテスト ジョブと共に Lint ジョブを実行できます。また、[Danger](https://github.com/danger/danger) などのツールも実行できる場合があります。

以下のように推奨の構成を拡張して、Lint ジョブと Danger ジョブを追加することができます。

```yaml
version: 2
jobs:
  build-and-test:
  swiftlint:
    docker:
      - image: dantoml/swiftlint:latest
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml
  danger:
    docker:
      - image: dantoml/danger:latest
    steps:
      - checkout
      - run: danger

workflows:
  version: 2
  build-test-lint:
    jobs:

      - swiftlint
      - danger
      - build-and-test
```

## fastlane の使用

[fastlane](https://fastlane.tools/) は、モバイル アプリのビルドとデプロイのプロセスを自動化するためのツールセットです。 fastlane は、使用するとローカルでも CircleCI 上でもビルドとデプロイを同等に実行でき、セットアップ プロセスが簡単になるので、ご使用をお勧めします。

### Gemfile の追加
{:.no_toc}

ローカルでも CircleCI 上でも同じバージョンの fastlane を使用できるよう、`Gemfile` をリポジトリに追加することをお勧めします。 以下は、最小限の構成の `Gemfile` の例です。

    # Gemfile
    source "https://rubygems.org"
    gem 'fastlane'
    

`Gemfile` をローカルで作成したら、`bundle install` を実行し、`Gemfile` と `Gemfile.lock` の両方をリポジトリにチェックインする必要があります。

### CircleCI 上で使用する場合の fastlane のセットアップ
{:.no_toc}

fastlane を CircleCI プロジェクトで使用する場合は、以下の行を `fastfile` に追加することをお勧めします。

    # fastlane/Fastfile
    
    ...
    platform :ios do
      before_all do
        setup_circle_ci
      end
      ...
    end
    

以下のアクションを実行するには、`setup_circle_ci` fastlane アクションを `before_all` ブロック内に記述する必要があります。

- fastlane match で使用する一時的なキーチェーンを新規作成する (詳細については、コード署名のセクションを参照してください)。
- fastlane match を `readonly` モードに切り替えて、CI が新しいコード署名証明書やプロビジョニング プロファイルを作成しないようにする。
- ログやテスト結果のパスをセットアップして、それらを収集しやすくする。

### CircleCI で fastlane を使用する場合の構成例
{:.no_toc}

以下に、CircleCI で使用できる fastlane の基本構成を示します。

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
    

上記の構成は、以下の CircleCI の設定ファイルと組み合わせて使用できます。

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "10.2.0"
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
      xcode: "10.2.0"
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

環境変数 `FL_OUTPUT_DIR` は、fastlane ログが保存されるアーティファクト ディレクトリです。 この環境変数を使用して、Gym や Scan などのログを自動的に保存するためのパスを `store_artifacts` ステップで設定します。

### テスト時間の短縮

デフォルトで、fastlane scan はテスト出力レポートを `html` 形式や `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_types` を変更して、これらの形式を無効化することを検討してください。

### CocoaPods の使用
{:.no_toc}

CocoaPods を使用する場合は、[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすることで、決定論的で再現可能なビルドを実現できます。

## サポートされているビルドおよびテストのツール

CircleCI 2.0 では、iOS のビルドやテストに関するほぼすべての戦略に合わせてビルドをカスタマイズできます。

### XCTest ベースのツール
{:.no_toc}

以下のテスト ツールは、CircleCI で有効に機能することが確認されています (他の多くのツールも問題なく機能します)。

- [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
- [Kiwi](https://github.com/kiwi-bdd/Kiwi)
- [KIF](https://github.com/kif-framework/KIF)

### その他のツール
{:.no_toc}

[Appium](http://appium.io/) や [Frank](http://www.testingwithfrank.com/) などの一般的な iOS テスト ツールも正常に機能します。これらのツールはインストール済みで、`run` コマンドで呼び出すことができます。

### シミュレーターの事前起動
{:.no_toc}

アプリケーションをビルドする前に iOS シミュレーターをあらかじめ起動して、シミュレーターの稼働が遅れないようにします。 こうすることで、ビルド中にシミュレーターのタイムアウトが発生する回数を全般的に減らすことができます。

シミュレーターを事前に起動するには、以下の行を `config.yml` ファイルに追加します。ここでは、iOS 10.2 を使用する iPhone 7 シミュレーターでテストを行うように指定しています。

        steps:
          - run:
              name: シミュレーターの事前起動
              command: xcrun instruments -w "iPhone 7 (10.2) [" || true
    

**メモ:** iPhone と Apple Watch のシミュレーターもビルド イメージに含まれるので、iPhone 7 シミュレーターを一意に識別するために `[` が必要です。

- iPhone シミュレーター: `iPhone 7 (10.2) [<uuid>]`
- iPhone と Apple Watch のペア: `iPhone 7 Plus (10.2) + Apple Watch Series 2 - 42mm (3.1) [<uuid>]`

### `config.yml` ファイルの作成
{:.no_toc}

ビルドを柔軟にカスタマイズするには、`.circleci/config.yml` ファイルをプロジェクトに追加します。こうすることで、ビルド プロセスのさまざまな段階で任意の bash コマンドを実行できます。 `config.yml` ファイルの構造の詳細については、「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」を参照してください。 **メモ:** このドキュメントに記載されているオプションの多くは、macOS ビルドでは機能しません。

### カスタム パッケージのインストール
{:.no_toc}

CircleCI には [Homebrew](https://brew.sh/index_ja) がプリインストールされているため、`brew install` を使用するだけで、ビルド VM に必要なほぼすべての依存関係を追加できます。 以下に例を示します。

        steps:
          - run:
              name: cowsay のインストール
              command: brew install cowsay
          - run:
              name: cowsay hi
              command: cowsay Hi!
    

必要な場合は、`sudo` コマンドを使用して、Homebrew 以外のカスタマイズも実行できます。

### 特定の Ruby バージョンの使用
{:.no_toc}

CircleCI の macOS コンテナには、複数のバージョンの Ruby が格納されています。 デフォルトのバージョンは、システムにインストールされている Ruby です。 コンテナには、そのコンテナがビルドされた時点で最新バージョンの、動作が安定している Ruby も含まれています。 CircleCI では、[Ruby-Lang.org のダウンロード ページ](https://www.ruby-lang.org/ja/downloads/)を基に、動作が安定している Ruby のバージョンを判断しています。 各イメージにインストールされている Ruby のバージョンは、[各コンテナのソフトウェア マニフェスト](#サポートされている-xcode-のバージョン)に記載されています。

マニフェストで「available to chruby (chruby で使用可)」と説明されている Ruby のバージョンでは、[`chruby`](https://github.com/postmodern/chruby) を使用してステップを実行できます。

#### macOS 10.15 (Catalina)/Xcode 11.2 以降を使用したイメージ

[`chruby`](https://github.com/postmodern/chruby) は Ruby のバージョンを指定できるプログラムで、イメージにインストールされています。 自動切り替え機能はデフォルトでは有効になっていません。 使用する Ruby のバージョンを指定するには、次のように `~/.bash_profile` の `chruby` 関数を呼び出します。

```yaml
run:
  name: Ruby バージョンの設定
  command: echo 'chruby ruby-2.6' >> ~/.bash_profile  # 2.6 を特定の Ruby バージョンに置き換えます
```

あるいは、[こちらの手順](https://github.com/postmodern/chruby#auto-switching)に従って、[自動切り替え機能を有効化](https://github.com/postmodern/chruby#auto-switching)することも可能です。

#### macOS 10.14 (Mojave)/Xcode 11.1 以前を使用したイメージ

macOS 10.14 以前 (Xcode 11.1 以前) を使用したビルド イメージには、デフォルトで `chruby` と[自動切り替え機能](https://github.com/postmodern/chruby#auto-switching)が有効になっています。

使用する Ruby のバージョンを指定するには、2 つの方法があります。 1 つは、[`chruby` で説明されているとおり、`.ruby-version` という名前のファイルを作成してリポジトリにコミットする方法](https://github.com/postmodern/chruby#auto-switching)です。 `.ruby-version` ファイルをソース管理にコミットしたくない場合は、ジョブ ステップでファイルを作成できます。

```yaml
run:
  name: Ruby バージョンの設定
  command:  echo "ruby-2.4" > ~/.ruby-version # 2.4 を特定の Ruby バージョンに置き換えます
```

**メモ:** Ruby のバージョンは、[macOS コンテナのソフトウェア マニフェスト](#サポートされている-xcode-のバージョン)に記載されている中から選択する必要があります。

プリインストールされていない Ruby のバージョンでジョブを実行するには、必要なバージョンの Ruby をインストールする必要があります。 必要なバージョンの Ruby をインストールするには、[ruby-install](https://github.com/postmodern/ruby-install) ツールを使用します。 インストールが完了したら、上記の方法で対象のバージョンを選択できるようになります。

### カスタム バージョンの CocoaPods と他の Ruby gem の使用
{:.no_toc}

ローカルで使用しているバージョンの CocoaPods を CircleCI のビルドでも使用するには、iOS プロジェクトで Gemfile を作成し、そこに CocoaPods バージョンを追加することをお勧めします。

    source 'https://rubygems.org'
    
    gem 'cocoapods', '= 1.3.0'
    

次に、Bundler を使用してインストールします。

{% raw %}
steps:
    
          - restore_cache:
              key: 1-gems-{{ checksum "Gemfile.lock" }}

      - run: bundle check || bundle install --path vendor/bundle
    
          - save_cache:
              key: 1-gems-{{ checksum "Gemfile.lock" }}
          paths:
                - vendor/bundle
{% endraw %}

次に、コマンドの前に `bundle exec` を記述して、確実に使用できるようにします。

        steps:
          - run: bundle exec pod install
    

## デプロイの構成

署名済みのアプリケーションを作成したら、デプロイを構成できます。 以下のいずれかを使用して、アプリケーションを簡単に配布できます。

- [iTunes Connect](https://itunesconnect.apple.com/)
- [HockeyApp](http://hockeyapp.net/)
- [Crashlytics (ベータ版)](http://try.crashlytics.com/beta/)
- [TestFairy](https://testfairy.com/)

使用するサービスに応じて、環境変数をセットアップする必要があります。

### HockeyApp
{:.no_toc}

1. HockeyApp にログインし、[トークン ページ](https://rink.hockeyapp.net/manage/auth_tokens)で新しい API トークンを作成します。 新しいビルドを HockeyApp にアップロードするには、使用するトークンに少なくともアップロード権限が必要です。

2. 新しい API トークンに「CircleCI Distribution」などの CircleCI に関連する名前を付けます。

3. トークンをコピーし、CircleCI にログインして、アプリケーションの [Project Settings (プロジェクト設定)] ページに移動します。

4. `HOCKEY_APP_TOKEN` という名前の新しい環境変数を作成し、その値としてトークンを貼り付けます。 これで、どのジョブでもこのトークンにアクセスできます。

### Crashlytics (ベータ版)
{:.no_toc}

1. Fabric.io にログインし、組織の設定ページにアクセスします。![Fabric.io のログイン]({{ site.baseurl }}/assets/img/docs/fabric-org-settings-page.png)

2. 対象の組織 (上図では CircleCI) をクリックし、[API key (API キー)] と [Build Secret (ビルド シークレット)] の各リンクをクリックして、それらの項目を表示させます。![Fabric.io の組織設定]({{ site.baseurl }}/assets/img/docs/fabric-api-creds-page.png)

3. CircleCI アプリケーションで、アプリケーションの [Project Settings (プロジェクト設定)] ページに移動し、[Environment Variables (環境変数)] に新しい項目として `CRASHLYTICS_API_KEY` と`CRASHLYTICS_SECRET` を追加し、それぞれ Crashlytics の Web サイトに表示された値を設定します。

### TestFairy
{:.no_toc}

TestFairy でアプリケーションをセットアップするには、以下の手順を行います。

![TestFairy の設定]({{ site.baseurl }}/assets/img/docs/testfairy-open-preferences.png)

1. TestFairy ダッシュボードで、[Preferences (設定)] ページに移動します。
2. [Preferences (設定)] ページの [API Key (API キー)] セクションに移動します。
3. API キーをコピーし、CircleCI アプリケーションでアプリケーションの [Project Settings (プロジェクト設定)] ページに移動します。
4. デプロイするには、[fastlane](https://docs.fastlane.tools/getting-started/ios/beta-deployment/) または `curl` を使用し、設定ファイルにジョブを追加します。以下の例を参照してください。


{% raw %}
```yaml
jobs:
  build:
    #  ビルド コードをここに挿入...
  deploy:
    steps:

      - checkout
      - run:
          name: TestFairy へのデプロイ
          command: |
            curl \
              -A "CircleCI 2.0" \
              -F api_key="$TESTFAIRY_API_KEY" \
              -F comment="CircleCI build $CIRCLE_BUILD_URL" \
              -F file=@path/to/ipafile.ipa \
              https://upload.testfairy.com/api/upload/

workflows:
  version: 2
  build-and-deploy:
    jobs:

      - build
      - deploy:
        requires:
          - build
        filters:
          branches:
            only: master

```
{% endraw %}

使用可能なすべてのオプションについては、[TestFairy のアップロード API に関するドキュメント](https://docs.testfairy.com/API/Upload_API.html)を参照してください。

## シミュレーターに関する一般的な問題の解決方法
{:.no_toc}

一部のプロジェクトでは、シミュレーター関連の問題が発生することがわかっています。 特に頻繁に発生している問題について説明します。

- **Xcode のバージョンが使用できない:** 各ビルド イメージにはいくつかのバージョンの Xcode がインストールされており、最新のリリースに伴い更新されていきます。 バージョン `10.0.0` を使用する場合は、ポイント リリース番号まで含めたフル バージョンを指定する必要があります。 一方、最新の Xcode 8.3 (`8.3.3` など) を使用する場合は、`config.yml` に `8.3` のみを指定します。 CircleCI 上で `8.3` バージョンと指定してあれば、8.3 の最新ポイント リリースが公開されたときに、そのまま最新ポイント リリースが使用できるようになります。

- **依存関係のバージョンが一致しない:** 想定と異なる依存関係のバージョンがジョブで使用されている場合は、キャッシュを使用せずにリビルドしてみてください。キャッシュ内の古い依存関係が原因となって、新しいバージョンのインストールが妨げられている可能性があります。

- **Cryptic でコンパイル エラーが発生する:** コンパイル時に原因不明のエラーが発生した場合は、ビルドで使用している Xcode のバージョンが、ローカルで使用しているバージョンと一致しているかどうかを確認してください。 プロジェクトの `config.yml` で Xcode のバージョンを指定していない場合は、古い Xcode がデフォルトで使用され、必要な機能がサポートされていない可能性があります。

- **Ruby でセグメンテーション違反が発生する:** ジョブの実行中に使用される Ruby gem の一部では、Ruby でセグメンテーション エラーが発生するケースが確認されています。 原因としては、gem のビルドに使用された Ruby のバージョンと、その実行に使用された Ruby のバージョンが異なることが考えられます。 ローカルで使用されている Ruby のバージョンが CircleCI で使用されているバージョンと一致していることを確認してください。 コンテナに新しいバージョンの Ruby をインストールする場合は、[こちらのガイド](https://discuss.circleci.com/t/installing-a-newer-ruby-version-on-ios-os-x-containers/2466)を参照してください。

- **テスト実行中に不規則なタイムアウトが発生する:** UI テストがタイムアウトになる場合は、[他のテストの前に](https://stackoverflow.com/questions/44361446/ios-uitests-failed-idetestoperationsobservererrordomain-code-13/48299184#48299184)実行してみてください。 また、`xcodebuild` コマンドまたは `xctool` コマンドもそのまま使用してみてください。 一部の問題は、これらのツールでのみ発生します。

- **コード署名証明書のインストール中にエラーが発生する:** iOS コード署名に関するドキュメントを参照してください。

- **多数の iOS アプリの開発者が、大量のコードを生成するツールを使用している:** この場合、CircleCI では Xcode のワークスペース、プロジェクト、またはスキームを正しく検出できないことがあります。 代わりに、環境変数を使用してそれらを指定できます。

### macOS ベースのビルドの制限事項
{:.no_toc}

現在、macOS 上の並列コンテナ間でのテストの分割はサポートされていません。 複数の Xcode バージョンを使用してビルドする場合、または複数のテスト ターゲットを実行する場合は、並列ジョブを含むワークフローを使用することをお勧めします。 並列ジョブを含むワークフローの例については、[こちらのドキュメント]({{ site.baseurl }}/2.0/workflows/#ワークフローの構成例)を参照してください。

## 複数の Executor タイプを含む構成例 (macOS と Docker)

同じワークフロー内で、複数の [Executor タイプ](https://circleci.com/ja/docs//2.0/executor-types/)を使用することができます。 以下の例では、プッシュされる iOS プロジェクトは macOS 上でビルドされ、その他の iOS ツール ([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker で実行されます。

{% raw %}

```yaml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "10.2.0"
    working_directory: /Users/distiller/project
    environment:
      FL_OUTPUT_DIR: output

    steps:

      - checkout
      - run:
          name: CocoaPods Specs のフェッチ
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: CocoaPods のインストール
          command: pod install --verbose

      - run:
          name: テストのビルドと実行
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests

      - store_test_results:
          path: output/scan
      - store_artifacts:
          path: output

  swiftlint:
    docker:

      - image: dantoml/swiftlint:latest
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:

      - image: dantoml/danger:latest
    steps:
      - checkout
      - run: danger

workflows:
  version: 2
  build-test-lint:
    jobs:

      - swiftlint
      - danger
      - build-and-test
```

{% endraw %}

## React Native プロジェクト
{:.no_toc}

React Native プロジェクトは、CircleCI 2.0 上で `macos` および `docker` の Executor タイプを使用してビルドできます。 React Native プロジェクトの例については、GitHub で公開されている [React Native アプリケーションのサンプル](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。

## 関連項目
{:.no_toc}

- CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
- 設定ファイルの詳しい説明については、「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)」を参照してください。