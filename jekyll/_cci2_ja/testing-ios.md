---
layout: classic-docs
title: macOS 上の iOS アプリケーションのテスト
short-title: macOS 上の iOS アプリケーションのテスト
categories:
  - プラットフォーム
description: macOS 上の iOS アプリケーションのテスト
order: 30
version:
  - Cloud
---

このドキュメントでは、CircleCI を使用して iOS アプリケーションのテストをセットアップおよびカスタマイズする方法について説明します。

## 概要
{: #overview }

CircleCI では、 macOS 仮想マシンでの iOS プロジェクトのビルド、テスト、およびデプロイをサポートしています。 提供されている各イメージには、 Xcode と共に、 Ruby や OpenJDK などの共通のツールセットがインストールされています。 イメージの詳細については、各 Xcode イメージの[ソフトウェアマニフェスト](#supported-xcode-versions)を参照してください。

[iOS サンプルプロジェクト]({{ site.baseurl}}/ja/ios-tutorial/)と[ MacOS での入門]({{ site.baseurl }}/ja/hello-world-macos/)に関するドキュメントをご覧ください。

## サポートされている Xcode のバージョン
{: #supported-xcode-versions }

{% include snippets/ja/xcode-versions.md %}

## はじめよう
{: #getting-started }

[CircleCI Web アプリ](https://app.circleci.com/) の **Projects** ページで、ビルドしたい macOS プロジェクトのレポジトリを選択します。

CircleCI でのアプリケーションのビルドと署名には [fastlane](https://fastlane.tools) を使用することを強くお勧めします。 fastlaneを使うと、多くの場合が最小限の設定で簡単にビルド、テスト、デプロイプロセスを実行することができます。

### Xcode プロジェクトの設定
{: #setting-up-your-xcode-project }

CircleCI でプロジェクトを設定した後、 fastlane でビルドするスキームが Xcode プロジェクトで「共有」としてマークされていることを確認する必要があります。 Xcode で作成されるほとんどの新規プロジェクトでは、デフォルトのスキームはすでに「共有」としてマークされています。 これを確認する、または既存のスキームを共有するには、次の手順を実行します。

1. Xcode で、[Product (プロダクト)]> [Scheme (スキーム)] > [Manage Schemes (スキーム管理)] の順に選択します。
2. 共有したいスキームの [Shared (共有する)] オプションを選択し、[Close (閉じる)] をクリックします。
3. `myproject.xcodeproj/xcshareddata/xcschemes` ディレクトリが Git リポジトリに組み込まれていることを確認し、変更をプッシュします

単純なプロジェクトであれば、最小限の設定で実行できます。 コンフィグの最小構成例は、「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/ios-tutorial/)」を参照してください。

## fastlane の使用
{: #using-fastlane }

[fastlane](https://fastlane.tools/) は、モバイルアプリのビルドとデプロイのプロセスを自動化するためのツールセットです。 CicleCI上で fastlane を使用すると、ビルド、テスト、デプロイプロセスの設定や自動化が簡単に行えるため、ぜひご使用ください。 また、fastlane の使用によりビルドをローカルでも CircleCI 上でも同等に実行することができます。

### Gemfile の追加
{: #adding-a-gemfile }
{:.no_toc}

ローカルでも依存関係がすべてインストールされた CircleCI 上でも同じバージョンの fastlane が使用できるよう、`Gemfile` をリポジトリに追加することをお勧めします。 以下に `Gemfile` の簡単な例を示します。

```ruby
# Gemfile
source "https://rubygems.org"
gem 'fastlane'
```

`Gemfile` をローカルで作成したら、`bundle install` を実行し、`Gemfile` と `Gemfile.lock` の両方をリポジトリにチェックインする必要があります。

### CircleCI 上で使用する場合の fastlane のセットアップ
{: #setting-up-fastlane-for-use-on-circleci }
{:.no_toc}

fastlane を CircleCI プロジェクトで使用する場合は、以下の行を `Fastfile` の始めに追加することをお勧めします。

```ruby
# fastlane/Fastfile
platform :ios do
  before_all do
    setup_circle_ci
  end
  ...
end
```

以下のアクションを実行するには、`setup_circle_ci` fastlane アクションを `before_all` ブロック内に置く必要があります。

* Create a new temporary keychain for use with Fastlane Match (see the code signing section for more details).
* fastlane match を `ランダム` モードに切り替えて、CI が新しいコード署名証明書やプロビジョニング プロファイルを作成しないようにする。
* ログやテスト結果のパスをセットアップして、それらを収集しやすくする。

### CircleCI で fastlane を使用する場合の構成例
{: #example-configuration-for-using-fastlane-on-circleci }
{:.no_toc}

以下に、CircleCI で使用できる fastlane の基本設定を示します。

```ruby
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Runs all the tests"
  lane :test do
    scan
  end

  desc "Ad-hoc build"
  lane :adhoc do
    match(type: "adhoc")
    gym(export_method: "ad-hoc")
  end
end
```

上記の設定は、以下の CircleCI の設定ファイルと組み合わせて使用できます。

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

環境変数 `FL_OUTPUT_DIR` は、fastlane ログと署名済み `.ipa` ファイルを保存するアーティファクトディレクトリです。 この環境変数を使用して、自動的にログを保存し、fastlane からアーティファクトをビルドするためのパスを `store_artifacts` ステップで設定します。

### fastlane match によるコード署名
{: #code-signing-with-fastlane-match }

ローカルでも CircleCI 環境下でもコード署名のプロセスを簡易化し自動化することができるため、iOS アプリケーションの署名には fastlane match のご使用をお勧めします。

fastlane match の使用に関する詳細は、[ iOS コード署名に関するドキュメント]({{ site.baseurl}}/ja/ios-codesigning/) をご覧ください

## Ruby の使用
{: #using-ruby }

CircleCI の macOS イメージには、複数のバージョンの Ruby が格納されています。 すべてのイメージにおいて、Ruby がデフォルトで使用されています。 また、イメージがビルドされた時点において最新バージョンの動作が安定している Ruby も含まれています。 CircleCI では、[Ruby-Lang.org のダウンロードページ](https://www.ruby-lang.org/ja/downloads/)を基に、動作が安定している Ruby のバージョンを判断しています。 各イメージにインストールされている Ruby のバージョンは、[各コンテナのソフトウェア マニフェスト](#supported-xcode-versions)に記載されています。

マニフェストで「available to chruby (chruby で使用可)」と説明されている Ruby のバージョンでは、[`chruby`](https://github.com/postmodern/chruby) を使用してステップを実行できます。

**注:** システムディレクトリに適用されるアクセス許可が制限されるため、システムのRuby を使って Gems をインストールすることは推奨しません。 通常、すべてのジョブに対して Chrudy が提供する代替の Ruby の使用を推奨しています。

### Ruby から macOS Orb への切り替え (推奨)
{: #switching-rubies-with-the-macos-orb-recommended }

公式の macOS Orb (バージョン `2.0.0` 以降)  を使用すると、ジョブ内で Ruby から簡単に切り替えることができます。 どの Xcode イメージを使用していても、適切な切り替えコマンドが自動的に使用されます。

まずは、Orb を設定の一番最初に含めます。

```yaml
# ...
orbs:
  macos: circleci/macos@2
```

次に、必要なバージョン番号と共に `switch-ruby` コマンドを定義します。 たとえば、Ruby 2.6 に切り替える場合は、

```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "2.6"
```

`2.6` をソフトウェアマニフェストファイルから必要なバージョンに変更してください。 `3.0.2` のように Ruby のフルバージョンを記載する必要はなく、 メジャーバージョンのみで問題ありません。 そうすることで、設定を壊すことなく Ruby の新しいパッチバージョンの新しいイメージに切り替えることができます。

デフォルトの Ruby (macOS に Apple が搭載した Ruby) に戻すには、`version` を `system` として定義します。

```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "system"
```

**注:** Xcode 11.7 以降のイメージでは、デフォルトで chruby を使用した Ruby 2.7 に設定されています。 Xcode 11.6 以前のイメージでは、デフォルトで Ruby に設定されています。

### Xcode 11.7 以降を使用したイメージ
{: #images-using-xcode-117-and-later }
{:.no_toc}

Ruby の別のバージョンに切り替えるには、ジョブの最初に以下を追加します。

```yaml
steps:
  # ...
  - run:
      name: Ruby バージョンの設定
      command: sed -i '' 's/^chruby.*/chruby ruby-3.0/g' ~/.bash_profile
```

`3.0` を必要な Ruby バージョンに変更します。`3.0.2` のように Ruby のフルバージョンを記載する必要はなく、 メジャーバージョンのみで問題ありません。 そうすることで、設定を壊すことなく Ruby の新しいパッチバージョンの新しいイメージに切り替えることができます。

元の Ruby に戻すには、ジョブの最初に以下を追加します。

```yaml
steps:
  # ...
  - run:
      name: Ruby バージョンの設定
      command: sed -i '' 's/^chruby.*/chruby system/g' ~/.bash_profile

```

### Xcode 11.2 以降を使用したイメージ
{: #images-using-xcode-112-and-later }


使用する Ruby のバージョンを指定するには、次のように `~/.bash_profile` に`chruby` 機能を追加します。

```yaml
steps:
  # ...
  - run:
      name: Ruby バージョンの設定
      command: echo 'chruby ruby-2.6' >> ~/.bash_profile
```

`2.6` を必要な Ruby バージョンに変更します。`2.6.5` のように Ruby のフルバージョンを記載する必要はなく、 メジャーバージョンのみで問題ありません。 そうすることで、設定を壊すことなく Ruby の新しいバージョンの新しいイメージに切り替えることができます。

### Xcode 11.1 以前を使用したイメージ
{: #images-using-xcode-111-and-earlier }


使用する Ruby のバージョンを指定するには、`chruby` に記載されているように [`.ruby-version`という名前のファイルを作成します。](https://github.com/postmodern/chruby#auto-switching) これは以下のようにジョブステップで実行できます。

```yaml
steps:
  # ...
  - run:
      name: Ruby バージョンの設定
      command:  echo "ruby-2.4" > ~/.ruby-version
```

`2.4` を必要な Ruby バージョンに変更します。`2.4.9` のように Ruby のフルバージョンを記載する必要はなく、 メジャーバージョンのみで問題ありません。 そうすることで、設定を壊すことなく Ruby の新しいバージョンの新しいイメージに切り替えることができます。

### Ruby バージョンの追加インストール
{: #installing-additional-ruby-versions }

**注:** Ruby バージョンを追加インストールするにはかなりの時間を要します。 デフォルトでイメージにインストールされていな特定のバージョンを使用する必要がある場合のみ行うことを推奨します。

プリインストールされていない Ruby のバージョンでジョブを実行するには、必要なバージョンの Ruby をインストールする必要があります。 必要なバージョンの Ruby をインストールするには、[ruby-install](https://github.com/postmodern/ruby-install) ツールを使用します。 インストールが完了したら、上記の方法でバージョンを選択することができます。

### カスタムバージョンの CocoaPods と他の Ruby gem の使用
{: #using-custom-versions-of-cocoapods-and-other-ruby-gems }


ローカルで使用しているバージョンの CocoaPods を CircleCI のビルドでも使用するには、iOS プロジェクトで Gemfile を作成し、そこに CocoaPods バージョンを追加することをお勧めします。

```ruby
source 'https://rubygems.org'

gem 'cocoapods', '= 1.3.0'
```

次に、Bundler を使用してインストールします。

{% raw %}
```yaml
steps:
  - restore_cache:
      key: 1-gems-{{ checksum "Gemfile.lock" }}
  - run: bundle check || bundle install --path vendor/bundle --clean
  - save_cache:
      key: 1-gems-{{ checksum "Gemfile.lock" }}
      paths:
        - vendor/bundle
```
{% endraw %}

また、コマンドにプレフィックス `bundle exec` を付加しておくと、確実に使用できるようになります。

```yaml
# ...
steps:
  - run: bundle exec pod install

```

## NodeJS の使用
{: #using-nodejs }

Xcode イメージには少なくとも一つのバージョンの NodeJS が使用可能な状態で提供されています。

### Xcode 13 以降を使用したイメージ
{: #images-using-xcode-13-and-later }

Xcode 13 以降を使用したイメージには、`nvm` が管理する NodeJS がインストールされており、イメージがビルドされた時点で最新の `current` と `lts` リリースが常に提供されます。 また、`lts`はデフォルトの NodeJS バージョンとして設定されています。

インストールされている NodeJS のバージョン情報は、 [イメージのソフトウェアマニフェスト](#supported-xcode-versions)を参照するか、ジョブの中で `nvm ls` を実行してご確認いただけます。

以下のコマンドで `current` バージョンをデフォルトに設定します。

```yaml
# ...
steps:
  - run: nvm alias default node
```

`lts`リリースに戻すには、以下を実行します。

```yaml
# ...
steps:
  - run: nvm alias default --lts
```

特定の NodeJS をインストールし使用しするには、以下を実行します。

```yaml
# ...
steps:
  - run: nvm install 12.22.3 && nvm alias default 12.22.3

```

これらのイメージは、 NodeJS のインストールとキャッシュパッケージの管理に役立つ公式の [CircleCI Node Orb](https://circleci.com/developer/orbs/orb/circleci/node) とも互換性があります。

### Xcode 12.5 以前を使用したイメージ
{: #images-using-xcode-125-and-earlier }

Xcode 12.5 以前を使用したイメージには、少なくとも１つのバージョンの NodeJS が `brew` を直接使用してインストールされています。

インストールされている NodeJS のバージョン情報は、 [イメージのソフトウェアマニフェスト](#supported-xcode-versions)をご覧ください。

キャッシュパッケージと一緒に `nvm` をインストールすることにより、これらのイメージは NodeJS のインストールの管理に役立つ公式の [CircleCI Node Orb](https://circleci.com/developer/orbs/orb/circleci/node) とも互換性を持つようになります。

## Homebrew の使用
{: #using-homebrew }

CircleCI には [Homebrew](http://brew.sh/) がプリインストールされているため、`brew install` を使用するだけで、ビルドに必要なほぼすべての依存関係を追加できます。 例えば下記のようになります。

```yaml
# ...
steps:
  - run:
      name: Install cowsay
      command: brew install cowsay
  - run:
      name: cowsay hi
      command: cowsay Hi!
```

必要な場合は、`sudo` コマンドを使用して、Homebrew 以外のカスタマイズも実行できます。

## デプロイの設定
{: #configuring-deployment }

アプリケーションのテストと署名が完了したら、App Store Connect や TestFlight など、任意のサービスへのデプロイを設定できます。 fastlane の設定例を含むさまざまなサービスへのデプロイ方法の詳細は、[iOS アプリケーション デプロイガイド]({{site.baseurl}}/ja/deploy-ios-applications/)をご覧ください。

## トラブルシューティング
{: #troubleshooting }

ジョブの実行中にビルドが失敗した場合は、 [サポートセンターのナレッジベース](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile)で一般的な問題の解決方法を確認してください。

## 次のステップ
{: #next-steps }

- CircleCI  で fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。
- 設定ファイルの詳しい説明については、[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/ios-tutorial/)を参照してください。
- fastlane match をプロジェクトに設定する方法は [iOS コード署名に関するドキュメント]({{ site.baseurl}}/ja/ios-codesigning/)を参照してください。
