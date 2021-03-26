---
layout: classic-docs
title: "言語ガイド: Android"
short-title: "Android"
description: "CircleCI 2.0 での Android アプリのビルドとテスト"
categories:
  - language-guides
order: 9
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、CircleCI で Android プロジェクトをセットアップする方法について説明します。

* TOC
{:toc}


## 前提条件
{:.no_toc}

このガイドは以下を前提としています。

- [Gradle](https://gradle.org/) を使用して Android プロジェクトをビルドしている。 Gradle とは、[Android Studio](https://developer.android.com/studio) でプロジェクトを作成する際のデフォルトのビルド ツールです。
- プロジェクトが VCS リポジトリのルートに置かれている。
- プロジェクトのアプリケーションが `app` という名前のサブフォルダーに置かれている。

**Note:** CircleCI offers an Android machine image available on CircleCI Cloud that supports x86 Android emulators and nested virtualization. 利用方法に関するドキュメントは、[こちら]({{site.baseurl}}/2.0/android-machine-image)で参照できます。 または、[Firebase Test Lab](https://firebase.google.com/docs/test-lab) などの外部サービスを使用してエミュレーター テストを実行することもできます。 詳細については、後述のセクション「[Firebase Test Lab を使用したテスト](#firebase-test-lab-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E3%83%86%E3%82%B9%E3%83%88)」を参照してください。


## UI テストの設定ファイルの例

Android マシン イメージを使用した設定ファイルのサンプルを詳しく見ていきましょう。 Android マシン イメージの使用を構成するには、Orb を使用することも手動で行うこともできます。プロジェクトに最適な方法を選んでください。

```yaml
# .circleci/config.yaml
version: 2.1 # Orb を使用するには、CircleCI 2.1 を使用する必要があります
# 使用したい Orb を宣言します
# Android Orb のドキュメントは、こちらから参照できます: https://circleci.com/developer/ja/orbs/orb/circleci/android
orbs:
  android: circleci/android@1.0 
workflows:
  test:
    jobs:
      # このジョブではデフォルトで Android マシン イメージを使用します
      - android/run-ui-tests:
          # 必要に応じて事前ステップと事後ステップを使用して
          # ビルトイン ステップの前後でカスタム ステップを実行します
          system-image: system-images;android-29;default;x86
```

上記のように、Android Orb を使用すると構成がシンプルになります。[こちら]({{site.baseurl}}/ja/2.0/android-machine-image#E4%BE%8B)で、さまざまな複雑さの設定ファイルの例を比較できます。


## 単体テストの設定ファイルの例

CircleCI には、Android アプリのビルドに使用できる Docker イメージが用意されているので便利です。 これらのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/android/) から入手できます。 これらのイメージのソース コードと Dockerfile は、[こちらの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)で入手できます。

CircleCI Android イメージは、公式の [`openjdk:11-jdk`](https://hub.docker.com/_/openjdk/) Docker イメージに基づいており、この公式イメージは [buildpack-deps](https://hub.docker.com/_/buildpack-deps/) に基づいています。 ベース OS は Debian Jessie です。ビルドは、パスワードなしで `sudo` にフル アクセスできる `circleci` ユーザーとして実行されます。

以下の例は、Android マシン イメージではなく Android Docker イメージを使用する例を示しています。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: circleci/android:api-30-alpha
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    environment:
      JVM_OPTS: -Xmx3200m
    steps:
      - checkout
      - restore_cache:
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
#      - run:
#         name: Chmod パーミッション #Gradlew Dependencies のパーミッションが失敗する場合は、これを使用します
#         command: sudo chmod +x ./gradlew
      - run:
          name: 依存関係のダウンロード
          command: ./gradlew androidDependencies
      - save_cache:
          paths:
            - ~/.gradle
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
      - run:
          name: テストの実行
          command: ./gradlew lint test
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示されるようにします
          path: app/build/reports
          destination: reports
      - store_test_results: # テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示されるようにします
          path: app/build/test-results
      # デプロイの構成例は https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```
{% endraw %}

### React Native プロジェクト
{:.no_toc}

React Native プロジェクトは、Linux、Android、および macOS の機能を使用して CircleCI 2.0 上でビルドできます。 React Native プロジェクトの例については、GitHub で公開されている [React Native アプリケーションのサンプル](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。

## Firebase Test Lab を使用したテスト

**Note:**: While this portion of the document walks through using a third party tool for testing, CircleCI recommends using the [Android machine image]({{site.baseurl}}/2.0/android-machine-image) for running emulator tests.

CircleCI で Firebase Test Lab を使用するには、最初に以下の手順を行います。

1. **Create a Firebase project.** Follow the instructions in the [Firebase documentation](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project).

2. **Install and authorize the Google Cloud SDK.** Follow the instructions in the [Authorizing the Google Cloud SDK]({{ site.baseurl }}/2.0/google-auth/) document.

    **Note:** Instead of `google/cloud-sdk`, consider using an [Android convenience image]({{ site.baseurl }}/2.0/circleci-images/#android), which includes `gcloud` and Android-specific tools.

3. **Enable required APIs.** Using the service account you created, log into Google and go to the [Google Developers Console API Library page](https://console.developers.google.com/apis/library). Enable the **Google Cloud Testing API** and the **Cloud Tool Results API** by typing their names into the search box at the top of the console and clicking **Enable API**.

`.Circleci/config.yml` ファイルに、以下の `run` ステップを追加します。

1. **Build the debug APK and test APK.** Use Gradle to build two APKs. ビルドのパフォーマンスを向上させるために、[Pre-Dexing の無効化](#Pre-Dexing+%E3%81%AE%E7%84%A1%E5%8A%B9%E5%8C%96%E3%81%AB%E3%82%88%E3%82%8B%E3%83%93%E3%83%AB%E3%83%89+%E3%83%91%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%AE%E5%90%91%E4%B8%8A)を検討してください。

2. **Store the service account.** Store the service account you created in a local JSON file.

3. **Authorize `gcloud`**. `gcloud` ツールを承認し、デフォルトのプロジェクトを設定します。

4. **Use `gcloud` to test with Firebase Test Lab.** Adjust the paths to the APK files to correspond to your project.

5. **Install `crcmod` and use `gsutil` to copy test results data.** `crcmod` is required to use `gsutil`. `gsutil` を使用してバケット内の最新ファイルを CircleCI アーティファクト フォルダーにダウンロードします。 `BUCKET_NAME` と `OBJECT_NAME` は、プロジェクト固有の名前に置き換えてください。

```yaml
version: 2
jobs:
  test:
    docker:
      - image: circleci/android:api-28-alpha  # gcloud はこのイメージに含まれています
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - run:
          name: デバッグ APK とリリース APK のビルド
          command: |
            ./gradlew :app:assembleDebug
            ./gradlew :app:assembleDebugAndroidTest
      - run:
          name: Google サービス アカウントの保存
          command: echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
      - run:
          name: gcloud の承認とデフォルト プロジェクトの設定
          command: |
            sudo gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
            sudo gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
      - run:
          name: Firebase Test Lab でのテスト
          command: >
            sudo gcloud firebase test android run \ 
              --app <local_server_path>/<app_apk>.apk \ 
              --test <local_server_path>/<app_test_apk>.apk \ 
              --results-bucket cloud-test-${GOOGLE_PROJECT_ID}
      - run:
          name: gsutil 依存関係のインストールとテスト結果データのコピー
          command: |
            sudo pip install -U crcmod
            sudo gsutil -m cp -r -U `sudo gsutil ls gs://[BUCKET_NAME]/[OBJECT_NAME] | tail -1` ${CIRCLE_ARTIFACTS}/ | true
```

`gcloud` を使用して Firebase を実行する方法については、[Firebase の公式ドキュメント](https://firebase.google.com/docs/test-lab/android/command-line)を参照してください。


## デプロイ

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。

## トラブルシューティング

### メモリ不足エラーへの対処

ビルド中にメモリ不足 (OOM) エラーが発生することがあります。 JVM のメモリ使用をカスタマイズする基本的な方法については、「[Java メモリ エラーの回避とデバッグ]({{ site.baseurl }}/2.0/java-oom/)」を参照してください。

テストに [Robolectric](http://robolectric.org/) を使用している場合は、Gradle のメモリ使用を微調整する必要があります。 Gradle VM を複数のテストにフォークする場合、VM は事前にカスタマイズされた JVM メモリ パラメーターを受け取りません。 `build.gradle` ファイル内に `android.testOptions.unitTests.all { maxHeapSize = "1024m" }` を追加して、テスト用の追加 JVM ヒープを Gradle に提供する必要があります。 `all { maxHeapSize = "1024m" }` を既存の Android 構成ブロックに追加してもかまいません。その場合は以下のようになります。

```groovy
android {
    testOptions {
        unitTests {
            // その他の構成

            all {
                maxHeapSize = "1024m"
            }
        }
    }
```

それでも OOM の問題が解決しない場合は、Gradle の最大ワーカー数を `./gradlew test --max-workers 4` のように制限します。

### Pre-Dexing の無効化によるビルド パフォーマンスの向上
{:.no_toc}

依存関係を Pre-Dexing しても CircleCI でメリットはありません。 Pre-Dexing を無効にする方法については、[こちらのブログ記事](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/)を参照してください。

Gradle Android プラグインはデフォルトで依存関係を Pre-Dexing します。 Pre-Dexing は、Java バイトコードを Android バイトコードに変換し、コードの変更時にインクリメンタルに Dexing できるため、開発スピードの向上につながります。 ただし、CircleCI はクリーン ビルドを実行するため、実際には Pre-Dexing によってコンパイル時間が長引き、メモリ使用量も増加します。

### Google Play ストアへのデプロイ

CI ビルドから Play ストアにデプロイする場合には、いくつかのサードパーティ ソリューションを利用できます。 [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher) では、App Bundle や APK、アプリ メタデータをアップロードできます。 [fastlane](https://docs.fastlane.tools/getting-started/android/setup/) を Android で使用することも可能です。
