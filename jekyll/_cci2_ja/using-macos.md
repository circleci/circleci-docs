---
layout: classic-docs
title: "macOS 実行環境の使用"
description: "このページでは、macOS 実行環境で実行するジョブの設定方法について解説しています。"
version:
  - クラウド
---

macOS 実行環境は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS 実行環境を使用すると、仮想マシン (VM) 上の macOS 環境で[ジョブ]({{site.baseurl}}/ja/jobs-steps/)を実行できます。 macOS 実行環境にアクセスするには、`macos` Executor を使用して Xcode バージョンを指定します。

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

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
      xcode: 12.5.1
    resource_class: large
```

## macOS VM のストレージ
{: #macos-vm-storage }

CircleCI macOS 仮想マシンで使用できるストレージの量は、リソースクラスや使用される Xcode イメージによって異なります。 Xcode イメージのサイズは、プリインストールされているツールによって異なります。 次の表は、Xcode とリソースクラスの組み合わせごとの使用可能なストレージ量を表します。 また、表の下には例外が記載されています。

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

**注:** Xcode 12.0.1、12.4.0、12.5.1 を指定する場合、最小ストレージ容量は 100GB です。

## macOS Executor のイメージ更新サイクル
{: #using-the-macos-executor }

各 `macos` ジョブは、特定のバージョンの macOS を実行する新しい仮想マシン上で実行されます。 CircleCI では、Apple から新しい安定版 (またはベータ版) バージョンの Xcode がリリースされるたびに、新しいイメージをビルドしてデプロイします。 ほとんどの場合、ビルドイメージの内容は変更されません。 しかし、例外的に、CircleCI でコンテナの再ビルドが必要になる場合があります。 CircleCI では、安定した実行環境を維持し、`config.yml` ファイルに `xcode` キーを設定して、お客様が最新の macOS 環境にオプトインできるようにすることを目標としています。

実行環境が可能な限り最新になるようにするために、各イメージに含まれる macOS のバージョンを定期的に更新します。 macOS の新しいメジャーバージョンがリリースされると、Xcode の新しいメジャーバージョンが `xx.2` リリースに達した時点で CircleCI はアップデートを実行します。 このように実施することで、実行環境の安定性が保たれます。

Xcode のベータ版を含む、新しい macOS コンテナに関する情報は、[Discuss サイトの Announcements (お知らせ) ](https://discuss.circleci.com/c/announcements)で確認できます。

### ベータ版イメージのサポート
{: #beta-image-support }

CircleCI では、Xcode の次の安定版がリリースされる前に開発者の方々がアプリのテストを行えるよう、可能な限り早期に macOS Executor で Xcode のベータ版をリリースできるよう尽力します。

ベータ版イメージについては、CircleCI の安定版イメージ (更新されない) とは異なり、GM (安定版) イメージがリリースされ更新が停止するまでは、新規リリースのたびに既存のベータイメージが上書きされます。

現在ベータ版となっているバージョンの Xcode イメージを使用している場合、Apple が新しい Xcode ベータ版をリリースした際、最小限の通知によりそのイメージに変更が加えられることがあります。 これには、CircleCI では制御できない Xcode および関連ツールに関する互換性を損なう変更が含まれる場合があります。

ベータ版イメージに関する CircleCI のカスタマーサポートポリシーについては、[サポートセンターに関するこちらの記事](https://support.circleci.com/hc/ja/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-)をご覧ください。

### Apple シリコンのサポート
{: #apple-silicon-support }

Apple は、今回のリリースで Intel (`x86_64`) と Apple シリコン (`arm64`) の両方のツールチェーンを提供しているため、Xcode `12.0.0` 以降を使用して Apple シリコンバイナリおよびユニバーサルバイナリをビルドすることが可能です。 Intel のホスト上で Apple シリコンバイナリをクロスコンパイルするとオーバーヘッドが増加し、コンパイル時間が Intel のネイティブコンパイル時間より長くなります。

CircleCI ビルドホストは Intel ベースの Mac であるため、Apple シリコンアプリケーションをネイティブで実行またはテストすることは、現時点では不可能です。 アプリをローカルでテストするには、バイナリを[アーティファクト]({{site.baseurl}}/ja/artifacts/)としてエクスポートする必要があります。 または、[CircleCI ランナー]({{site.baseurl}}/ja/runner-overview/#supported)を使用して、Apple シリコン上でネイティブにジョブを実行することもできます。

## Xcode のクロスコンパイル
{: #xcode-cross-compilation }

### ユニバーサルバイナリ
{: #universal-binaries }

Xcode は現在、`x86_64` と `ARM64` の両方の CPU アーキテクチャで実行できるユニバーサルバイナリの作成をサポートしています。この場合、別々の実行可能ファイルをリリースする必要はありません。 この機能は Xcode 12.2 以降でのみサポートされていますが、古い Xcode バージョンを使用して、それぞれの `x86_64` と `ARM64` 実行可能ファイルをコンパイルすることもできます。

### 不要なアーキテクチャの抽出
{: #extracting-unwanted-architectures }

デフォルトで、Xcode 12.2 以降ではユニバーサルバイナリが作成され、`x86_64` および `ARM64` ベースの両方の CPU をサポートする単一の実行可能ファイルにコンパイルされます。 一連の説明を削除する必要がある場合は、`lipo` ユーティリティを使って削除できます。

`circleci-demo-macos` というユニバーサルバイナリからスタンドアロンの `x86_64` バイナリを作成する場合は、次のコマンドを実行します。

```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

次に、`lipo -info circleci-demo-macos-x86_64` を使って抽出したバイナリがサポートするアーキテクチャを確認します。すると、以下が出力されます。

```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```

### バイナリのクロスコンパイル
{: #cross-compiled-binaries }

ユニバーサルバイナリは、Xcode 12.2 以降でのみサポートされていますが、バイナリのビルドに使用されるマシンのアーキテクチャ以外のアーキテクチャ用にバイナリをクロスコンパイルすることが可能です。 xcodebuild の場合、プロセスは比較的簡単です。 `ARM64` バイナリをビルドするには、`xcodebuild` コマンドの先頭に `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` を追加して、`xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...` となるようにします。 `x86_64` アーキテクチャの場合、`ARCHS` を `x86_64` に変更します。

## 最適化とベストプラクティス
{: #optimization-and-best-practises }

### シミュレーターの事前起動
{: #pre-starting-the-simulator }

アプリケーションをビルドする前に iOS シミュレーターを起動して、シミュレーターの稼働が遅れないようにします。 こうすることで、ビルド中にシミュレーターのタイムアウトが発生する回数を全般的に減らすことができます。

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

**注:** シミュレーターを起動するには数分、ペアのシミュレーターを起動するにはそれ以上かかる場合があります。 この間、`xcrun simctl list` などのコマンドの呼び出しは、シミュレータの起動中にハングしたように見える場合があります。

### iOS シミュレーターのクラッシュレポートの収集
{: #collecting-ios-simulator-crash-reports }

テストランナーのタイムアウトなどの理由で `scan` ステップが失敗する場合、多くの場合テストの実行中にアプリケーションがクラッシュした可能性があります。 このような場合、クラッシュレポートを収集することでクラッシュの正確な原因を診断することができます。 クラッシュレポートをアーティファクトとしてアップロードする方法は以下の通りです。

```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```

### fastlane の最適化
{: #optimizing-fastlane }

デフォルトで、fastlane scan はテスト出力レポートを `html` 形式や `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_type` を変更して、これらの形式を無効化することを検討してください。

### CocoaPods の最適化
{: #optimizing-cocoapods }

基本的なセットアップ手順に加えて、Specs リポジトリ全体をクローンするのではなく、CDN を利用できる CocoaPods 1.8 以降を使用することをお勧めします。 ポッドをすばやくインストールできるようになり、ビルド時間が短縮されます。 1.8 以降では `pod install` ステップのジョブ実行がかなり高速化されるので、1.7 以前を使用している場合はアップグレードを検討してください。

実行するには Podfile ファイルの先頭行を次のように記述します。

```
source 'https://cdn.cocoapods.org/'
```

1.7 以前からアップグレードする場合はさらに、Podfile から以下の行を削除すると共に、CircleCI 設定ファイルの "Fetch CocoaPods Specs" ステップを削除します。

```
source 'https://github.com/CocoaPods/Specs.git'
```

CocoaPods を最新の安定版に更新するには、以下のコマンドで Ruby gem を更新します。

```shell
sudo gem install cocoapods
```

さらに、[Pods ディレクトリをソース管理に](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control)チェックインすることをお勧めします。 そうすることで、決定論的で再現可能なビルドを実現できます。

**注:** CocoaPods 1.8 のリリース以降、CocoaPods Spec リポジトリ用に提供した以前の S3 ミラーは整備も更新もされていません。 既存のジョブへの障害を防ぐために利用可能な状態ではありますが、上記の CDN 方式に変更することをお勧めします。

### Homebrew の最適化
{: #optimizing-homebrew }

デフォルトでは Homebrew はすべての操作の開始時に更新の有無を確認します。 Homebrew のリリースサイクルはかなり頻繁なため、`brew` を呼び出すステップはどれも完了するまでに時間がかかります。

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

### `config.yml` ファイルの作成
{: #creating-a-configyml-file }

プロジェクトの CircleCI 設定を `.circleci/config.yml `で変更することにより、ビルドを最も柔軟にカスタマイズすることができます。 この方法により、任意の bash コマンドを実行したり、ワークスペースやキャッシュなどの組み込み機能を利用することができます。 `.circleci/config.yml` ファイルの構造の詳細については、[CircleCI の設定]({{ site.baseurl }}/ja/configuration-reference/)ドキュメントを参照してください。

## 複数の Executor タイプ (macOS + Docker) の使用
{: #using-multiple-executor-types-macos-docker }

同じワークフロー内で、複数の [Executor タイプ]({{site.baseurl}}/ja/executor-intro/)を使用することができます。 以下の例では、プッシュされる iOS プロジェクトは macOS 上でビルドされ、その他の iOS ツール ([SwiftLint](https://github.com/realm/SwiftLint) と [Danger](https://github.com/danger/danger)) は Docker で実行されます。

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

## 次のステップ
{: #next-steps }

[CircleCI でシンプルな macOS アプリケーションを設定]({{ site.baseurl }}/ja/hello-world-macos)することから始めます。
