---
layout: classic-docs
title: "macOS 実行環境の使用"
description: "このページでは、macOS 実行環境で実行するジョブの設定方法について解説しています。"
contentTags:
  platform:
    - クラウド
---

macOS 実行環境は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

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

## macOS VM のストレージ
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

Xcode 12.0.1、12.4.0、12.5.1 を指定する場合、最小ストレージ容量は 100GB です。
{: class="alert alert-info"}

## macOS Executor のイメージ更新サイクル
{: #using-the-macos-executor }

各 `macos` ジョブは、特定のバージョンの macOS を実行する新しい仮想マシン上で実行されます。 CircleCI では、Apple から新しい安定版 (またはベータ版) バージョンの Xcode がリリースされるたびに、新しいイメージをビルドしてデプロイします。 ほとんどの場合、ビルドイメージの内容は変更されません。 しかし、例外的に、CircleCI でコンテナの再ビルドが必要になる場合があります。 CircleCI では、安定した実行環境を維持し、`.circleci/config.yml` ファイルに `xcode` キーを設定し、お客様が最新の macOS 環境にオプトインできる状態にすることを目標としています。

弊社では、実行環境を可能な限り最新の状態に保つために、各イメージに含まれる macOS のバージョンを定期的に更新しています。 macOS の新しいメジャーバージョンがリリースされると、Xcode の新しいメジャーバージョンが `xx.2` リリースに達した時点で更新を行います。 これにより、実行環境の安定性が保たれます。

Xcode のベータ版を含む、新しい macOS コンテナに関する情報は、[Discuss サイト](https://discuss.circleci.com/c/announcements)の Announcements (お知らせ) で確認できます。

### ベータ版イメージのサポート
{: #beta-image-support }

CircleCI では、開発者の皆様が Xcode の次の安定版がリリースされる前にアプリのテストを行えるよう、Xcode のベータ版を macOS Executor で可能な限り早期にご利用いただけるよう尽力しています。

ベータ版イメージについては、CircleCI の安定版イメージ (更新されない) とは異なり、GM (安定版) イメージがリリースされ更新が停止するまでは、新規リリースのたびに既存のベータイメージが上書きされます。

現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際に、最小限の通知によりそのイメージに変更が加えられる場合があります。 これには、CircleCI では制御できない Xcode および関連ツールに互換性を損なう変更が含まれる場合があります。

ベータ版イメージに関する CircleCI のカスタマーサポートポリシーについては、[サポートセンターに関するこちらの記事](https://support.circleci.com/hc/ja/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

### Apple シリコンのサポート
{: #apple-silicon-support }

Apple は、今回のリリースで Intel (`x86_64`) と Apple シリコン (`arm64`) の両方のツールチェーンを提供しているため、Xcode `12.0.0` 以降を使用して Apple シリコンバイナリおよびユニバーサルバイナリをビルドすることが可能です。 Intel のホスト上で Apple シリコンバイナリをクロスコンパイルするとオーバーヘッドが増加し、コンパイル時間が Intel のネイティブコンパイル時間より長くなります。

CircleCI ビルドホストは Intel ベースの Mac であるため、Apple シリコンアプリケーションをネイティブで実行またはテストすることは、現時点では不可能です。 アプリケーションをローカルでテストするには、バイナリを [アーティファクト]({{site.baseurl}}/ja/artifacts/) としてエクスポートする必要があります。 または、

 CircleCI のランナーを使用して、 Apple シリコン上でネイティブにジョブを実行することもできます。</p> 



## Xcode のクロスコンパイル

{: #xcode-cross-compilation }



### ユニバーサルバイナリ

{: #universal-binaries }

Xcode は現在、`x86_64` と `ARM64` の両方の CPU アーキテクチャで実行できるユニバーサルバイナリの作成をサポートしています。この場合、別々の実行可能ファイルをリリースする必要はありません。 この機能は Xcode `12.2` 以降でのみサポートされていますが、古い Xcode バージョンを使用して、それぞれの `x86_64` と `ARM64` 実行可能ファイルをコンパイルすることもできます。



### 不要なアーキテクチャの抽出

{: #extract-unwanted-architectures }

デフォルトで、Xcode `12.2` 以降ではユニバーサルバイナリが作成され、`x86_64` および `ARM64` ベースの両方の CPU をサポートする単一の実行可能ファイルにコンパイルされます。 一連の説明を削除する必要がある場合は、`lipo` ユーティリティを使って削除できます。

`circleci-demo-macos` というユニバーサルバイナリからスタンドアロンの `x86_64` バイナリを作成する場合は、次のコマンドを実行します。



```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```


以下により抽出したバイナリのサポートアーキテクチャを確認できます。



```shell
lipo -info circleci-demo-macos-x86_64
```


これにより、以下が出力されます。



```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```




### バイナリのクロスコンパイル

{: #cross-compiled-binaries }

ユニバーサルバイナリは、Xcode `12.2` 以降でのみサポートされていますが、バイナリのビルドに使用されるマシンのアーキテクチャ以外のアーキテクチャ用にバイナリをクロスコンパイルすることが可能です。 `xcodebuild` の場合、プロセスは比較的簡単です。 `ARM64` バイナリをビルドするには、`xcodebuild` コマンドの先頭に `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` を追加して、`xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...` となるようにします。 `x86_64` アーキテクチャの場合、`ARCHS` を `x86_64` に変更します。



## 最適化とベストプラクティス

{: #optimization-and-best-practices }



### シミュレーターの事前起動

{: #pre-start-the-simulator }

アプリケーションをビルドする前に iOS シミュレーターをあらかじめ起動して、シミュレーターの稼働が遅れないようにします。 こうすることで、ビルド中にシミュレーターのタイムアウトが発生する回数を全般的に減らすことができます。

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


シミュレーターの起動には数分、ペアのシミュレーターの起動にはそれ以上かかる場合があります。 この間、`xcrun simctl list` などのコマンドの呼び出しは、シミュレータの起動中にハングしたように見える場合があります。 

{: class="alert alert-info"}



### iOS シミュレーターのクラッシュレポートの収集

{: #collecting-ios-simulator-crash-reports }

テストランナーのタイムアウトなどの理由で `scan` ステップが失敗する場合、多くの場合テストの実行中にアプリケーションがクラッシュした可能性があります。 このような場合、クラッシュレポートを収集することでクラッシュの正確な原因を診断することができます。 クラッシュレポートをアーティファクトとしてアップロードする方法は以下の通りです。



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


1.7 以前のバージョンからアップグレードする場合は必ず、CircleCI 設定ファイルの **Fetch CocoaPods Specs** ステップと Podfile から以下の行を削除します。



```
source 'https://github.com/CocoaPods/Specs.git'
```


CocoaPods を最新の安定版に更新するには、以下のコマンドで Ruby gem を更新します。



```shell
sudo gem install cocoapods
```


さらに、[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすることで、決定論的で再現可能なビルドを実現できます。

CocoaPods 1.8 のリリース以降、CocoaPods Spec リポジトリ用に提供した以前の S3 ミラーは整備も更新もされていません。 既存のジョブへの障害を防ぐために利用可能な状態ではありますが、上記の CDN 方式に変更することをお勧めします。 

{: class="alert alert-warning"}




### Homebrew の最適化

{: #optimizing-homebrew }

デフォルトでは、Homebrew はすべての操作の開始時に更新の有無を確認します。 Homebrew のリリースサイクルはかなり頻繁なため、`brew` を呼び出すステップはどれも完了するまでに時間がかかります。

ビルドのスピード、または Homebrew の新たな更新によるバグが問題であれば、自動更新を無効にすることができます。 それにより、1 つのジョブにつき最大で平均 2-5 分短縮することができます。

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

同じワークフロー内で、複数の [Executor タイプ]({{site.baseurl}}/ja/executor-intro/)を使用することができます。 下記の例では、iOS プロジェクトの各プッシュは macOS でビルドされ、デプロイイメージは Docker で実行されます。



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

[CircleCI でシンプルな macOS アプリケーションの設定]({{site.baseurl}}/ja/hello-world-macos)を始めましょう。
