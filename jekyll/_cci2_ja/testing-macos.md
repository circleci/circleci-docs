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

CircleCI supports testing macOS apps on the macOS executor and by utilising Fastlane, and the macOS permissions orb, this can be set up quickly and easily.

macOSアプリの自動テストを設定することで、異なるバージョンの macOS に対してアプリを簡単にテストすることができ、開発パイプラインに自動化を導入することができます。

## 概念
{: #concepts }

macOS アプリをテストするためには、Xcode Runner がユーザーによる操作であるかのように動作するようテスト対象のアプリを制御する機能が必要です。 Apple は長い間 macOS のセキュリティ強化を重ね、現在では macOS アプリの UI テストをトリガーすると、制御を許可するかどうかを尋ねる許可ダイアログがポップアップ表示されます。 これはローカルの開発マシンでは問題ありませんが、ヘッドレスの CI 環境では、UIを操作することはできません。

Apple は、権限を付与するためのコマンドラインベースの代替ツールを提供していませんが、回避策があります。 権限データベースを手動で変更することで、Xcode Helper がアプリを操作できる新しい権限を挿入することができます。 この `TCC.db` と呼ばれるファイルは、各アプリに対するアクセス許可の要求、付与、または拒否に関する情報の保持を担っています。

一意の `TCC.db` ファイルが 2 つ使用されています。 1つ目のコピーは、ホームディレクトリの `~/Library/Application Support/com.apple.TCC/TCC.db` に、2つ目のコピーは、 `/Library/Application Support/com.apple.TCC/TCC.db` にあります。 アクセス許可を追加または変更する場合は、実行時にアクセス許可が確実に有効となるようこの２つのファイル両方を編集する必要があります。

System Integrity Protection が有効な状態だと、ホームディレクトリに配置されているコピーへの書き込みは可能ですが、`/Library/Application Support/com.apple.TCC/TCC.db` への書き込みはできません (macOS Mojave以降)。 CircleCI では、Xcode 11.7以降のすべてのイメージの System Integrity Protection が無効になっています。 System Integrity Protection が有効なイメージ上で `TCC.db` への書き込みを行うと、ジョブが失敗します。

アクセス許可の追加は、CircleCI の設定で `sqlite3` コマンドを使って手動で書くこともできますが、 [CircleCIでは、これを簡略化するための Orb](https://circleci.com/developer/orbs/orb/circleci/macos) を提供しています。

## サポートされている Xcode および macOS のバージョン
{: #supported-xcode-and-macos-versions }

macOS アプリのテストは、System Integrity Protection (SIP）を無効にする必要があるため、Xcode 11.7 以降のイメージでのみサポートされています。 これ以前のイメージは SIP が無効になっていないため、macOS アプリのテストには適しません。

詳細については、 [サポートされている Xcode バージョン]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) のリストを参照してください。

Xcode Cross Compilation にご興味がある方は、[こちら]({{site.baseurl}}/2.0/hello-world-macos/?section=executors-and-images#xcode-cross-compilation)をご覧ください。

## macOS UI テストプロジェクトの設定
{: #setting-up-a-macos-ui-test-project }

macOS アプリで UI テストを実行するための CircleCI の設定は、2つのパートに分かれています。 まず、CircleCI の設定で正しいアクセス許可を追加し、テストの実行環境を整える必要があります。 次に、テストを実行するために fastlane を設定する必要があります。

### CircleCI の設定
{: #configuring-circleci }

In the CircleCI `config.yml` we need to include the `circleci/macos` [orb](https://circleci.com/developer/orbs/orb/circleci/macos) and call the `macos/add-mac-uitest-permissions` step. This step ensures that the correct permissions are added to run Xcode UI tests on a macOS app.

If additional permissions are required, you can find out how to set these up in the [macOS permission orb documentation](https://circleci.com/developer/orbs/orb/circleci/macos).

Sample `config.yml` for testing a macOS app:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - run: echo 'chruby ruby-2.7' >> ~/.bash_profile
        - mac-permissions/add-mac-uitest-permissions
        - run: bundle install
        - run: bundle exec fastlane testandbuild

workflows:
    verify:
        jobs:
            - build-test
```

### Configuring Fastlane
{: #configuring-fastlane }

Fastlane allows you to avoid calling lengthy Xcode commands manually and instead write a simple configuration file to initiate the macOS app tests. With Fastlane you can build, sign (for testing) and test a macOS app. Please note that when using Fastlane, depending on the actions in your configuration, you may need to setup a 2-factor Authentication (2FA). See the [Fastlane Docs for more information](https://docs.fastlane.tools/best-practices/continuous-integration/#method-2-two-step-or-two-factor-authentication).

A simple config can be found below. Note that this config relies on the project being configured as "Sign to Run Locally" and therefore you do not need to set up Fastlane Match. If your app requires signing to test, follow the [code signing documentation]({{ site.baseurl }}/2.0/ios-codesigning/) (the code signing documentation talks about iOS but it is also applicable to macOS).

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

A fully configured sample project can be found [on GitHub](https://github.com/CircleCI-Public/macos-orb).

## Working with the macOS Orb
{: #working-with-the-macos-orb }

The `TCC.db` file is simply an SQLite database, so this makes it easy to inject new permissions, or modify existing ones, during a job.

While it can be written to manually with `sqlite3` commands, we encourage the use of the [macOS orb](https://circleci.com/developer/orbs/orb/circleci/macos) to simplify this. The examples in this section are all based on using the orb.

### Listing Current Permissions
{: #listing-current-permissions }

To list the currently defined permissions in both the user and system database, call the `list-permissions` command provided by the orb, such as in this example:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/list-permissions
```

Sample output:

```bash
client              service                          allowed
------------------  -------------------------------  ----------
com.apple.Terminal  kTCCServiceSystemPolicyAllFiles  1
com.apple.Terminal  kTCCServiceDeveloperTool         1
/usr/sbin/sshd      kTCCServiceAccessibility         1
com.apple.systemev  kTCCServiceAccessibility         1
com.apple.Terminal  kTCCServiceAccessibility         1
```

This command generates two steps; one lists the contents of the user `TCC.db` and one lists the system `TCC.db`.

### Listing permission types
{: #listing-permission-types }

To grant permissions, the correct type of key for the permission type needs to be passed. These are not clearly documented by Apple, but can be found by running the `list-permission-types` command, as this example shows:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/list-permission-types
```

Sample output:

```bash
kTCCServiceMediaLibrary
kTCCServiceSiri
kTCCServiceMotion
kTCCServiceSpeechRecognition
...
```

### Granting default permissions for macOS app testing
{: #granting-default-permissions-for-macos-app-testing }

For most developers, only a few standard permissions for Terminal and Xcode Helper are required to set up the environment for macOS app UI Testing. These can be set by calling the `add-uitest-permissions` command, such as in this example:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/add-uitest-permissions
```

### Granting new permissions
{: #granting-new-permissions }

The orb can be used to add custom permissions with the `add-permission` command. The following example grants Screen Capture permissions to Terminal. The Bundle ID and the [permission](#listing-permission-types) type are both required parameters:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/add-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```

### Removing a permission
{: #removing-a-permission }

In the unlikely event that a permission needs to be removed during a job, use the `delete-permission` command. In the following example, we are removing Screen Capture permissions from Terminal. The Bundle ID and the [permission](#listing-permission-types) type are both required parameters:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/delete-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```
