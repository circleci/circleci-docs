---
layout: classic-docs
title: iOS アプリのデプロイ
description: iOS アプリのデプロイ
redirect-from: /ja/deploying-ios
contentTags:
  platform:
    - クラウド
---

ここでは、CircleCI 上で iOS アプリを配信サービスに自動的にデプロイするための [fastlane](https://fastlane.tools/) の設定方法について説明します。

## 概要
{: #overview }

CircleCI では、fastlane を使用することにより iOS アプリを自動的に様々なサービスにデプロイできます。 これにより、iOS アプリのベータ版やリリース版を対象ユーザーに配信する際の手動作業が不要になります。

デプロイ _レーン_ をテスト _レーン_ と組み合わせると、ビルドとテストが成功したアプリが自動的にデプロイされます。

下記のデプロイ例を使用するには、プロジェクトにコード署名が設定されている必要があります。 コード署名の設定方法については、 [コード署名の設定]({{site.baseurl}}/ja/ios-codesigning/)をご覧ください。
{: class="alert alert-note"}

## ベストプラクティス
{: #best-practices }

### Git ブランチの使用
{: #use-git-branches }

リリースレーンは、Git リポジトリの特定のブランチ (専用のリリース/ベータブランチなど) でのみ実行することをお勧めします。 そうすることで、指定したブランチへのマージが成功した場合のみリリースが可能となり、開発段階においてプッシュがコミットされるたびにリリースされるのを防ぐことができます。 また、iOS アプリのバイナリのサイズによっては外部サービスへのアップロードに時間がかかる場合があるため、ジョブ完了までの時間を短縮することができます。 これを実行するためのワークフローの設定方法については、[ブランチレベルでのジョブの実行]({{site.baseurl}}/ja/workflows/#branch-level-job-execution)をご覧ください。

### ビルド番号の設定
{: #set-the-build-number }

デプロイサービスにアップロードする際は、iOS アプリのバイナリのビルド番号にご注意ください。 一般的には、 `.xcproject` で設定されていますが、一意になるように手動で更新する必要があります。 各デプロイレーンの実行前にビルド番号が更新されていないと、受信サービスがビルド番号の競合によりバイナリを拒否する場合があります。

fastlane により、レーン実行中にビルド番号を変更できる [`increment_build_number `アクション](https://docs.fastlane.tools/actions/increment_build_number/) が可能です。 たとえば、ビルド番号を特定の CircleCI ジョブに関連付けたい場合には、 環境変数 `$CIRCLE_BUILD_NUM` の使用を検討してください。

```ruby
increment_build_number(
  build_number: "$CIRCLE_BUILD_NUM"
)
```

## fastlane との連携のための CircleCI 設定ファイル
{: #circleci-config-for-fastlane-integration }

このページのすべてのコード例では、fastlane を使ってデプロイの設定をしています。 各コード例では、以下の `.circleci/config.yml` の設定例を使って、fastlane のセットアップを CircleCIと連携することができます。 以下のサンプル設定ファイルは、お客様のプロジェクトのニーズに合わせて編集してください。

環境変数 `FL_OUTPUT_DIR` は、fastlane ログと署名済み `.ipa` ファイルを保存するアーティファクトディレクトリです。 この環境変数を使用して、ログを自動的に保存し、fastlane からアーティファクトをビルドするためのパスを `store_artifacts` ステップで設定します。
{: class="alert alert-note"}

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 14.2.0
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
      xcode: 14.2.0
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

このコード例では、デプロイブランチにプッシュすると、`adhoc` ジョブによりデプロイビルドの作成や Testflight へのアップロードが可能になります。

## App Store Connect
{: #app-store-connect }

## App Store Connect で設定
{: #set-up-app-store }

fastlane が iOS バイナリを App Store Connect や TestFlight に自動的にアップロードするように設定するには、fastlane が App Store Connect アカウントにアクセスできるよういくつかのステップを実施する必要があります。

この設定には、App Store Connect API キーを生成して使用することをお勧めします。 それにより、Apple ID で必須となっている 2FA で問題が発生することを防ぎ、最も確実な方法でサービスを利用することができます。

API キーを作成するには、 [Apple 開発者向けドキュメント](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)で説明されている手順に従ってください。 その結果 `.p8` を取得したら、[App Store Connect API キーのページ](https://appstoreconnect.apple.com/access/api)に表示される*発行者 ID* と*キー ID* をメモします。

**注:** `.p8` ファイルをダウンロードし、安全な場所に保存したことを確認してください。 App Store Connect のポータルから離れてしまうと、ファイルを再度ダウンロードすることはできません。
{: class="alert alert-info" }

次に、いくつかの環境変数を設定する必要があります。 CircleCI プロジェクトで、 **ビルド設定 > 環境変数** に移動し、以下を設定します。

* 発行者 ID に、`APP_STORE_CONNECT_API_KEY_ISSUER_ID`
  * (例：`6053b7fe-68a8-4acb-89be-165aa6465141`)
* キー ID に、`APP_STORE_CONNECT_API_KEY_KEY_ID`
  * (例: `D383SF739`)
* `.p8` ファイルの内容に、`APP_STORE_CONNECT_API_KEY_KEY`
  * (例: `-----BEGIN PRIVATE KEY-----\nMIGTAgEAMGByqGSM49AgCCqGSM49AwEHBHknlhdlYdLu\n-----END PRIVATE KEY-----`)

**注:**  `.p8` ファイルの内容を確認するには、テキストエディターで開きます。 各行を `\n` に置き換えて、1つの長い文字列にする必要があります。
{: class="alert alert-info" }

最後に、fastlane ではどの Apple ID を使用するか、またどのアプリケーションをターゲットにするかを知るために、いくつかの情報が要求されます。 Apple ID とアプリケーションのバンドル ID は、`fastlane/Appfile` で次のように設定できます。

```ruby
# fastlane/Appfile
apple_id "ci@yourcompany.com"
app_identifier "com.example.HelloWorld"
```

App Store Connect と Apple Developer Portal に別々の認証情報を使う必要がある場合は、[Fastlane Appfile に関するドキュメント](https://docs.fastlane.tools/advanced/Appfile/)で詳細をご確認ください。

この設定が完了すると、App Store Connect と連動するアクション (`pilot` や `deliver`など) を呼び出す前に、レーン内で [`app_store_connect_api_key`](http://docs.fastlane.tools/actions/app_store_connect_api_key/#app_store_connect_api_key) を呼び出すだけでよくなります。

### 1.  App Store へのデプロイ
{: #deploy-to-the-app-store }

下記の例は、バイナリをビルドして署名し、App Store Connect にアップロードする基本的なレーンです。 fastlane が提供する [`deliver` アクション](http://docs.fastlane.tools/actions/deliver/#deliver/)は、App Store への申請プロセスを自動化する強力なツールです。

また、メタデータやスクリーンショット ([`snapshot`](https://docs.fastlane.tools/actions/snapshot/) や [frameit](https://docs.fastlane.tools/actions/frameit/) アクションで生成可能) を自動的にアップロードするなど、さまざまなオプションが可能です。 設定の詳細については、fastlane の [`deliver` に関するドキュメント](https://docs.fastlane.tools/actions/deliver/)を参照してください。

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload Release to App Store"
  lane :upload_release do
    # Get the version number from the project and check against
    # the latest build already available on App Store Connect, then
    # increase the build number by 1. If no build is available
    # for that version, then start at 1
    increment_build_number(
      build_number: app_store_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloCircle.xcodeproj"),
        live: false
      ) + 1,
    )
    # Set up Distribution code signing and build the app
    match(type: "appstore")
    gym(scheme: "HelloCircle")
    # Upload the binary to App Store Connect
    app_store_connect_api_key
    deliver(
      submit_for_review: false,
      force: true
    )
  end
end
```

### 2. TestFlight へのデプロイ
{: #deploy-to-testflight }

TestFlight は、App Store Connect と連動した Apple のベータ版配信サービスです。 fastlane は、TestFlight の配信管理が簡単に行える[`pilot` アクション](https://docs.fastlane.tools/actions/pilot/)を提供しています。

下記の例では、 iOS バイナリを自動的にビルド、署名、アップロードするように fastlane を設定する方法を紹介しています。 Pilot には TestFlight にアプリを配信するためのカスタムオプションが豊富にあります。[`pilot` のドキュメント](https://docs.fastlane.tools/actions/pilot/)で詳細を確認することを強くお勧めします。 。

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Upload to Testflight"
  lane :upload_testflight do
    # Get the version number from the project and check against
    # the latest build already available on TestFlight, then
    # increase the build number by 1. If no build is available
    # for that version, then start at 1
    increment_build_number(
      build_number: latest_testflight_build_number(
        initial_build_number: 1,
        version: get_version_number(xcodeproj: "HelloWorld.xcodeproj")
      ) + 1,
    )
    # Set up Distribution code signing and build the app
    match(type: "appstore")
    gym(scheme: "HelloWorld")
    # Upload the binary to TestFlight and automatically publish
    # to the configured beta testing group
    app_store_connect_api_key
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

### fastlane プラグインの設定
{: #fastlane-plugin-setup }

プロジェクトにプラグインを設定するには、ローカルマシンのターミナルでプロジェクトディレクトリを開き、以下のコマンドを実行します。

```bash
fastlane add_plugin firebase_app_distribution
```

するとプラグインがインストールされ、必要な情報が `fastlane/Pluginfile` と `Gemfile` に追加されます。

**注:** `bundle install` ステップにより、ジョブの実行中にこのプラグインをインストールできるよう両方のファイルを Git リポジトリに組み込んでおくことが重要です。
{: class="alert alert-info" }

### 2.  CLI トークンの生成
{: #generate-a-cli-token }

Firebase では、認証時にトークンを使用する必要があります。 トークンの生成には、Firebase CLI とブラウザを使用します。CircleCIはヘッドレス環境であるため、ランタイムではなくローカルでトークンを生成し、環境変数として CircleCI に追加する必要があります。

1. コマンド `curl -sL https://firebase.tools | bash`で、Firebase CLI をダウンロードし、ローカルにインストールします。
2. `firebase login:ci` というコマンドでログインをトリガーします。
3. ブラウザウィンドウでサインインを完了し、ターミナルの出力で提供されたトークンをコピーします。
4. CircleCI のプロジェクト設定で、 `FIREBASE_TOKEN` という名前の新しい環境変数を作成し、トークンの値を入力します。

### fastlane の設定
{: #fastlane-configuration }

Firebase プラグインは、最小限の設定で iOS のバイナリを Firebase にアップロードすることができます。 主なパラメータは `app` で、Firebase が設定した App ID が必要になります。 これを確認するには、 [Firebase のコンソール](https://console.firebase.google.com)でプロジェクトにアクセスし、 **Project Settings > General** を選択します。 [Your apps ] の下に、プロジェクト内のアプリのリストと、App ID (通常、`1:123456789012:ios:abcd1234abcd1234567890` の形式) などの情報が表示されます。

その他の設定オプションについては、 [Firebase Fastlane プラグインのドキュメント](https://firebase.google.com/docs/app-distribution/ios/distribute-fastlane#step_3_set_up_your_fastfile_and_distribute_your_app)を参照してください。

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

Firebase Fastlane のプラグインを使用するには、 `curl -sL https://firebase.tools | bash` コマンドにより Firebase CLI をジョブの一部としてインストールする必要があります。

```yaml
version: 2.1
jobs:
  adhoc:
    macos:
      xcode: "12.5.1"
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

**注:** Firebase プラグインは、macOS システムの Ruby で実行するとエラーが発生することがあります。 そのため、[別の Ruby バージョンに切り替える]({{site.baseurl}}/ja/testing-ios/#using-ruby)ことをお勧めします。

## Visual Studio App Center へのデプロイ
{: #deploy-to-visual-studio-app-center }

[Visual Studio App Center](https://appcenter.ms/) (以前は HockeyApp) は、Microsoft の配信サービスです。  [App Center のプラグイン](https://github.com/microsoft/fastlane-plugin-appcenter)をインストールすると、App Center と Fastlane の統合が可能になります。

### Fastlane プラグインの設定
{: #fastlane-plugin-setup }

プロジェクトにプラグインを設定するには、ローカルマシンのターミナルでプロジェクトディレクトリを開き、以下のコマンドを実行します。
```bash
fastlane add_plugin appcenter
```
 するとプラグインがインストールされ、必要な情報が `fastlane/Pluginfile` と `Gemfile` に追加されます。

**注:** `bundle install` ステップにより、ジョブの実行中にこのプラグインをインストールできるよう両方のファイルを Git リポジトリに組み込んでおくことが重要です。

### 2.  App Center の設定
{: #app-center-setup }

まず、VS App Center でアプリを作成する必要があります。

1. [Visual Studio App Center](https://appcenter.ms/) にログイン、または登録します。
2. ページの右上にある [Add New (追加)] "をクリックし、[Add New App (新しいアプリを追加する)] を選択します。
3. 必要に応じて、必要な情報を入力します。

完了したら、Fastlane が App Center にアップロードできるようにするための API トークンを生成する必要があります。

1. 設定の [API トークン](https://appcenter.ms/settings/apitokens) に移動します。
2. [New API Token (新しい API トークン)] "をクリックします。
3. トークンの説明を入力し、アクセスを [Full Access (フルアクセス)] に設定します。
4. トークンが生成されたら、必ず安全な場所にコピーしてください。
5. CircleCI のプロジェクト設定で、`VS_API_TOKEN` という名前の新しい環境変数を作成し、トークンの値を入力します。

### fastlane の設定
{: #fastlane-configuration }

下記は、ベータ版アプリのビルドを Visual Studio App Center に配信するレーンの例です。 App Center にバイナリをアップロードするには、App Center アカウントのユーザー名と「フルアクセス」 の API トークンの両方が必要です。

```ruby
# Fastlane/fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to VS App Center"
  lane :upload_appcenter do
    #  ここでは ビルド番号に
    # CircleCI ジョブ番号を使います。
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    # Adhoc コード署名を設定し、アプリをビルドします。
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    # 必要な情報を設定し、
    # アプリのバイナリを VS App Center にアップロードします。
    appcenter_upload(
      api_token: ENV[VS_API_TOKEN],
      owner_name: "YOUR_VS_APPCENTER_USERNAME",
      owner_type: "user",
      app_name: "HelloWorld"
    )
  end
end
```

## TestFairy へのアップロード
{: #upload-to-testfairy }

[TestFairy](https://www.testfairy.com) は、よく使用されるエンタープライズアプリの配信およびテストサービスです。 Fastlane には TestFairy のサポートが組み込まれており、新しいビルドを迅速かつ簡単にアップロードすることができます。

![TestFairy の設定画面]({{site.baseurl}}/assets/img/docs/testfairy-open-preferences.png)

1. TestFairy ダッシュボードで、[Preferences (設定)] ページに移動します。
2. [Preferences (設定)] ページの API キーのセクションで API キーをコピーします。
3. CircleCI のプロジェクト設定で、`TESTFAIRY_API_KEY` という名前の新しい環境変数を作成し、API キーの値を入力します。

### fastlane の設定
{: #fastlane-configuration }

fastlane 内で TestFairy へのアップロードを設定するには、次の例を参照してください。

```ruby
# Fastlane/fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

desc "Upload to TestFairy"
  lane :upload_testfairy do
    # ここではビルド番号に
    # CircleCI ジョブ番号を使います。
    increment_build_number(
      build_number: "$CIRCLE_BUILD_NUM"
    )
    # Adhoc コード署名を設定し、アプリをビルドします。
    match(type: "adhoc")
    gym(scheme: "HelloWorld")
    # 必要な情報を設定し、
    # アプリのバイナリを VS App Center にアップロードします。
    testfairy(
      api_key: ENV[TESTFAIRY_API_KEY],
      ipa: 'path/to/ipafile.ipa',
      comment: ENV[CIRCLE_BUILD_URL]
    )
  end
end
```
