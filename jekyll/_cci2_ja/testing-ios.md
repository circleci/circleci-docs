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

以下のセクションでは、CircleCI を使用して iOS アプリケーションのテストをセットアップおよびカスタマイズする方法について説明します。

* TOC
{:toc}

## 概要
{: #overview }
{:.no_toc}

CircleCI では、 macOS 仮想マシンでの iOS プロジェクトのビルド、テスト、およびデプロイをサポートしています。 提供されている各イメージには、 Xcode と共に、 Ruby や OpenJDK などの共通のツールセットがインストールされています。 イメージの詳細については、各 Xcode イメージの[ソフトウェアマニフェスト](#supported-xcode-versions)を参照してください。

[iOS サンプルプロジェクト]({{ site.baseurl}}/ja/2.0/ios-tutorial/)と[ MacOS での入門]({{ site.baseurl }}/ja/2.0/hello-world-macos/)に関するドキュメントをご覧ください。

## macOS Executor を使用する
{: #using-the-macos-executor }

各 `macos `ジョブは、特定のバージョンの macOS を実行する新しい仮想マシン上で実行されます。 できる限り迅速なデプロイを行うために、CircleCI では Apple から Xcode の新しい安定版またはベータ版がリリースされるたびに新しいイメージを作成しています。 通常、特定のビルドイメージの内容は変更されません。ただし例外的に、特定の理由によりコンテナを再ビルドせざるを得ない状況になることがあります。 CircleCI では、安定したビルド環境を維持すること、そして `config.yml` ファイルに `xcode` キーを設定し、最新のコンテナを選択できるようにすることを目標としています。

ビルド環境が最新であることを確認するために、各イメージに含まれる macOS のバージョンを定期的に更新します。 macOS の新しいメジャー バージョンがリリースされると、Xcode の新しいメジャー バージョンが `xx.2` リリースに達した時点で、ビルド環境を安定した状態に保てるよう新しいバージョンに切り替えます。

新しい macOS コンテナに関する情報は、[Discuss フォーラムの Announcements (お知らせ) ](https://discuss.circleci.com/c/announcements)で確認できます。

### ベータ版イメージのサポート
{: #beta-image-support }

Xcode の次回安定版リリースよりも前に開発者の方々がアプリケーションのテストを行えるよう、 できるだけ早期に macOS Executor で Xcode のベータ版を公開できるよう尽力します。

ベータ イメージについては、安定版イメージ (更新が停止されたもの) と異なり、GM (安定版) イメージが公開され更新が停止するまでは、新規リリースのたびに既存のイメージが上書きされます。 現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際、最小限の通知によりそのイメージに変更が加えられることがあります。 これには、CircleCI では制御できない Xcode および関連ツールへの互換性を損なう変更が含まれる場合があります。

ベータ版イメージに関する CircleCI のお客様サポート ポリシーについては、[サポート センターに関するこちらの記事](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

### Apple  シリコンのサポート
{: #apple-silicon-support }

Apple は、今回のリリースで Intel (`x86_64` ) と Apple シリコン(`arm64`)の両方のツールチェーンを提供しているため、 Xcode`12.0.0`以降を使用して Apple シリコンバイナリおよびユニバーサルバイナリをビルドすることが可能です。 Intel のホスト上で Apple シリコン バイナリをクロスコンパイルするとオーバーヘッドが増加し、コンパイル時間が Intel のネイティブコンパイル時間より長くなります。

CircleCI ビルドホストは Intel ベースの Mac であるため、 Apple シリコン アプリケーションをネイティブで実行またはテストすることは現在不可能です。 アプリケーションをローカルでテストするには、バイナリを [アーティファクト]({{site.baseurl}}/2.0/artifacts/) としてエクスポートする必要があります。 または、
 CircleCI のランナーを使用して、 Apple シリコン上でネイティブにジョブを実行することもできます。</p> 



## サポートされている Xcode のバージョン

{: #supported-xcode-versions }


 | 設定       | Xcode のバージョン               | macOS のバージョン | VM ソフトウェアマニフェスト                                                                              | ベアメタル ソフトウェアマニフェスト                                                                                               | リリースノート                                                                                       |
 | -------- | -------------------------- | ------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
 | `14.0.0` | Xcode 14 Beta 1 (14A5228q) | 12.4         | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v8161/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2916/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-14-beta-1-released/44345)                      |
 | `13.4.1` | Xcode 13.4 (13F17a)        | 12.3.1       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v8094/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2890/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-4-1-released/44328)                         |
 | `13.3.1` | Xcode 13.3 (13E500a)       | 12.3.1       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v7555/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2718/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-3-1-released/43675)                         |
 | `13.2.1` | Xcode 13.2.1 (13C100)      | 11.6.2       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6690/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2243/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-2-1-released/42334)                         |
 | `13.1.0` | Xcode 13.1 (13A1030d)      | 11.6.1       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6269/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2218/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-1-rc-released/41577)                        |
 | `13.0.0` | Xcode 13.0 (13A233)        | 11.5.2       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6052/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1977/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-rc-released/41256)                          |
 | `12.5.1` | Xcode 12.5.1 (12E507)      | 11.4.0       | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v5775/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1964/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-5-1-released/40490)                         |
 | `12.4.0` | Xcode 12.4 (12D4e)         | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4519/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1970/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-4-release/38993)                            |
 | `12.3.0` | Xcode 12.3 (12C33)         | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4250/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1971/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-3-release/38570)                            |
 | `12.2.0` | Xcode 12.2 (12B45b)        | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4136/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1975/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-2-released/38156)                           |
 | `12.1.1` | Xcode 12.1.1 RC (12A7605b) | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4054/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2208/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-1-1-rc-released/38023)                      |
 | `12.0.1` | Xcode 12.0.1 (12A7300)     | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3933/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2216/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-0-1-released-xcode-12-0-0-deprecated/37630) |
 | `11.7.0` | Xcode 11.7 (11E801a)       | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3587/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2297/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-7-released/37312)                           |
 | `11.6.0` | Xcode 11.6 (11E708)        | 10.15.5      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3299/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2299/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-6-released/36777/2)                         |
 | `11.5.0` | Xcode 11.5 (11E608c)       | 10.15.4      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2960/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2310/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-5-gm-released/36029/4)                      |
 | `11.4.1` | Xcode 11.4.1 (11E503a)     | 10.15.4      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2750/index.html) | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2302/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-4-1-released/35559/2)                       |
 | `10.3.0` | Xcode 10.3 (10G8)          | 10.14.4      | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1925/index.html) | 適用外 <sup>(1)</sup>                                                                                               | [リリースノート](https://discuss.circleci.com/t/xcode-10-3-image-released/31561)                     |

 
 {: class="table table-striped"}
 
 CircleCI 専有ホストでは <sup>(1)</sup> _Xcode 10.3 はサポートしていません。 このリソースクラスの詳細は、[macOS の専有ホスト]({{ site.baseurl }}/2.0/dedicated-hosts-macos)を参照して下さい。</p> 
 
 **注:** [macOS アプリの UI テスト]({{ site.baseurl }}/ja/2.0/testing-macos) は、Xcode 11.7 以降でサポートされます。
 
 

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

単純なプロジェクトであれば、最小限の設定で実行できます。 最小限の設定ファイルの例は、[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)を参照してください。



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

* fastlane match で使用する一時的なキーチェーンを新規作成する (詳細については、コード署名のセクションを参照してください)。

* fastlane match を `ランダム` モードに切り替えて、CI が新しいコード署名証明書やプロビジョニング プロファイルを作成しないようにする。

* ログやテスト結果のパスをセットアップして、それらを収集しやすくする。



### CircleCI で fastlane を使用する場合の設定例

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

fastlane match の使用に関する詳細は、[ iOS コード署名に関するドキュメント]({{ site.baseurl}}/ja/2.0/ios-codesigning/) をご覧ください



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



{:.no_toc}

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



{:.no_toc}

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



### カスタム バージョンの CocoaPods と他の Ruby gem の使用

{: #using-custom-versions-of-cocoapods-and-other-ruby-gems }



{:.no_toc}

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

インストールされている NodeJS バージョンに関する情報は、[イメージのソフトウェアマニフェスト](#supported-xcode-versions)をご覧になるか、またはジョブの中で `nvm ls` を実行してください。 

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

**Note:** the `[` character is necessary to uniquely identify the iPhone 7 simulator, as the phone + watch simulator is also present in the build image:

**Note:** the `[` character is necessary to uniquely identify the iPhone 7 simulator, as the phone + watch simulator is also present in the build image:



## Homebrew の使用

{: #using-homebrew }

CircleCI には [Homebrew](http://brew.sh/) がプリインストールされているため、`brew install` を使用するだけで、ビルドに必要なほぼすべての依存関係を追加できます。 たとえば、以下のようになります。



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

アプリケーションのテストと署名が完了したら、App Store Connect や TestFlight など、任意のサービスへのデプロイを設定できます。 fastlane の設定例を含むさまざまなサービスへのデプロイ方法の詳細は、[iOS アプリケーション デプロイガイド]({{ site.baseurl }}/ja/2.0/deploying-ios/)をご覧ください。



## ジョブ実行時間を削減するベストプラクティス

{: #reducing-job-time-and-best-practises }



### シミュレーターの事前起動

{: #pre-starting-the-simulator }

アプリケーションをビルドする前に iOS シミュレーターを起動して、シミュレーターの稼働が遅れないようにします。 こうすることで、通常はビルド中にシミュレーターのタイムアウトが発生する回数を減らすことができます。

シミュレーターを事前に起動するには、macOS Orb (バージョン`2.0.0`以降) を設定に追加します。



```yaml
orbs:
  macos: circleci/macos@2
```


次に、`preboot-simulator` コマンドを以下の例のように定義します。



```yaml
steps:
  - macos/preboot-simulator:
      version: "15.0"
      platform: "iOS"
      device: "iPhone 13 Pro Max"
```


シミュレータがバックグラウンドで起動するまでの最大時間を確保するために、このコマンドをジョブの初期段階に配置することをお勧めします。

Apple Watch シミュレータとペアリングされた iPhone シミュレータが必要な場合は、 macOS Orb で `preboot-paired-simulator` コマンドを使用します。



```yaml
steps:
  - macos/preboot-paired-simulator:
      iphone-device: "iPhone 13"
      iphone-version: "15.0"
      watch-device: "Apple Watch Series 7 - 45mm"
      watch-version: "8.0"
```


**注: **シミュレーターを起動するには数分、ペアのシミュレーターを起動するにはそれ以上かかる場合があります。 この間、 `xcrun simctl list` などのコマンドの呼び出しは、シミュレータの起動中にハングしたように見える場合があります。



### iOS シミュレーターのクラッシュレポートの収集

{: #collecting-ios-simulator-crash-reports }



{:.no_toc}

テストランナーのタイムアウトなどの理由で `scan` ステップが失敗する場合、多くの場合テストの実行中にアプリケーションがクラッシュした可能性があります。 このような場合、クラッシュレポートを収集することでクラッシュの正確な原因を診断することができます。 クラッシュレポートをアーティファクトとしてアップロードする方法は以下の通りです。



```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports

```




### fastlane の最適化

{: #optimizing-fastlane }



{:.no_toc}

デフォルトで、fastlane scan はテスト出力レポートを `html` 形式や `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_types` を変更して、これらの形式を無効化することを検討してください。



### CocoaPods の最適化

{: #optimizing-cocoapods }



{:.no_toc}

基本的なセットアップ手順に加えて、Specs リポジトリ全体をクローンするのではなく、CDN を利用できる CocoaPods 1.8 以降を使用することをお勧めします。 ポッドをすばやくインストールできるようになり、ビルド時間が短縮されます。 1.8 以降では `pod install` ステップのジョブ実行がかなり高速化されるので、1.7 以前を使用している場合はアップグレードを検討してください。

実行するには　Podfile ファイルの先頭行を次のように記述します。



```
source 'https://cdn.cocoapods.org/'
```


1.7 以前からアップグレードする場合はさらに、プロファイルから次の行を削除すると共に、CircleCI 設定ファイルの "Fetch CocoaPods Specs" ステップを削除します。



```
source 'https://github.com/CocoaPods/Specs.git'
```


CocoaPods を最新の安定版に更新するには、以下のコマンドで Ruby gem を更新します。



```shell
sudo gem install cocoapods
```


[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすると、決定論的で再現可能なビルドを実現できます。

**注:** CocoaPods 1.8 のリリース以降、CocoaPods Spec レポジトリ用に提供した以前の S3 ミラーは整備も更新もされていません。 既存のジョブへの障害を防ぐために利用可能な状態ではありますが、上記の CDN 方式に変更することを強くお勧めします。



### Homebrew の最適化

{: #optimizing-homebrew }



{:.no_toc}

デフォルトでは Homebrew はすべての操作の開始時に更新の有無を確認します。 Homebrew のリリースサイクルはかなり頻繁なため、 `brew` を呼び出すステップはどれも完了するまでに時間がかかります。

ビルドのスピード、または Homebrewの新たな更新によるバグが問題であれば、自動更新を無効にすることができます。 それにより、一つのジョブにつき最大で平均 2 〜 5 分短縮することができます。

自動更新を無効にするには、ジョブ内で `HOMEBREW_NO_AUTO_UPDATE` 環境変数を定義します。



```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    environment:
      HOMEBREW_NO_AUTO_UPDATE: 1
    steps:
      - checkout
      - run: brew install wget
```




## サポートされているビルドおよびテストのツール

{: #supported-build-and-test-tools }

CircleCI  では、macOS Executorを使って iOS のビルドやテストに関するほぼすべてのストラテジーに合わせてビルドをカスタマイズできます。



### 一般的なテストツール

{: #common-test-tools }



{:.no_toc}

以下のテストツールは、CircleCI で有効に機能することが確認されています。

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)
* [Appium](http://appium.io/)



### React Native プロジェクト

{: #react-native-projects }



{:.no_toc}

React Native プロジェクトは、CircleCI  上で `macos` および `docker` Executor タイプを使用してビルドできます。 React Native プロジェクトの設定例は、[React Native のデモアプリケーション](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。



### `config.yml` ファイルの作成

{: #creating-a-configyml-file }



{:.no_toc}

プロジェクトの CircleCI 設定を `.circleci/config.yml `で変更することにより、ビルドを最も柔軟にカスタマイズすることができます。 この方法により、任意の bash コマンドを実行したり、ワークスペースやキャッシュなどの組み込み機能を利用することができます。 `config.yml` ファイルの構造の詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/2.0/configuration-reference/)ドキュメントを参照してください。



## 複数の Executor タイプ (macOS + Docker) の使用

{: #using-multiple-executor-types-macos-docker }

同じワークフロー内で、複数の [Executor タイプ]({{site.baseurl}}/ja/2.0/executor-intro/) を使用することができます。 以下の例では、プッシュされる iOS プロジェクトは macOS 上でビルドされ、その他の iOS ツール ([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker で実行されます。



```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    environment:
      FL_OUTPUT_DIR: output

    steps:
      - checkout
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
      - image: bytesguy/swiftlint:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:
      - image: bytesguy/danger:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: danger

workflows:
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```




## トラブルシューティング

{: #troubleshooting }

ジョブの実行中にビルドが失敗した場合は、 [サポートセンターのナレッジベース](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile)で一般的な問題の解決方法を確認してください。



## 関連項目

{: #see-also }



{:.no_toc}

- CircleCI  で fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。

- 設定ファイルの詳しい説明については、[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)を参照してください。

- fastlane match をプロジェクトに設定する方法は [iOS コード署名に関するドキュメント]({{ site.baseurl}}/ja/2.0/ios-codesigning/)を参照してください。
