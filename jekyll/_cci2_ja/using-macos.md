---
layout: classic-docs
title: "macOS 実行環境の使用"
description: "このページでは、macOS 実行環境で実行するジョブの設定方法について解説しています。"
version:
  - クラウド
---

macOS 実行環境は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch, and Apple TV simulators.

macOS 実行環境を使用すると、仮想マシン (VM) 上の macOS 環境で[ジョブ]({{site.baseurl}}/ja/jobs-steps/)を実行できます。 macOS 実行環境にアクセスするには、`macos` Executor を使用して Xcode バージョンを指定します。

```yaml
jobs:
  build:
    macos:
      xcode: 13.4.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

## サポートされている Xcode のバージョン
{: #supported-xcode-versions }

{% include snippets/ja/xcode-versions.md %}

## 利用可能なリソースクラス
{: #available-resource-classes }

{% include snippets/ja/macos-resource-table.md %}

```yaml
jobs:
  build:
    macos:
      xcode: 13.4.1
    resource_class: large
```

## macOS VM storage
{: #macos-vm-storage }

CircleCI macOS 仮想マシンで使用できるストレージの量は、リソースクラスや使用される Xcode イメージによって異なります。 Xcode イメージのサイズは、プリインストールされているツールによって異なります。 以下の表で、Xcode とリソースクラスの各組み合わせにおける使用可能なストレージ量をご確認ください。 また、表の下に記載されている例外もご確認ください。

| Xcode のバージョン | クラス                   | 最小ストレージ容量 |
| ------------ | --------------------- | --------- |
| 10.3.0       | Medium、Large          | 36GB      |
| 10.3.0       | macos.x86.medium.gen2 | 36GB      |
| 11.*         | Medium、Large          | 23GB      |
| 11.*         | macos.x86.medium.gen2 | 23GB      |
| 12.*         | Medium、Large          | 30GB      |
| 12.*         | macos.x86.medium.gen2 | 30GB      |
| 13.*         | Medium、Large          | 23GB      |
| 13.*         | macos.x86.medium.gen2 | 89GB      |
{: class="table table-striped"}

If you specify Xcode 12.0.1, 12.4.0, or 12.5.1, you have a minimum 100GB of available storage.
{: class="alert alert-info"}

## macOS Executor のイメージ更新サイクル
{: #using-the-macos-executor }

Each `macos` job is run in a fresh virtual machine, using a specified version of macOS. CircleCI では、Apple から新しい安定版 (またはベータ版) バージョンの Xcode がリリースされるたびに、新しいイメージをビルドしてデプロイします。 ほとんどの場合、ビルドイメージの内容は変更されません。 しかし、例外的に、CircleCI でコンテナの再ビルドが必要になる場合があります。 CircleCI's goal is to keep your execution environment stable, and to allow you to opt-in to newer macOS environments by setting the `xcode` key in your `.circleci/config.yml` file.

弊社では、実行環境を可能な限り最新の状態に保つために、各イメージに含まれる macOS のバージョンを定期的に更新しています。 macOS の新しいメジャーバージョンがリリースされると、Xcode の新しいメジャーバージョンが `xx.2` リリースに達した時点で更新を行います。 これにより、実行環境の安定性が保たれます。

CircleCI will announce the availability of new macOS containers, including Xcode betas, in the announcements section of our [Discuss site](https://discuss.circleci.com/c/announcements).

### ベータ版イメージのサポート
{: #beta-image-support }

CircleCI では、開発者の皆様が Xcode の次の安定版がリリースされる前にアプリのテストを行えるよう、Xcode のベータ版を macOS Executor で可能な限り早期にご利用いただけるよう尽力しています。

ベータ版イメージについては、CircleCI の安定版イメージ (更新されない) とは異なり、GM (安定版) イメージがリリースされ更新が停止するまでは、新規リリースのたびに既存のベータイメージが上書きされます。

現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際に、最小限の通知によりそのイメージに変更が加えられる場合があります。 This can include breaking changes in Xcode and associated tooling, which are beyond CircleCI's control.

ベータ版イメージに関する CircleCI のカスタマーサポートポリシーについては、[サポートセンターに関するこちらの記事](https://support.circleci.com/hc/ja/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

### Apple シリコンのサポート
{: #apple-silicon-support }

It is possible to build Apple Silicon/universal binaries using Xcode `12.0.0` and higher, as Apple provides both the Intel (`x86_64`) and Apple Silicon (`arm64`) toolchains in this release. Intel のホスト上で Apple シリコンバイナリをクロスコンパイルするとオーバーヘッドが増加し、コンパイル時間が Intel のネイティブコンパイル時間より長くなります。

CircleCI ビルドホストは Intel ベースの Mac であるため、Apple シリコンアプリケーションをネイティブで実行またはテストすることは、現時点では不可能です。 アプリケーションをローカルでテストするには、バイナリを [アーティファクト]({{site.baseurl}}/ja/artifacts/) としてエクスポートする必要があります。 または、

 CircleCI のランナーを使用して、 Apple シリコン上でネイティブにジョブを実行することもできます。</p> 



## Xcode のクロスコンパイル

{: #xcode-cross-compilation }



### ユニバーサルバイナリ

{: #universal-binaries }

Xcode currently supports the creation of universal binaries which can be run on both `x86_64` and `ARM64` CPU architectures without needing to ship separate executables. This is supported only under Xcode `12.2`+, although older Xcode versions can still be used to compile separate `x86_64` and `ARM64` executables.



### Extract unwanted architectures

{: #extract-unwanted-architectures }

By default, Xcode `12.2`+ will create universal binaries, compiling to a single executable that supports both `x86_64` and `ARM64` based CPUs. If you need to remove an instruction set, you can do so by using the `lipo` utility.

Assuming that you want to create a standalone `x86_64` binary from a universal binary called `circleci-demo-macos`, you can do so by running the command:



```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```


You can then confirm the supported architecture of the extracted binary with the following:



```shell
lipo -info circleci-demo-macos-x86_64
```


Which will output the following:



```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```




### バイナリのクロスコンパイル

{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode `12.2`+, you can still cross compile binaries for architectures other than the architecture of the machine being used to build the binary. For `xcodebuild` the process is relatively straightforward. To build `ARM64` binaries, prepend the `xcodebuild` command with `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO ...`. For the `x86_64` architecture simply change `ARCHS` to `x86_64`.



## Optimization and best practices

{: #optimization-and-best-practices }



### Pre-start the simulator

{: #pre-start-the-simulator }

Pre-start the iOS simulator before building your application to make sure that the simulator is booted in time. Doing so generally reduces the number of simulator timeouts observed in builds.

シミュレーターを事前に起動するには、macOS Orb (バージョン `2.0.0` 以降) を設定ファイルに追加します。



```yaml
orbs:
  macos: circleci/macos@2
```


次に、`preboot-simulator` コマンドを以下の例のように呼び出します。



```yaml
steps:
  - macos/preboot-simulator:
      version: "15.0"
      platform: "iOS"
      device: "iPhone 13 Pro Max"
```


シミュレータがバックグラウンドで起動するまでの最大時間を確保するために、このコマンドをジョブの初期段階に配置することをお勧めします。

Apple Watch シミュレータとペアリングされた iPhone シミュレータが必要な場合は、macOS Orb で `preboot-paired-simulator` コマンドを使用します。



```yaml
steps:
  - macos/preboot-paired-simulator:
      iphone-device: "iPhone 13"
      iphone-version: "15.0"
      watch-device: "Apple Watch Series 7 - 45mm"
      watch-version: "8.0"
```


It may take a few minutes to boot a simulator, or longer if booting a pair of simulators. この間、`xcrun simctl list` などのコマンドの呼び出しは、シミュレータの起動中にハングしたように見える場合があります。 

{: class="alert alert-info"}



### iOS シミュレーターのクラッシュレポートの収集

{: #collecting-ios-simulator-crash-reports }

Often if your `scan` step fails, for example, due to a test runner timeout, it is likely that your app has crashed during the test run. このような場合、クラッシュレポートを収集することでクラッシュの正確な原因を診断することができます。 クラッシュレポートをアーティファクトとしてアップロードする方法は以下の通りです。



```yaml
# ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```




### fastlane の最適化

{: #optimizing-fastlane }

デフォルトでは、fastlane scan はテスト出力レポートを `html` 形式および `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_type` を変更して、これらの形式を無効化することを検討してください。



### CocoaPods の最適化

{: #optimizing-cocoapods }

基本的なセットアップ手順に加えて、Specs リポジトリ全体をクローンするのではなく、CDN を利用できる CocoaPods 1.8 以降のバージョンを使用することをお勧めします。 そうすることで、ポッドをすばやくインストールできるようになり、ビルド時間が短縮されます。 1.8 以降のバージョンでは `pod install` ステップのジョブ実行がかなり高速化されるので、1.7 以前のバージョンを使用している場合はアップグレードを検討してください。

実行するには Podfile ファイルの先頭行を次のように記述します。



```
source 'https://cdn.cocoapods.org/'
```


If upgrading from Cocoapods 1.7 or older, ensure the **Fetch CocoaPods Specs** step is removed from your CircleCI configuration, and ensure the following line is removed from your Podfile:



```
source 'https://github.com/CocoaPods/Specs.git'
```


CocoaPods を最新の安定版に更新するには、以下のコマンドで Ruby gem を更新します。



```shell
sudo gem install cocoapods
```


さらに、[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすることで、決定論的で再現可能なビルドを実現できます。

The previous S3 mirror provided by CircleCI for the Cocoapods Spec repo is no longer being maintained or updated since the release of Cocoapods 1.8. It will remain available to prevent existing jobs breaking, however, switching to the CDN method described above is recommended. 

{: class="alert alert-warning"}




### Homebrew の最適化

{: #optimizing-homebrew }

デフォルトでは、Homebrew はすべての操作の開始時に更新の有無を確認します。 Homebrew のリリースサイクルはかなり頻繁なため、`brew` を呼び出すステップはどれも完了するまでに時間がかかります。

ビルドのスピード、または Homebrew の新たな更新によるバグが問題であれば、自動更新を無効にすることができます。 On average, this can save up to two to five minutes per job.

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

CircleCI では、macOS Executor を使って iOS のビルドやテストに関するほぼすべての戦略に合わせてビルドをカスタマイズできます。



### 一般的なテストツール

{: #common-test-tools }

以下のテストツールは、CircleCI で有効に機能することが確認されています。

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)
* [Appium](http://appium.io/)



### React Native プロジェクト

{: #react-native-projects }

React Native プロジェクトは、CircleCI 上で `macos` および `docker` Executor タイプを使用してビルドできます。 React Native プロジェクトの設定例は、[React Native のデモアプリケーション](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。



## 複数の Executor タイプ (macOS + Docker) の使用

{: #using-multiple-executor-types-macos-docker }

同じワークフロー内で、複数の [Executor タイプ]({{site.baseurl}}/ja/executor-intro/)を使用することができます。 In the following example each push of an iOS project will be built on macOS, and a deploy image will run in Docker.



```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 13.4.1
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

  deploy-snapshot:
    docker:
      - image: cimg/deploy:2022.08
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: echo "Do the things"

workflows:
  build-test-lint:
    jobs:
      - deploy-snapshot
      - build-and-test
```




## 次のステップ

{: #next-steps }

Get started with [Configuring a Simple macOS Application on CircleCI]({{site.baseurl}}/hello-world-macos).
