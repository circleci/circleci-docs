---
layout: classic-docs
title: "macOS 実行環境の使用"
description: "macOS 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
---

The macOS execution environment is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI. macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

You can use the macOS execution environment to run your [jobs]({{site.baseurl}}/2.0/jobs-steps/) in a macOS environment on a virtual machine (VM). You can access the macOS execution environment by using the `macos` executor and specifying an Xcode version:

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

The amount of available storage on CircleCI macOS virtual machines depends on the resource class and Xcode image being used. Xcode イメージのサイズは、プリインストールされているツールによって異なります。 The table below indicates how much storage will be available with various Xcode/resource class combinations. Also note the exceptions to this noted below.

| Xcode のバージョン | クラス                   | 最小ストレージ容量 |
| ------------ | --------------------- | --------- |
| 10.3.0       | Medium、Large          | 36GB      |
| 10.3.0       | macos.x86.medium.gen2 | 36GB      |
| 11.*         | Medium、Large          | 23GB      |
| 11.*         | macos.x86.medium.gen2 | 23GB      |
| 12.*         | Medium、Large          | 30 GB     |
| 12.*         | macos.x86.medium.gen2 | 30 GB     |
| 13.*         | Medium、Large          | 23GB      |
| 13.*         | macos.x86.medium.gen2 | 89GB      |
{: class="table table-striped"}

**Note:** If you specify Xcode 12.0.1, 12.4.0 and 12.5.1 you have a minimum 100GB of available storage.

## Image update cycle for the macOS executor
{: #using-the-macos-executor }

Each `macos` job is run in a fresh virtual machine, using a specified version macOS. CircleCI builds and deploys a new image each time a new stable, or beta, version of Xcode is released by Apple. The contents of build images remain unchanged in most circumstances. However, in exceptional circumstances CircleCI might be forced to re-build a container. CircleCI's goal is to keep your execution environment stable, and to allow you to opt-in to newer macOS environments by setting the `xcode` key in your `config.yml` file.

Periodically, CircleCI will update the version of macOS each image includes to ensure the execution environment is as up to date as possible. When a new major version of macOS is released, CircleCI will update once the new major version of Xcode reaches the `xx.2` release. This ensures the execution environment is kept stable.

CircleCI will announce the availability of new macOS containers, including Xcode betas, in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

### ベータ版イメージのサポート
{: #beta-image-support }

CircleCI aims to make beta Xcode versions available on the macOS executor as soon as possible to allow developers to test their apps ahead of the next stable Xcode release.

Unlike CircleCI's stable images (which are frozen and will not change), once a new beta image is released it will overwrite the previous beta image until a GM (stable) image is released, at which point the image is frozen and no longer updated.

If you are requesting an image using an Xcode version that is currently in beta, you should expect it to change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode/associated tooling which are beyond CircleCI's control.

To read about CircleCI's customer support policy regarding beta images, please check out the following [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

### Apple  シリコンのサポート
{: #apple-silicon-support }

Apple は、今回のリリースで Intel (`x86_64` ) と Apple シリコン(`arm64`)の両方のツールチェーンを提供しているため、 Xcode`12.0.0`以降を使用して Apple シリコンバイナリおよびユニバーサルバイナリをビルドすることが可能です。 Cross-compiling Apple Silicon binaries on Intel hosts has an additional overhead, and, as a result, compilation times will be longer than native compilation for Intel.

CircleCI ビルドホストは Intel ベースの Mac であるため、 Apple シリコン アプリケーションをネイティブで実行またはテストすることは現在不可能です。 アプリケーションをローカルでテストするには、バイナリを [アーティファクト]({{site.baseurl}}/2.0/artifacts/) としてエクスポートする必要があります。 または、

 CircleCI のランナーを使用して、 Apple シリコン上でネイティブにジョブを実行することもできます。</p> 



## Xcodeのクロスコンパイル

{: #xcode-cross-compilation }



### ユニバーサル バイナリ

{: #universal-binaries }

Xcode は現在、`x86_64` と `ARM64` の両方の CPU アーキテクチャで実行できるユニバーサルバイナリの作成をサポートしています。この場合、別々の実行可能ファイルをリリースする必要はありません。 This is supported only under Xcode 12.2+, although older Xcode versions can still be used to compile separate `x86_64` and `ARM64` executables.



### 不要なアーキテクチャの抽出

{: #extracting-unwanted-architectures }

By default, Xcode 12.2+ will create universal binaries, compiling to a single executable that supports both `x86_64` and `ARM64` based CPUs. If you need to remove an instruction set, you can do so by using the `lipo` utility.

Assuming that you want to create a standalone `x86_64` binary from a universal binary called `circleci-demo-macos`, you can do so by running the command:



```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```


You can then confirm the supported architecture of the extracted binary with `lipo -info circleci-demo-macos-x86_64`, which will output the following



```shell
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```




### バイナリのクロスコンパイル

{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still cross compile binaries for architectures other than the architecture of the machine being used to build the binary. For xcodebuild the process is relatively straightforward. To build `ARM64` binaries, prepend the `xcodebuild` command with `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...`. For the x86_64 architecture simply change `ARCHS` to `x86_64`.



## Optimization and best practises

{: #optimization-and-best-practises }



### シミュレーターの事前起動

{: #pre-starting-the-simulator }

アプリケーションをビルドする前に iOS シミュレーターを起動して、シミュレーターの稼働が遅れないようにします。 こうすることで、通常はビルド中にシミュレーターのタイムアウトが発生する回数を減らすことができます。

To pre-start the simulator, add the macOS orb (version `2.0.0` or higher) to your config:



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

If you require an iPhone simulator that is paired with an Apple Watch simulator, use the `preboot-paired-simulator` command in the macOS orb:



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

テストランナーのタイムアウトなどの理由で `scan` ステップが失敗する場合、多くの場合テストの実行中にアプリケーションがクラッシュした可能性があります。 このような場合、クラッシュレポートを収集することでクラッシュの正確な原因を診断することができます。 クラッシュレポートをアーティファクトとしてアップロードする方法は以下の通りです。



```yaml
# ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports

```




### fastlane の最適化

{: #optimizing-fastlane }

デフォルトで、fastlane scan はテスト出力レポートを `html` 形式や `junit` 形式で生成します。 テストに時間がかかり、これらの形式のレポートが必要でない場合は、[fastlane のドキュメント](https://docs.fastlane.tools/actions/run_tests/#parameters)で説明されているように、パラメーター `output_types` を変更して、これらの形式を無効化することを検討してください。



### CocoaPods の最適化

{: #optimizing-cocoapods }

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


A further recommendation is to check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control). そうすると、決定論的で再現可能なビルドを実現できます。

**Note:** The previous S3 mirror provided here for the Cocoapods Spec repo is no longer being maintained or updated since the release of Cocoapods 1.8. It will remain available to prevent existing jobs breaking, switching to the CDN method described above is recommended.



### Homebrew の最適化

{: #optimizing-homebrew }

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

以下のテストツールは、CircleCI で有効に機能することが確認されています。

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)
* [Appium](http://appium.io/)



### React Native プロジェクト

{: #react-native-projects }

React Native プロジェクトは、CircleCI  上で `macos` および `docker` Executor タイプを使用してビルドできます。 React Native プロジェクトの設定例は、[React Native のデモアプリケーション](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。



### `config.yml` ファイルの作成

{: #creating-a-configyml-file }

プロジェクトの CircleCI 設定を `.circleci/config.yml `で変更することにより、ビルドを最も柔軟にカスタマイズすることができます。 This allows you to run arbitrary bash commands as well as use built-in features such as workspaces and caching. See the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) documentation for a detailed description of the structure of the `.circleci/config.yml` file.



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




## 次のステップ

{: #next-steps }

Get started with [Configuring a Simple macOS Application on CircleCI]({{ site.baseurl }}/2.0/hello-world-macos).