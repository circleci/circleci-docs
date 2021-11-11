---
layout: classic-docs
title: iOS アプリケーションのデプロイ
short-title: iOS アプリケーションのデプロイ
categories:
  - プラットフォーム
description: iOS アプリケーションのデプロイ
order: 1
version:
  - Cloud
---

ここでは、CircleCI 上で iOS アプリを配信サービスに自動的にデプロイするための fastlane の設定方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

fastlane を使用して、iOS アプリを様々なサービスに自動的にデプロイすることができます。 これにより、iOS アプリのベータ版またはリリース版を対象ユーザーに配信するために必要な手動のステップが不要になります。

デプロイレーンをテストレーンと組み合わせることで、ビルドとテストが成功したアプリは自動的にデプロイされます。

**注意:** 以下のデプロイ例を使用するには、コード署名がプロジェクト用に設定されている必要があります。 コード署名のセットアップ方法については、 [コード署名に関するドキュメント]({{ site.baseurl }}/2.0/ios-codesigning/)をご覧ください。

## ベストプラクティス
{: #best-practices }

### Git ブランチの使用
{: #using-git-branches }

リリースレーンは、Git リポジトリの特定のブランチでのみ実行することをお勧めします。例えば、専用のリリース/ベータブランチなどです。 そうすることで、指定したブランチへのマージが成功した場合にのみリリースが可能となり、開発期間中にプッシュがコミットされるたびにリリースが行われることを防ぐことができます。 また、iOSアプリのバイナリのサイズによっては外部サービスへのアップロードに時間がかかる場合があるため、ジョブ完了までの時間を短縮することができます。 これを実行するためのワークフローのセットアップ方法については、[ブランチレベルでのジョブの実行]({{ site.baseurl }}/2.0/workflows/#branch-level-job-execution)をご覧ください。

### ビルド番号の設定
{: #setting-the-build-number }

デプロイサービスにアップロードする際には、iOS アプリのバイナリのビルド番号を考慮することが重要です。 一般的には、 `.xcproject` で設定されていますが、一意になるように手動で更新する必要があります。 各デプロイレーンの実行前にビルド番号が更新されていない場合、受信サービスがビルド番号の競合によりバイナリを拒否することがあります。

fastlane は、レーン実行中にビルド番号を変更できる `increment_build_number` [アクション](https://docs.fastlane.tools/actions/increment_build_number/) を提供しています。 たとえば、特定の CircleCI ジョブにビルド番号を関連付けたい場合は、 環境変数 `$CIRCLE_BUILD_NUM` の使用を検討してください。

```ruby
increment_build_number(
  build_number: "$CIRCLE_BUILD_NUM"
)
```

## App Store Connect
{: #app-store-connect }

### 設定
{: #setting-up }

fastlane が iOS バイナリを App Store Connect や TestFlight に自動的にアップロードするように設定するには、fastlane が App Store Connect アカウントにアクセスできるよういくつかのステップを実施する必要があります。

この設定には、App Store Connect APIキーを生成して使用することをお勧めします。 それにより、Apple ID で必須となっている 2FA で問題が発生することを防ぎ、最も確実な方法でサービスを利用することができます。

API キーを作成するには、 [Apple 開発者向けドキュメント](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)で説明されている手順に従ってください。 その結果 `.p8` を取得したら、[App Store Connect API キーのページ](https://appstoreconnect.apple.com/access/api)に表示される*発行者 ID* と*キー ID* をメモします。

**注意:** `.p8` ファイルをダウンロードし、安全な場所に保存したことを確認してください。 App Store Connect のポータルから離れてしまうと、ファイルを再度ダウンロードすることはできません。

次に、いくつかの環境変数を設定する必要があります。 CircleCI プロジェクトで、 **ビルド設定 > 環境変数** に移動し、以下を設定します。

* 発行者 ID に、`APP_STORE_CONNECT_API_KEY_ISSUER_ID`  (例：`6053b7fe-68a8-4acb-89be-165aa6465141`)
* キー ID に、`APP_STORE_CONNECT_API_KEY_KEY_ID`    (例: `D383SF739`)
* `.p8` ファイルの内容に、`APP_STORE_CONNECT_API_KEY_KEY`   (例: `-----BEGIN PRIVATE KEY-----\nMIGTAgEAMGByqGSM49AgCCqGSM49AwEHBHknlhdlYdLu\n-----END PRIVATE KEY-----`)

**注意:** `.p8` ファイルの内容を確認するには、テキストエディターで開きます。 各行を `\n` に置き換えて、1つの長い文字列にする必要があります。

最後に、fastlane ではどの Apple ID を使用するか、またどのアプリの識別子をターゲットにするかを知るために、いくつかの情報が要求されます。 これらの情報は、 `fastlane/Appfile` で以下のように設定できます。

```ruby
# fastlane/Appfile
apple_id "ci@yourcompany.com"
app_identifier "com.example.HelloWorld"
```

この設定が完了すると、App Store Connect と連動するアクション (`pilot` や `deliver`など) を呼び出す前に、レーン内で `app_store_connect_api_key` を呼び出すだけでよくなります。

### App Store へのデプロイ
{: #deploying-to-the-app-store }

下記の例は、バイナリをビルドして署名し、App Store Connect にアップロードする基本的なレーンです。 fastlane が提供する `deliver` アクションは、App Store への申請プロセスを自動化する強力なツールです。

また、メタデータやスクリーンショット ([screenshot](https://docs.fastlane.tools/actions/snapshot/) や [frameit](https://docs.fastlane.tools/actions/frameit/) アクションで生成可能) を自動的にアップロードするなど、さまざまなオプションが可能です。 設定の詳細については、fastlane の [配信に関するドキュメント](https://docs.fastlane.tools/actions/deliver/)を参照してください。

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload Release to App Store"
  lane :upload_release do
    # プロジェクトからバージョン番号を取得します。
    # App Store Connect で既に使用可能な最新のビルドと照合します。
    # ビルド番号を１増やします。 使用可能なビルドがない場合は、
    # 1 から始めます。
    increment_build_number(
      build_number: app_store_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloCircle.xcodeproj"),
        live: false
      ) + 1,
    )
    # 配信コード署名を設定し、アプリをビルドします。
    match(type: "appstore")
    gym(scheme: "HelloCircle")
    #App Store Connect にバイナリをアップロードします。
    deliver(
      submit_for_review: false,
      force: true
    )
  end
end
```

### TestFlight へのデプロイ
{: #deploying-to-testflight }

TestFlight は、App Store Connect と連動した Apple のベータ版配信サービスです。 fastlane は、TestFlight の配信管理が簡単に行える`pilot` アクションを提供しています。

下記の例では、 iOS バイナリを自動的にビルド、署名、アップロードするように fastlane を設定する方法を紹介しています。 Pilot には TestFlight にアプリを配信するためのカスタムオプションがたくさんあります。その詳細を [Pilot のドキュメント](https://docs.fastlane.tools/actions/pilot/)で詳細をぜひご確認ください。

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload to Testflight"
  lane :upload_testflight do
    # プロジェクトからバージョン番号を取得します。
    # TestFlight で既に利用可能な最新のビルドと照合します。
    # ビルド番号を 1 増やします。 使用可能なビルドがない場合は、
    # 1 から始めます。
    increment_build_number(
      build_number: latest_testflight_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloWorld.xcodeproj")
      ) + 1,
    )
    # 配信コード署名を設定し、アプリをビルドします。
    match(type: "appstore")
    gym(scheme: "HelloWorld")
    # TestFlight にバイナリをアップロードし、
    # 設定したベータ版のテストグループに自動的にパブリッシュします。
    pilot(
      distribute_external: true,
      notify_external_testers: true,
      groups: ["HelloWorld Beta Testers"],
      changelog: "This is another new build from CircleCI!"
    )
  end
end
```

## Firebase へのデプロイ
{: #deploying-to-firebase }

Firebaseは、Google が提供する配信サービスです。 Firebase へのデプロイは、 [Firebase アプリ配信プラグイン](https://github.com/fastlane/fastlane-plugin-firebase_app_distribution)をインストールすることで簡単に行うことができます。

### Fastlane プラグインのセットアップ
{: #fastlane-plugin-setup }

プロジェクトにプラグインをセットアップするには、ローカルマシンのターミナルでプロジェクトディレクトリを開き、コマンド `fastlane add_plugin firebase_app_distribution` を実行します。 するとプラグインがインストールされ、必要な情報が `fastlane/Pluginfile` と `Gemfile` に追加されます。

**注意:** `bundle install` ステップにより、ジョブの実行中にこのプラグインをインストールできるよう両方のファイルを Git レポジトリに組み込んでおくことが重要です。

### CLI トークンの生成
{: #generating-a-cli-token }

Firebase requires a token to used during authentication. To generate the token, we need to use the Firebase CLI and a browser - as CircleCI is a headless environment, we will need to generate this token locally, rather than at runtime, then add it to CircleCI as an environment variable.

1. Download and install the Firebase CLI locally with the command `curl -sL https://firebase.tools | bash`
2. Trigger a login by using the command `firebase login:ci`
3. Complete the sign in via the browser window, then copy the token provided in the Terminal output
4. Go to your project settings in CircleCI and create a new environment variable named `FIREBASE_TOKEN` with the value of the token.

### Fastlane configuration
{: #fastlane-configuration }

The Firebase plugin requires minimal configuration to upload an iOS binary to Firebase. The main parameter is `app` which will require the App ID set by Firebase. To find this, go to your project in the [Firebase Console](https://console.firebase.google.com), then go to `Settings -> General`. Under "Your apps", you will see the list of apps that are part of the project and their information, including the App ID (generally in the format of `1:123456789012:ios:abcd1234abcd1234567890`).

For more configuration options, see the [Firebase Fastlane plugin documentation](https://firebase.google.com/docs/app-distribution/ios/distribute-fastlane#step_3_set_up_your_fastfile_and_distribute_your_app).

```ruby
# Fastlane/fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload to Firebase"
  lane :upload_firebase do
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    firebase_app_distribution(
      app: "1:123456789012:ios:abcd1234abcd1234567890",
      release_notes: "This is a test release!"
    )
  end
end
```

To use the Firebase Fastlane plugin, the Firebase CLI must be installed as part of the job via the `curl -sL https://firebase.tools | bash` command:

```yaml
version: 2.1
jobs:
  adhoc:
    macos:
      xcode: "11.3.1"
    environment:
      FL_OUTPUT_DIR: output
    steps:
      - checkout
      - run: echo 'chruby ruby-2.6' >> ~/.bash_profile
      - run: bundle install
      - run: curl -sL https://firebase.tools | bash
      - run: bundle exec fastlane upload_firebase

workflows:
  adhoc-build:
    jobs:
      - adhoc
```

**Note:** The Firebase plugin may cause errors when run with the macOS system Ruby. It is therefore advisable to [switch to a different ruby version]({{ site.baseurl }}/2.0/testing-ios/#using-ruby)

## Deploying to Visual Studio App Center
{: #deploying-to-visual-studio-app-center }

Visual Studio App Center, formally HockeyApp, is a distribution service from Microsoft. App Center integration with Fastlane is enabled by installing the [App Center plugin](https://github.com/microsoft/fastlane-plugin-appcenter).

### Fastlane Plugin Setup
{: #fastlane-plugin-setup }

To set up the plugin for your project, On your local machine open your project directory in Terminal and run the command `fastlane add_plugin appcenter`. This will install the plugin and add the required information to `fastlane/Pluginfile` and your `Gemfile`.

**Note:** It is important that both of these files are checked into your git repo so that this plugin can be installed by CircleCI during the job execution via a `bundle install` step.

### App Center Setup
{: #app-center-setup }

First, the app needs to be created in VS App Center.

1. Log in, or sign up, to [Visual Studio App Center](https://appcenter.ms/)
2. At the top-right of the page, click on "Add New", then select "Add New App"
3. Fill out the required information in the form as required

Once this is complete you will need to generate an API token to allow Fastlane to upload to App Center.

1. Go to the [API Tokens](https://appcenter.ms/settings/apitokens) section in Settings
2. Click on "New API Token"
3. Enter a description for the token, then set the access to "Full Access"
4. When the token is generated, make sure to copy it somewhere safe.
5. Go to your project settings in CircleCI and create a new environment variable named `VS_API_TOKEN` with the value of the API Key.

### Fastlane configuration
{: #fastlane-configuration }

Below is an example of a lane that distributes beta app builds to Visual Studio App Center. Both the username of your App Center account and an API Token with "Full Access" is required to upload the binary to App Center.

```ruby
# Fastlane/fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to VS App Center"
  lane :upload_appcenter do
    # Here we are using the CircleCI job number
    # for the build number
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    # Set up Adhoc code signing and build  the app
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    # Set up the required information to upload the
    # app binary to VS App Center
    appcenter_upload(
      api_token: ENV[VS_API_TOKEN],
      owner_name: "YOUR_VS_APPCENTER_USERNAME",
      owner_type: "user",
      app_name: "HelloWorld"
    )
  end
end
```

## Uploading to TestFairy
{: #uploading-to-testfairy }

[TestFairy](https://www.testfairy.com) is another popular Enterprise App distribution and testing service. Fastlane has built in support for TestFairy making it quick and easy to upload new builds to the service.

![TestFairy preferences image](  {{ site.baseurl }}/assets/img/docs/testfairy-open-preferences.png)

1. On the TestFairy dashboard, navigate to the Preferences page.
2. On the Preferences page, go to the API Key section and copy your API Key.
3. Go to your project settings in CircleCI and create a new environment variable named `TESTFAIRY_API_KEY` with the value of the API Key.

### Fastlane configuration
{: #fastlane-configuration }

To configure uploading to TestFairy within Fastlane, see the following example:

```ruby
# Fastlane/fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to TestFairy"
  lane :upload_testfairy do
    # Here we are using the CircleCI job number
    # for the build number
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    # Set up Adhoc code signing and build  the app
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    # Set up the required information to upload the
    # app binary to VS App Center
    testfairy(
      api_key: ENV[TESTFAIRY_API_KEY],
      ipa: 'path/to/ipafile.ipa',
      comment: ENV[CIRCLE_BUILD_URL]
    )
  end
end
```
