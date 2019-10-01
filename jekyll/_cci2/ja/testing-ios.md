---
layout: classic-docs
title: macOS 上の iOS アプリケーションのテスト
short-title: macOS 上の iOS アプリケーションのテスト
categories:
  - platforms
description: macOS 上の iOS アプリケーションのテスト
order: 30
---

ここでは、CircleCI を使用して iOS アプリケーションのテストを設定およびカスタマイズする方法について、以下のセクションに沿って説明します。

- 目次
{:toc}

**Note:** There is also documentation for [an iOS example project]({{ site.baseurl}}/2.0/ios-tutorial/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## 概要
{:.no_toc}

CircleCI offers support for building and testing iOS and macOS projects. Refer to the manifest of the software installed on CircleCI macOS build images in the Using a macOS Build Image document.

## macOS ビルドコンテナ

Each `macos` job is run a fresh container, running macOS. We build a new container each time a new version of Xcode is released by Apple. The contents of a particular build container remain unchanged (in very exceptional circumstances we might be forced to re-build a container). Our goal is to keep your builds environement stable, and to allow you to opt-in to newer containers by setting the `xcode` key in your `config.yml` file.

We announce the availability of new macOS containers in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

## サポートされている Xcode のバージョン

The currently available Xcode versions are:

- `11.1.0`: Xcode 11.1 (GM Seed) (Build 11A1027) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1226/index.html)
- `11.0.0`: Xcode 11.0 (Build 11A420a) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1136/index.html)
- `10.3.0`: Xcode 10.3 (Build 10G8) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-903/index.html)
- `10.2.1`: Xcode 10.2.1 (Build 10E1001) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-594/index.html)
- `10.1.0`: Xcode 10.1 (Build 10B61) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-474/index.html)
- `10.0.0`: Xcode 10.0 (Build 10A255) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-456/index.html)
- `9.4.1`: Xcode 9.4.1 (Build 9F2000) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-430/index.html)
- `9.3.1`: Xcode 9.3.1 (Build 9E501) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-419/index.html)
- `9.0.1`: Xcode 9.0.1 (Build 9A1004) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-282/index.html)
- `8.3.3`: Xcode 8.3.3 (Build 8E3004b) [installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html)

## はじめよう

Select a macOS project you would like to build on the Add Projects page of the CircleCI application. **Note:** Changing build environment is no longer needed in 2.0. If your project is not listed as macOS, choose Linux project and then select macOS in the Operating System section.

## 基本的なセットアップ

After enabling macOS builds for your project, share the scheme that is going to be built on CircleCI so that CircleCI runs the correct build actions. Complete the following steps to share an existing scheme in Xcode:

1. [Product (プロダクト)] > [Scheme (スキーム)] > [Manage Schemes (スキーム管理)] の順に選択します。
2. 共有したいスキームの [Shared (共有する)] オプションを選択し、[Close (閉じる)] をクリックします。
3. [Source Control (ソース管理)] > [Commit (コミットする)] の順に選択します。
4. 共有データフォルダーを選択します。
5. テキストフィールドにコミットメッセージを入力します。
6. プロジェクトを Git で管理している場合は、[Push to remote (リモートにプッシュする)] オプションを設定します。
7. [Commit Files (ファイルをコミットする)] ボタンをクリックします。 新しい `.xcscheme` ファイルが Xcode プロジェクトの下の `xcshareddata/xcschemes` フォルダーに格納されます。
8. CircleCI からアクセスできるように、このファイルを Git リポジトリにコミットします。

Simple projects should run with minimal configuration. You can find an example of a minimal config in the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/).

### ベストプラクティス
{:.no_toc}

In addition to the basic setup steps, it is best practice to include downloading CocoaPods specs from the CircleCI mirror (up to 70% faster) and linting the Swift code together with the `build-and-test` job:

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "10.2.0"
    environment:
      FL_OUTPUT_DIR: output
    steps:
      - checkout
      - run:
          name: Fetch CocoaPods Specs
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: Install CocoaPods
          command: pod install --verbose

      - run:
          name: Build and run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests

      - store_test_results:
          path: output/scan
      - store_artifacts:
          path: output

workflows:
  version: 2
  build-and-test:
    jobs:

      - build-and-test
```

## 高度なセットアップ

For advanced setup, it is possible to run a lint job together with your build and test job, and potentially also run tools like [Danger](https://github.com/danger/danger).

The recommended configuration can be extended to add a lint job and a Danger job as follows:

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

[Fastlane](https://fastlane.tools/) is a set of tools for automating the build and deploy process of mobile apps. We encourage the use of Fastlane on CircleCI as that allows for parity of build / deploy locally and on CircleCI, and simplifies the setup process.

### Gemfile の追加
{:.no_toc}

It is recommended to add a `Gemfile` to your repository to make sure that the same version of Fastlane is used both locally and on CircleCI. The simplest `Gemfile` could look like this:

    # Gemfile
    source "https://rubygems.org"
    gem 'fastlane'
    

After you have created a `Gemfile` locally, you will need to run `bundle install` and check both `Gemfile` and `Gemfile.lock` into your repository.

### CircleCI 上で使用する場合の fastlane の設定
{:.no_toc}

When using Fastlane in your CircleCI project, we recommend adding the following to your `Fastfile`:

    # fastlane/Fastfile
    
    ...
    platform :ios do
      before_all do
        setup_circle_ci
      end
      ...
    end
    

The `setup_circle_ci` Fastlane action must be in the `before_all` block to perform the following actions:

- fastlane match で使用する一時的なキーチェーンを新しく作成する (詳細については、コード署名のセクションを参照してください)。
- fastlane match を `readonly` モードに切り替えて、CI が新しいコード署名証明書やプロビジョニングプロファイルを作成しないようにする。
- 収集しやすくなるように、ログやテスト結果のパスを設定する。

### CircleCI で fastlane を使用する場合の設定例
{:.no_toc}

A basic Fastlane configuration that can be used on CircleCI is as follows:

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
    

This configuration can be used with the following CircleCI config file:

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

The environment variable `FL_OUTPUT_DIR` is the artifact directory where FastLane logs should be stored. Use this to set the path in the `store_artifacts` step to automatically save logs such as Gym and Scan.

### Reducing Testing Time

By default, Fastlane Scan generates test output reports in `html` and `junit` formats. If your tests are taking a long time and you do not need these reports, consider disabling them by altering the `output_type` parameter as described in the [fastlane docs](https://docs.fastlane.tools/actions/run_tests/#parameters).

### Using CocoaPods
{:.no_toc}

If you are using CocoaPods, then we recommend that you check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control). This will ensure that you have a deterministic, reproducible build.

## サポートされているビルドおよびテストのツール

In CircleCI 2.0 it is possible to customize your build as needed to satisfy almost any iOS build and test strategy.

### XCTest-based tools
{:.no_toc}

The following test tools are known to work well on CircleCI (though many others should work just fine):

- [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
- [Kiwi](https://github.com/kiwi-bdd/Kiwi)
- [KIF](https://github.com/kif-framework/KIF)

### Other Tools
{:.no_toc}

Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also work normally and are installed and called using `run` commands.

### Pre-Starting the Simulator
{:.no_toc}

Pre-start the iOS simulator before building your application to make sure that the simulator is booted in time. Doing so generally reduces the number of simulator timeouts observed in builds.

To pre-start the simulator, add the following to your `config.yml` file, assuming that you are running your tests on an iPhone 7 simulator with iOS 10.2:

        steps:
          - run:
              name: シミュレーターを事前に起動
              command: xcrun instruments -w "iPhone 7 (10.2) [" || true
    

**Note:** the `[` character is necessary to uniquely identify the iPhone 7 simulator, as the phone + watch simulator is also present in the build image:

- iPhone シミュレーター：`iPhone 7 (10.2) [<uuid>]`
- iPhone と Apple Watch のペア：`iPhone 7 Plus (10.2) + Apple Watch Series 2 - 42mm (3.1) [<uuid>]`

### Creating a `config.yml` File
{:.no_toc}

The most flexible means to customize your build is to add a `.circleci/config.yml` file to your project, which allows you to run arbitrary bash commands at various points in the build process. See the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document for a detailed discussion of the structure of the `config.yml` file. **Note:** A number of options in the document will not work for macOS builds.

### Installing Custom Packages
{:.no_toc}

[Homebrew](http://brew.sh/) is pre-installed on CircleCI, so you can simply use `brew install` to add nearly any dependency required in your build VM. Here's an example:

        steps:
          - run:
              name: cowsay をインストール
              command: brew install cowsay
          - run:
              name: cowsay hi
              command: cowsay Hi!
    

It is also possible to use the `sudo` command if necessary to perform customizations outside of Homebrew.

### Using Custom Ruby Versions
{:.no_toc}

Our macOS containers contain multiple versions of Ruby. The default version is the system-installed Ruby. The containers also include the latest stable versions of Ruby at the time that the container is built. We determine the stable versions of Ruby using the [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/). The version of Ruby that are installed in each image are listed in the [software manifests of each container](#supported-xcode-versions).

If you want to run steps with a version of Ruby that is listed as "available to chruby" in the manifest, then you can use [`chruby`](https://github.com/postmodern/chruby) to do so.

To specify a version of Ruby to use, there are two options. You can [create a file named `.ruby-version` and commit it to your repository, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching). If you do not want to commit a `.ruby-version` file to source control, then you can create the file from a job step:

```yaml
run:
  name: Set Ruby Version
  command:  echo "ruby-2.4" > ~/.ruby-version # Replace 2.4 with the specific version of Ruby here.
```

**Note:** The version of Ruby that you select must be one of the versions listed in the [software manifests of your macOS container](#supported-xcode-versions).

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby. We use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the technique above.

### Using Custom Versions of CocoaPods and Other Ruby Gems
{:.no_toc}

To make sure the version of CocoaPods that you use locally is also used in your CircleCI builds, we suggest creating a Gemfile in your iOS project and adding the CocoaPods version to it:

    source 'https://rubygems.org'
    
    gem 'cocoapods', '= 1.3.0'
    

Then you can install these using bundler:

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

You can then ensure you are using those, by prefixing commands with `bundle exec`:

        steps:
          - run: bundle exec pod install
    

## デプロイの設定

After you have a signed app you are ready to configure deployment. Distributing the app is easy with one of the following:

- [iTunes Connect](https://itunesconnect.apple.com/)
- [HockeyApp](http://hockeyapp.net/)
- [Crashlytics (ベータ版)](http://try.crashlytics.com/beta/)
- [TestFairy](https://testfairy.com/)

Then you should set up environment variables for your service of choice:

### Hockey App
{:.no_toc}

1. HockeyApp にログインし、[トークンページ](https://rink.hockeyapp.net/manage/auth_tokens)で新しい API トークンを作成します。 新しいビルドを HockeyApp にアップロードするには、使用するトークンに少なくともアップロード権限が必要です。

2. 新しい API トークンに「CircleCI Distribution」などの CircleCI に関連する名前を付けます。

3. トークンをコピーし、CircleCI にログインして、アプリケーションの [Project Settings (プロジェクト設定)] ページに移動します。

4. `HOCKEY_APP_TOKEN` という名前の新しい環境変数を作成し、その値としてトークンをペーストします。 これで、どのジョブでもこのトークンにアクセスできます。

### Beta By Crashlytics
{:.no_toc}

1. Fabric.io にログインし、組織の設定ページにアクセスします。![Fabric.io のログイン]({{ site.baseurl }}/assets/img/docs/fabric-org-settings-page.png)

2. Click your organization (CircleCI in the image above), and click the API key and Build Secret links to reveal the items. ![Fabric.io の組織設定]({{ site.baseurl }}/assets/img/docs/fabric-api-creds-page.png)

3. CircleCI アプリケーションで、アプリケーションの [Project Settings (プロジェクト設定)] ページに移動し、[Environment Variables (環境変数)] に新しい項目として `CRASHLYTICS_API_KEY` と`CRASHLYTICS_SECRET` を追加し、それぞれ Crashlytics のWeb サイトに表示された値を設定します。

### TestFairy
{:.no_toc}

To set up your app on TestFairy, follow these steps:

![TestFairy preferences image]({{ site.baseurl }}/assets/img/docs/testfairy-open-preferences.png)

1. TestFairy ダッシュボードで、[Preferences (設定)] ページに移動します。
2. [Preferences (設定)] ページの [API Key (API キー)] セクションに移動します。
3. API キーをコピーし、CircleCI アプリケーションでアプリケーションの [Project Settings (プロジェクト設定)] ページに移動します。
4. デプロイするには、[fastlane](https://docs.fastlane.tools/getting-started/ios/beta-deployment/) または `curl` を使用し、設定にジョブを追加します。以下の例を参照してください。


{% raw %}
```yaml
jobs:
  build:
    #  insert build code here...
  deploy:
    steps:

      - checkout
      - run:
          name: Deploy to TestFairy
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

For a complete list of available options, please visit the [TestFairy Upload API documentation](https://docs.testfairy.com/API/Upload_API.html)

## シミュレーターに関する一般的な問題の解決方法
{:.no_toc}

A series of simulator-related issues are known to happen on some projects. Here are the most frequent of those:

- **Xcode のバージョンが使用できない：**各ビルドイメージにはいくつかのバージョンの Xcode がインストールされており、最新のリリースに伴い更新されていきます。 For version `10.0.0`, you must specify the full version, down to the point release number. 一方、最新の Xcode 8.3 (`8.3.3` など) を使用する場合は、`config.yml` に `8.3` のみを指定します。 CircleCI 上で `8.3` バージョンと指定してあれば、8.3 の最新ポイントリリースが公開されたときに、そのまま最新ポイントリリースが使用できるようになります。

- **依存関係のバージョンが一致しない：**想定とは異なる依存関係のバージョンがジョブで使用されている場合は、キャッシュを使用せずにリビルドしてみてください。キャッシュ内の古い依存関係が原因となって、新しいバージョンのインストールが妨げられている可能性があります。

- **Cryptic でコンパイルエラーが発生する：**コンパイル時に原因不明のエラーが発生した場合は、ビルドで使用している Xcode のバージョンが、ローカルで使用しているバージョンと一致しているかどうかを確認してください。 プロジェクトの `config.yml` で Xcode のバージョンを指定していない場合は、古い Xcode がデフォルトで使用され、必要な機能がサポートされていない可能性があります。

- **Ruby でセグメンテーション違反が発生する：**ジョブの実行中に使用される Ruby gem の一部によって、Ruby でセグメンテーションエラーが発生するケースが確認されています。 原因としては、gem のビルドに使用された Ruby のバージョンと、その実行に使用された Ruby のバージョンが異なることが考えられます。 ローカルで使用されている Ruby のバージョンが CircleCI で使用されているバージョンと一致していることを確認してください。 コンテナに新しいバージョンの Ruby をインストールする場合は、[こちらのガイド](https://discuss.circleci.com/t/installing-a-newer-ruby-version-on-ios-os-x-containers/2466)を参照してください。

- **テストラン中に不規則なタイムアウトが発生する：**UI テストがタイムアウトになる場合は、[他のテストの前に](https://stackoverflow.com/questions/44361446/ios-uitests-failed-idetestoperationsobservererrordomain-code-13/48299184#48299184)実行してみてください。 また、`xcodebuild` コマンドまたは `xctool` コマンドもそのまま使用してみてください。 一部の問題は、これらのツールでのみ発生します。

- **コード署名証明書のインストール中にエラーが発生する：**iOS コード署名に関するドキュメントを参照してください。

- **多数の iOS アプリの開発者が、大量のコードを生成するツールを使用している：**この場合、CircleCI では Xcode のワークスペース、プロジェクト、またはスキームを正しく検出できないことがあります。 代わりに、環境変数を使用してそれらを指定できます。

### Constraints on macOS-based Builds
{:.no_toc}

Splitting tests between parallel containers on macOS is currently not supported. We suggest using a workflow with parallel jobs to build with different Xcode versions, or a workflow with parallel jobs to run different test targets. Please check [this doc]({{ site.baseurl }}/2.0/workflows/#workflows-configuration-examples) for examples of workflows with parallel jobs.

## 複数の Executor タイプを含む設定例 (macOS と Docker)

It is possible to use multiple [executor types](https://circleci.com/docs/2.0/executor-types/) in the same workflow. In the following example each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

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
          name: Fetch CocoaPods Specs
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: Install CocoaPods
          command: pod install --verbose

      - run:
          name: Build and run tests
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

React Native projects can be built on CircleCI 2.0 using `macos` and `docker` executor types. Please check out [this example React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native) on GitHub for a full example of a React Native project.

## 関連項目
{:.no_toc}

- CircleCI 2.0 で fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
- コンフィグの詳しい説明については、「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)」を参照してください。