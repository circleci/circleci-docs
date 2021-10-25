---
layout: classic-docs
title: macOS 上の iOS アプリケーションのテスト
short-title: macOS 上の iOS アプリケーションのテスト
categories:
  - platforms
description: macOS 上の iOS アプリケーションのテスト
order: 30
version:
  - Cloud
---

以下のセクションに沿って、CircleCI を使用して iOS アプリケーションのテストをセットアップおよびカスタマイズする方法について説明します。

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

ビルド環境が最新であることを確認するために、各イメージに含まれる macOS のバージョンを定期的に更新します。 macOS の新しいメジャー バージョンがリリースされると、Xcode の新しいメジャー バージョンが xx.2 リリースに達した時点で、ビルド環境を安定した状態に保てるよう新しいバージョンに切り替えます。

新しい macOS コンテナに関する情報は、[Discuss フォーラムの Announcements (お知らせ) ](https://discuss.circleci.com/c/announcements)で確認できます。

### ベータ版イメージのサポート
{: #beta-image-support }

Xcode の次回安定版リリースよりも前に開発者の方々がアプリケーションのテストを行えるよう、 できるだけ早期に macOS Executor で Xcode のベータ版を公開できるよう尽力します。

ベータ イメージについては、安定版イメージ (更新が停止されたもの) と異なり、GM (安定版) イメージが公開され更新が停止するまでは、新規リリースのたびに既存のイメージが上書きされます。 現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際、最小限の通知によりそのイメージに変更が加えられることがあります。 これには、CircleCI では制御できない Xcode および関連ツールへの互換性を損なう変更が含まれる場合があります。

ベータ版イメージに関する CircleCI のお客様サポート ポリシーについては、[サポート センターに関するこちらの記事](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

### Apple  シリコンのサポート
{: #apple-silicon-support }

Apple は、今回のリリースで Intel (`x86_64` ) と Apple シリコン(`arm64`)の両方のツールチェーンを提供しているため、 Xcode`12.0.0`以降を使用して Apple シリコンバイナリおよびユニバーサルバイナリをビルドすることが可能です。 Intel のホスト上で Apple シリコン バイナリをクロスコンパイルするとオーバーヘッドが増加し、コンパイル時間が Intel のネイティブコンパイル時間より長くなります。

CircleCI ビルドホストは Intel ベースの Mac であるため、 Apple シリコン アプリケーションをネイティブで実行またはテストすることは現在不可能です。 アプリケーションをローカルでテストするには、バイナリを [アーティファクト](https://circleci.com/docs/ja/2.0/artifacts/) としてエクスポートする必要があります。 または、
 CircleCI のランナーを使用して、 Apple シリコン上でネイティブにジョブを実行することもできます。</p> 



## サポートされている Xcode のバージョン

{: #supported-xcode-versions }


 | 設定       | Xcode のバージョン               | macOS のバージョン | macOS UI テストのサポート | ソフトウェア マニフェスト                                                                                | リリースノート                                                                                       |
 | -------- | -------------------------- | ------------ | ----------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
 | `13.0.0` | Xcode 13.0 (13A233)        | 11.5.2       | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6052/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-13-rc-released/41256)                          |
 | `12.5.1` | Xcode 12.5.1 (12E507)      | 11.4.0       | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v5775/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-5-1-released/40490)                         |
 | `12.4.0` | Xcode 12.4 (12D4e)         | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4519/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-4-release/38993)                            |
 | `12.3.0` | Xcode 12.3 (12C33)         | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4250/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-3-release/38570)                            |
 | `12.2.0` | Xcode 12.2 (12B45b)        | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4136/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-2-released/38156)                           |
 | `12.1.1` | Xcode 12.1.1 RC (12A7605b) | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4054/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-1-1-rc-released/38023)                      |
 | `12.0.1` | Xcode 12.0.1 (12A7300)     | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3933/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-12-0-1-released-xcode-12-0-0-deprecated/37630) |
 | `11.7.0` | Xcode 11.7 (11E801a)       | 10.15.5      | ○                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3587/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-7-released/37312)                           |
 | `11.6.0` | Xcode 11.6 (11E708)        | 10.15.5      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3299/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-6-released/36777/2)                         |
 | `11.5.0` | Xcode 11.5 (11E608c)       | 10.15.4      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2960/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-5-gm-released/36029/4)                      |
 | `11.4.1` | Xcode 11.4.1 (11E503a)     | 10.15.4      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2750/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-4-1-released/35559/2)                       |
 | `11.3.1` | Xcode 11.3.1 (11C505)      | 10.15.1      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2244/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-3-1-released/34137/6)                       |
 | `11.2.1` | Xcode 11.2.1 (11B500)      | 10.15.0      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2118/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-2-1-gm-seed-1-released/33345/14)            |
 | `11.1.0` | Xcode 11.1 (11A1027)       | 10.14.4      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1989/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-1-image-released/32668/19)                  |
 | `11.0.0` | Xcode 11.0 (11A420a)       | 10.14.4      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1969/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-11-gm-seed-2-released/32505/29)                |
 | `10.3.0` | Xcode 10.3 (10G8)          | 10.14.4      | ×                 | [インストール済みソフトウェア](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1925/index.html) | [リリースノート](https://discuss.circleci.com/t/xcode-10-3-image-released/31561)                     |

 
 {: class="table table-striped"}
 
 

## はじめよう

{: #getting-started }

CircleCI アプリケーションの** [Add Projects (プロジェクトの追加)] **ページで、ビルドしたい macOS プロジェクトのレポジトリを選択します。 macOS ビルドが可能なプランであることを確認する必要があります。またはプロジェクトがオープンソースの場合は、毎月無料ビルドクレジットがつく[ 特別プラン](https://circleci.com/open-source/)を申し込むことができます。 </p> 

CircleCI でのアプリケーションのビルドと署名には [Fastlane](https://fastlane.tools) を使用することを強くお勧めします。 Fastlaneを使うと、多くの場合が最小限の設定で簡単にビルド、テスト、デプロイプロセスを実行することができます。



### Xcode プロジェクトの設定

{: #setting-up-your-xcode-project }

CircleCI でプロジェクトを設定した後、 FastLane でビルドするスキームが Xcode プロジェクトで「共有」としてマークされていることを確認する必要があります。 Xcode で作成されるほとんどの新規プロジェクトでは、デフォルトのスキームはすでに「共有」としてマークされています。 これを確認する、または既存のスキームを共有するには、次の手順を実行します。

1. Xcode で、[Product (プロダクト)]> [Scheme (スキーム)] > [Manage Schemes (スキーム管理)] の順に選択します。
2. 共有したいスキームの [Shared (共有する)] オプションを選択し、[Close (閉じる)] をクリックします。
3. `myproject.xcodeproj/xcshareddata/xcschemes` ディレクトリが Git リポジトリに組み込まれていることを確認し、変更をプッシュします

単純なプロジェクトであれば、最小限の設定で実行できます。 最小限の設定ファイルの例は、「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)」を参照してください。



## fastlane の使用

{: #using-fastlane }

[fastlane](https://fastlane.tools/) は、モバイルアプリのビルドとデプロイのプロセスを自動化するためのツールセットです。 ビルド、テスト、デプロイプロセスの設定や自動化が簡単に行えるため、ご使用をお勧めします。 fastlane を使用すると、ビルドをローカルでも CircleCI 上でも同等に実行することができます。



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

fastlane を CircleCI プロジェクトで使用する場合は、以下の行を `fastfile` の始めに追加することをお勧めします。



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

* fastlane match を `readonly` モードに切り替えて、CI が新しいコード署名証明書やプロビジョニング プロファイルを作成しないようにする。

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


上記の設定は、以下の CircleCI のコンフィグファイルと組み合わせて使用できます。



```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
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
      xcode: 11.3.0
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

fastlane match の使用に関する詳細は、[ iOS コード署名に関するドキュメント]({{ site.baseurl}}/2.0/ios-codesigning/) をご覧ください。



## Ruby の使用

{: #using-ruby }

CircleCI の macOS イメージには、複数のバージョンの Ruby が格納されています。 The default version in use on all images is the system Ruby. The images also include the latest stable versions of Ruby at the time that the image is built. We determine the stable versions of Ruby using the [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/). The versions of Ruby that are installed in each image are listed in the [software manifests of each container](#supported-xcode-versions).

If you want to run steps with a version of Ruby that is listed as "available to chruby" in the manifest, then you can use [`chruby`](https://github.com/postmodern/chruby) to do so.

**Note:** Installing Gems with the system Ruby is not advised due to the restrictive permissions enforced on the system directories. As a general rule, we advise using one of the alternative Rubies provided by Chruby for all jobs.



### Switching Rubies with the macOS Orb (Recommended)

{: #switching-rubies-with-the-macos-orb-recommended }

Using the official macOS Orb (version `2.0.0` and above) is the easiest way to switch Rubies in your jobs. It automatically uses the correct switching command, regardless of which Xcode image is in use.

To get started, include the orb at the top of your config:



```yaml
# ...
orbs:
  macos: circleci/macos@2
```


Then, call the `switch-ruby` command with the version number required. For example, to switch to Ruby 2.6:



```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "2.6"
```


Replace `2.6` with the version you require from the Software Manifest file. You do not need to specify the full Ruby version, `3.0.2` for example, just the major version. This will ensure your config does not break when switching to newer images that might have newer patch versions of Ruby.

To switch back to the system default Ruby (the Ruby shipped by Apple with macOS), define the `version` as `system`:



```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "system"
```


**Note:** Xcode 11.7 images and later images default to Ruby 2.7 via `chruby` out of the box. Xcode 11.6 images and earlier default to the System Ruby.



### Images using Xcode 11.7 and later

{: #images-using-xcode-117-and-later }



{:.no_toc}

To switch to another Ruby version, add the following to the beginning of your job.



```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: sed -i '' 's/^chruby.*/chruby ruby-3.0/g' ~/.bash_profile
```


Replace `3.0` with the version of Ruby required - you do not need to specify the full Ruby version, `3.0.2` for example, just the major version. This will ensure your config does not break when switching to newer images that might have newer patch versions of Ruby.

To revert back to the system Ruby, add the following to the beginning of your job:



```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: sed -i '' 's/^chruby.*/chruby system/g' ~/.bash_profile
```




### Images using Xcode 11.2 and later

{: #images-using-xcode-112-and-later }



{:.no_toc}

If you do not want to commit a `.ruby-version` file to source control, then you can create the file from a job step:



```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: echo 'chruby ruby-2.6' >> ~/.bash_profile
```


Replace `2.6` with the version of Ruby required - you do not need to specify the full Ruby version, `2.6.5` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.



### Images using Xcode 11.1 and earlier

{: #images-using-xcode-111-and-earlier }



{:.no_toc}

To specify a version of Ruby to use, you can [create a file named `.ruby-version`, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching). This can be done from a job step, for example:



```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command:  echo "ruby-2.4" > ~/.ruby-version
```


Replace `2.4` with the version of Ruby required - you do not need to specify the full Ruby version, `2.4.9` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.



### Installing additional Ruby versions

{: #installing-additional-ruby-versions }

**Note:** Installing additional Ruby versions consumes a lot of job time. We only recommend doing this if you must use a specific version that is not installed in the image by default.

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby. We use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the appropriate technique above.



### Using Custom Versions of CocoaPods and Other Ruby Gems

{: #using-custom-versions-of-cocoapods-and-other-ruby-gems }



{:.no_toc}

To make sure the version of CocoaPods that you use locally is also used in your CircleCI builds, we suggest creating a Gemfile in your iOS project and adding the CocoaPods version to it:



```ruby
source 'https://rubygems.org'

gem 'cocoapods', '= 1.3.0'
```


Then you can install these using bundler:

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

You can then ensure you are using those, by prefixing commands with `bundle exec`:



```yaml
# ...
steps:
  - run: bundle exec pod install
```




## Using NodeJS

{: #using-nodejs }

The Xcode images are supplied with at least one version of NodeJS ready to use.



### Images using Xcode 13 and later

{: #images-using-xcode-13-and-later }

These images have NodeJS installations managed by `nvm` and will always be supplied with the latest `current` and `lts` release as of the time the image was built. Additionally, `lts` is set as the default NodeJS version.

Version information for the installed NodeJS versions can be found in [the software manifests for the image](#supported-xcode-versions)], or by running `nvm ls` during a job.

To set the `current` version as the default:



```yaml
# ...
steps:
  - run: nvm alias default node
```


To revert to the `lts` release:



```yaml
# ...
steps:
  - run: nvm alias default --lts
```


To install a specific version of NodeJS and use it:



```yaml
# ...
steps:
  - run: nvm install 12.22.3 && nvm alias default 12.22.3
```


These images are also compatiable with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node), which helps to manage your NodeJS installation along with caching packages.



### Images using Xcode 12.5 and earlier

{: #images-using-xcode-125-and-earlier }

These images come with at least one version of NodeJS installed directly using `brew`.

Version information for the installed NodeJS versions can be found in [the software manifests for the image](#supported-xcode-versions)].

These images are also compatiable with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node) which helps to manage your NodeJS installation, by installing `nvm`, along with caching packages.



## Using Homebrew

{: #using-homebrew }

[Homebrew](http://brew.sh/) is pre-installed on CircleCI, so you can simply use `brew install` to add nearly any dependency you require to complete your build. For example:



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


It is also possible to use the `sudo` command if necessary to perform customizations outside of Homebrew.



## Configuring deployment

{: #configuring-deployment }

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide]({{ site.baseurl }}/2.0/deploying-ios/)



## Reducing job time and best practises

{: #reducing-job-time-and-best-practises }



### Pre-starting the simulator

{: #pre-starting-the-simulator }

Pre-start the iOS simulator before building your application to make sure that the simulator is booted in time. Doing so generally reduces the number of simulator timeouts observed in builds.

To pre-start the simulator, add the macOS Orb (version `2.0.0` or higher) to your config:



```yaml
orbs:
  macos: circleci/macos@2
```


Then call the `preboot-simulator` command, as shown in the example below:



```yaml
steps:
  - macos/preboot-simulator:
      version: "15.0"
      platform: "iOS"
      device: "iPhone 13 Pro Max"
```


It is advisable to place this command early in your job to allow maximum time for the simulator to boot in the background.

If you require an iPhone simulator that is paired with an Apple Watch simulator, use the `preboot-paired-simulator` command in the macOS Orb:



```yaml
steps:
  - macos/preboot-paired-simulator:
      iphone-device: "iPhone 13"
      iphone-version: "15.0"
      watch-device: "Apple Watch Series 7 - 45mm"
      watch-version: "8.0"
```


**Note:** It may take a few minutes to boot a simulator, or longer if booting a pair of simulators. During this time, any calls to commands such as `xcrun simctl list` may appear to hang while the simulator is booting up.



### Collecting iOS simulator crash reports

{: #collecting-ios-simulator-crash-reports }



{:.no_toc}

Often if your `scan` step fails, for example due to a test runner timeout, it is likely that your app has crashed during the test run. In such cases, collecting crash report is useful for diagnosing the exact cause of the crash. Crash reports can be uploaded as artifacts, as follows:



```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```




### Fastlane の最適化

{: #optimizing-fastlane }



{:.no_toc}

デフォルトでは、Fastlane Scan はテスト出力レポートを `html` 形式および `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[Fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_types` を変更して、これらの形式を無効化することができます。



### CocoaPods の最適化

{: #optimizing-cocoapods }



{:.no_toc}

基本的なセットアップ手順に加えて、Specs リポジトリ全体をクローンするのではなく、CDN の利用が可能な CocoaPods 1.8 以降を使用することをお勧めします。 これにより、ポッドをすばやくインストールできるようになり、ビルド時間が短縮されます。 1.8 以降では `pod install` ステップのジョブ実行がかなり高速化されるので、1.7 以前を使用している場合はアップグレードを検討してください。

実行するには　Podfile ファイルの先頭行を次のように記述します。



```
source 'https://cdn.cocoapods.org/'
```


1.7 以前からアップグレードする場合はさらに、Podfile から以下の行を削除すると共に、CircleCI 設定ファイルの "Fetch CocoaPods Specs" ステップを削除します。



```
source 'https://github.com/CocoaPods/Specs.git'
```


CocoaPods を最新の安定版に更新するには、以下のコマンドで Ruby gem を更新します。



```
sudo gem install cocoapods
```


[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすることで、決定論的で再現可能なビルドを実現できます。

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
      xcode: 11.3.0
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

同じワークフロー内で、複数の [Executor タイプ](https://circleci.com/ja/docs/2.0/executor-types/)を使用することができます。 以下の例では、プッシュされる iOS プロジェクトは macOS 上でビルドされ、その他の iOS ツール ([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker で実行されます。



```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output

    steps:
      - checkout
      - run:
          name: CocoaPod のインストール
          command: pod install --verbose

      - run:
          name: ビルドとテストの実行
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します
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
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します
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

- CircleCI  で Fastlane を使用して iOS プロジェクトをビルド、テスト、署名、およびデプロイする完全なサンプルについては、[`circleci-demo-ios` の GitHub リポジトリ](https://github.com/CircleCI-Public/circleci-demo-ios) を参照してください。

- 設定ファイルの詳しい説明については、[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)を参照してください。

- Fastlane Match をプロジェクトに設定する方法は [iOS コード署名に関するドキュメント]({{ site.baseurl}}/2.0/ios-codesigning/)を参照してください。
