---
layout: classic-docs
title: macOS アプリケーションのテスト
short-title: macOS アプリケーションのテスト
categories:
  - プラットフォーム
description: macOS アプリケーションのテスト
order:
---

このドキュメントでは、CircleCI を macOS アプリの UI テスト用に設定する方法を説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI では、 macOS Executor 上での macOS アプリのテストをサポートしており、この設定を fastlane と macOS のアクセス許可 Orb を使って迅速かつ簡単に行うことができます。

macOS アプリの自動テストを設定することで、様々なバージョンの macOS に対してアプリを簡単にテストすることができ、開発パイプラインに自動化を導入することができます。

## 概念
{: #concepts }

macOS アプリをテストするためには、Xcode Runner がユーザーによる操作のように動作するようテスト対象のアプリを制御できるようにする必要があります。 Apple は長い間 macOS のセキュリティ強化を重ね、現在では macOS アプリの UI テストをトリガーすると、制御を許可するかどうかを尋ねる許可ダイアログがポップアップ表示されます。 これはローカルの開発マシンでは問題ありませんが、ヘッドレスの CI 環境では、UIを操作することはできません。

Apple は、アクセス許可を付与するコマンドラインベースの代替ツールを提供していませんが、回避策があります。 アクセス許可データベースを手動で変更することにより、Xcode Helper がアプリを操作できるよう新しいアクセス許可を挿入することができます。 この `TCC.db` と呼ばれるファイルは、各アプリに対するアクセス許可の要求、付与、または拒否に関する情報を保持しています。

一意の `TCC.db` ファイルが 2 つ使用されています。 1つ目のコピーは、ホームディレクトリの `~/Library/Application Support/com.apple.TCC/TCC.db` に、2つ目のコピーは、 `/Library/Application Support/com.apple.TCC/TCC.db` にあります。 アクセス許可を追加または変更する場合は、実行時にアクセス許可が確実に有効となるようこの２つのファイル両方を編集する必要があります。

System Integrity Protection (SIP: システム整合性保護) が有効な状態だと、ホームディレクトリに配置されているコピーへの書き込みは可能ですが、`/Library/Application Support/com.apple.TCC/TCC.db` への書き込みはできません (macOS Mojave以降)。 CircleCI 上では、Xcode 11.7 以降のすべてのイメージの SIP が無効になっています。 SIP が有効なイメージに対して `TCC.db` への書き込みを行うと、ジョブが失敗します。

アクセス許可の追加は、CircleCI の設定で `sqlite3` コマンドを使って手動で書くこともできますが、 [CircleCIでは、これを簡略化するための Orb](https://circleci.com/developer/orbs/orb/circleci/macos) を提供しています。

## サポートされている Xcode および macOS のバージョン
{: #supported-xcode-and-macos-versions }

macOS アプリのテストは、SIP を無効にする必要があるため、Xcode 11.7 以降のイメージでのみサポートされています。 これ以前のイメージは SIP が無効になっていないため、macOS アプリのテストには適しません。

詳細については、 [サポートされている Xcode バージョン]({{ site.baseurl }}/ja/2.0/testing-ios/#supported-xcode-versions) のリストを参照してください。

Xcode Cross Compilation にご興味がある方は、[こちら]({{site.baseurl}}/ja/2.0/using-macos/#xcode-cross-compilation)をご覧ください。

## macOS UI テストプロジェクトの設定
{: #setting-up-a-macos-ui-test-project }

macOS アプリで UI テストを実行するための CircleCI の設定は、2つのパートに分かれています。 まず、CircleCI の設定で正しいアクセス許可を追加し、テストの実行環境を整える必要があります。 次に、テストを実行するために fastlane を設定する必要があります。

### CircleCI の設定
{: #configuring-circleci }

`config.yml` で、 `circleci/macos` [Orb](https://circleci.com/developer/orbs/orb/circleci/macos) を含め、 `macos/add-mac-uitest-permissions` のステップを呼び出します。 このステップでは、macOS アプリで Xcode UI テストを実行するための正しいアクセス許可が追加されていることを確認します。

追加のアクセス許可が必要な場合は、[macOS アクセス許可 Orb に関するドキュメント](https://circleci.com/developer/orbs/orb/circleci/macos)で設定方法をご確認ください。

macOS アプリをテストするためのサンプル `config.yml` です。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - run: echo 'chruby ruby-2.7' >> ~/.bash_profile
        - mac-permissions/add-uitest-permissions
        - run: bundle install
        - run: bundle exec fastlane testandbuild

workflows:
    verify:
        jobs:
            - build-test
```

### fastlane の設定
{: #configuring-fastlane }

fastlane を使うと、長い Xcode コマンドを手動で呼び出す代わりに、シンプルな設定ファイルを書くだけで macOS アプリのテストを開始することができます。 fastlane により、macOS アプリのビルド、署名 (テスト用)、テストが可能です。 なお、fastlane を使用する場合、設定されたアクションによっては、 二要素認証 (2FA) を設定する必要がある場合があります。 詳細については、[fatlane のドキュメント](https://docs.fastlane.tools/best-practices/continuous-integration/#method-2-two-step-or-two-factor-authentication) を参照してください。

以下はシンプルな設定例です。 なお、この設定は「Sign to Run Locally」と設定されているプロジェクトに依存しているため、fastlane match を設定する必要はありません。 アプリのテストに署名が必要な場合は、 [コード署名に関するドキュメント]({{ site.baseurl }}/2.0/ios-codesigning/) に従ってください (このドキュメントは iOSについて書かれていますが、macOS にも適用できます）。

```ruby
# fastlane/Fastfile
default_platform :mac

platform :mac do
  before_all do
    setup_circle_ci
  end

  desc "Run tests"
  lane :testandbuild do
    scan
  end
end
```

プロジェクトの完全な設定サンプルは、[GitHub 上での使用](https://github.com/CircleCI-Public/macos-orb)をご覧ください。

## macOS Orb を使用した作業
{: #working-with-the-macos-orb }

`TCC.db` ファイルは単なる SQLite データベースなので、ジョブ中に新しいアクセス許可を挿入したり、既存のアクセス許可を変更したりすることが簡単にできます。

`sqlite3` コマンドを使って手動で書き込むこともできますが、[macOS Orb](https://circleci.com/developer/orbs/orb/circleci/macos)を使用してこの作業を簡易化することをお勧めします。 ここで紹介する例は、すべて Orb を使用した場合のものです。

### 現在のアクセス許可の一覧表示
{: #listing-current-permissions }

ユーザーデータベースとシステムデータベースの両方で現在定義されているアクセス許可を一覧表示するには、以下の例のように、Orb が提供する `list-permissions` コマンドを呼び出します。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - mac-permissions/list-permissions

```

以下のように出力されます。

```shell
client              service                          allowed
------------------  -------------------------------  ----------
com.apple.Terminal  kTCCServiceSystemPolicyAllFiles  1
com.apple.Terminal  kTCCServiceDeveloperTool         1
/usr/sbin/sshd      kTCCServiceAccessibility         1
com.apple.systemev  kTCCServiceAccessibility         1
com.apple.Terminal  kTCCServiceAccessibility         1
```

このコマンドは 2 つのステップを生成します。1つはユーザーの `TCC.db` のコンテンツをリストアップし、もう1つはシステムの `TCC.db` をリストアップします。

### アクセス許可の種類の一覧表示
{: #listing-permission-types }

アクセス許可を付与するには、許可の種類に応じた正しい種類のキーを渡す必要があります。 この方法に関して Apple による明確な文書はありませんが、以下の例のように、 `list-permission-types` コマンドの実行により正しい種類のキーを見つけることができます。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - mac-permissions/list-permission-types
```

以下のように出力されます。

```shell
kTCCServiceMediaLibrary
kTCCServiceSiri
kTCCServiceMotion
kTCCServiceSpeechRecognition
...
```

### macOS アプリのテスト用にデフォルトのアクセス許可を付与する
{: #granting-default-permissions-for-macos-app-testing }

ほとんどの開発者にとって macOS アプリの UI テスト環境のセットアップに必要なのは、ターミナルと Xcode Helper へのいくつかの標準的なアクセス許可のみです。 これは、`add-uitest-permissions` コマンドを呼び出すことで設定できます（下記例を参照）。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - mac-permissions/add-uitest-permissions
```

### 新しいアクセス許可の付与
{: #granting-new-permissions }

Orb を使って、 `add-permission` コマンドでカスタムのアクセス許可を追加することができます。 以下の例では、ターミナルにスクリーンキャプチャへのアクセス許可を与えています。 バンドル IDと [アクセス許可](#listing-permission-types)の種類はどちらも必須のパラメーターです。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - mac-permissions/add-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```

### アクセス許可の削除
{: #removing-a-permission }

万が一、ジョブ中にアクセス許可を削除する必要がある場合は、 `delete-permission` コマンドを使います。 以下の例では、ターミナルからスクリーンキャプチャへのアクセス許可を削除しています。 バンドル IDと [アクセス許可](#listing-permission-types)の種類はどちらも必須のパラメーターです。

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 12.5.1
    steps:
        - checkout
        - mac-permissions/delete-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```
