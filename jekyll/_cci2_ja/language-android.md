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
{: #prerequisites }
{:.no_toc}

このガイドは以下を前提としています。

- [Gradle](https://gradle.org/) を使用して Android プロジェクトをビルドしている。 Gradle とは、[Android Studio](https://developer.android.com/studio) でプロジェクトを作成する際のデフォルトのビルド ツールです。
- プロジェクトが VCS リポジトリのルートに置かれている。
- プロジェクトのアプリケーションが `app` という名前のサブフォルダーに置かれている。

**メモ:** CircleCI では、クラウド版 CircleCI で利用可能な、x86 Android エミュレーターとネストされた仮想化をサポートしている Android マシン イメージを提供しています。 利用方法に関するドキュメントは、[こちら]({{site.baseurl}}/2.0/android-machine-image)で参照できます。 または、[Firebase Test Lab](https://firebase.google.com/docs/test-lab) などの外部サービスを使用してエミュレーター テストを実行することもできます。 詳細については、後述のセクション「[Firebase Test Lab を使用したテスト](#firebase-test-lab-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E3%83%86%E3%82%B9%E3%83%88)」を参照してください。


## UI テストの設定ファイルの例
{: #sample-configuration-for-ui-tests }

Android マシン イメージを使用した設定ファイルのサンプルを詳しく見ていきましょう。 Android マシン イメージを使用する際に、Orb を使用する方法、または、手動で設定行う方法があります。 プロジェクトに最適な方法を選んでください。

```yaml
# .circleci/config.yaml
version: 2.1 # to enable orb usage, you must be using circleci 2.1
# Declare the orbs you wish to use.
# .circleci/config.yaml
version: 2.1 # Orb を使用するには、CircleCI 2.1 を使用する必要があります
# 使用したい Orb を宣言します
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

以下の例は、Android マシン イメージではなく Android Docker イメージを使用する例を示しています。


## 単体テストの設定ファイルの例
{: #sample-configuration-for-unit-tests }

CircleCI には、Android アプリのビルドに使用できる便利な Docker イメージが用意しています。 これらのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/android/) から入手できます。 これらのイメージのソース コードと Dockerfile は、[こちらの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)で入手できます。

CircleCI Android イメージは、公式の [`openjdk:11-jdk`](https://hub.docker.com/_/openjdk/) Docker イメージをベースにしており、この公式イメージは [buildpack-deps](https://hub.docker.com/_/buildpack-deps/) をベースにしています。 ベース OS は Debian Jessie です。 ビルドは、パスワードなしの `sudo` にフル アクセスできる `circleci` ユーザーとして実行されます。

The following example demonstrates using an Android docker image rather than the Android machine image.

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
          name: Download Dependencies
          command: ./gradlew androidDependencies
      - save_cache:
          paths:
            - ~/.gradle
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
      - run:
          name: Run Tests
          command: ./gradlew lint test
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: app/build/reports
          destination: reports
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: app/build/test-results
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
#         command: sudo chmod +x ./gradlew
      - run:
          name: Download Dependencies
          command: ./gradlew androidDependencies
      - save_cache:
          paths:
            - ~/.gradle
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
      - run:
          name: Run Tests
          command: ./gradlew lint test
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: app/build/reports
          destination: reports
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: app/build/test-results
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
#         command: sudo chmod +x ./gradlew
      - run:
          name: Download Dependencies
          command: ./gradlew androidDependencies
      - save_cache:
          paths:
            - ~/.gradle
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
      - run:
          name: Run Tests
          command: ./gradlew lint test
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: app/build/reports
          destination: reports
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: app/build/test-results
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
```
{% endraw %}

### React Native プロジェクト
`.Circleci/config.yml` ファイルに、以下の `run` ステップを追加します。
{:.no_toc}

React Native プロジェクトは、Linux、Android、および macOS の機能を使用して CircleCI 2.0 上でビルドできます。 React Native プロジェクトの例については、GitHub で公開されている [React Native アプリケーションのサンプル](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。

## Firebase Test Lab を使用したテスト
**メモ:** `google/cloud-sdk` の代わりに、[Android コンビニエンス イメージ]({{ site.baseurl }}/2.0/circleci-images/#android)の使用を検討してください。

**Note:**: While this portion of the document walks through using a third party tool for testing, CircleCI recommends using the [Android machine image]({{site.baseurl}}/2.0/android-machine-image) for running emulator tests.

To use Firebase Test Lab with CircleCI, first complete the following steps.

1. **Firebase プロジェクトを作成する:** [Firebase のドキュメント](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project)の手順に従います。

2. **Google Cloud SDK をインストールおよび承認する:** 「[Google Cloud SDK の承認]({{ site.baseurl }}/2.0/google-auth/)」の手順に従います。

    **必要な API を有効にする:** 作成したサービス アカウントを使用して Google にログインし、[Google Developers Console の API ライブラリ ページ](https://console.developers.google.com/apis/library)に移動したら、 コンソール上部の検索ボックスで **Google Cloud Testing API** と **Cloud Tool Results API** を検索し、それぞれ **[有効にする]** をクリックします。

3. **Enable required APIs.** Using the service account you created, log into Google and go to the [Google Developers Console API Library page](https://console.developers.google.com/apis/library). Enable the **Google Cloud Testing API** and the **Cloud Tool Results API** by typing their names into the search box at the top of the console and clicking **Enable API**.

For more details on using `gcloud` to run Firebase, see the [official documentation](https://firebase.google.com/docs/test-lab/android/command-line).

1. **デバッグ APK とテスト APK をビルドする:** Gradle から 2 つの APK をビルドします。 ビルドのパフォーマンスを向上させるために、[Pre-Dexing の無効化](#Pre-Dexing+%E3%81%AE%E7%84%A1%E5%8A%B9%E5%8C%96%E3%81%AB%E3%82%88%E3%82%8B%E3%83%93%E3%83%AB%E3%83%89+%E3%83%91%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%AE%E5%90%91%E4%B8%8A)を検討してください。

2. **サービス アカウントを保存する:** 作成したサービス アカウントをローカルの JSON ファイルに保存します。

3. **`gcloud` を承認する:**. `gcloud` ツールを承認し、デフォルトのプロジェクトを設定します。

4. **`gcloud` を使用して Firebase Test Lab でテストする:** APK ファイルへのパスはプロジェクトに合わせて調整してください。

5. **`crcmod` をインストールし、`gsutil` を使用してテスト結果データをコピーする:** `gsutil` を使用するには `crcmod` が必要です。 `gsutil` を使用してバケット内の最新ファイルを CircleCI アーティファクト フォルダーにダウンロードします。 `BUCKET_NAME` と `OBJECT_NAME` は、プロジェクト固有の名前に置き換えてください。

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
{: #deployment }

デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。

## トラブルシューティング
{: #troubleshooting }

### メモリ不足エラーへの対処
{: #handling-out-of-memory-errors }

ビルド中にメモリ不足 (OOM) エラーが発生することがあります。 JVM のメモリ使用をカスタマイズする基本的な方法については、「[Java メモリ エラーの回避とデバッグ]({{ site.baseurl }}/2.0/java-oom/)」を参照してください。

テストに [Robolectric](http://robolectric.org/) を使用している場合は、Gradle のメモリ使用を微調整する必要があります。 Gradle VM を複数のテストにフォークする場合、VM は事前にカスタマイズされた JVM メモリ パラメーターを受け取りません。 `build.gradle` ファイル内に `android.testOptions.unitTests.all { maxHeapSize = "1024m" }` を追加して、テスト用の追加 JVM ヒープを Gradle に提供する必要があります。 `all { maxHeapSize = "1024m" }` を既存の Android 構成ブロックに追加してもかまいません。 その場合は以下のようになります。

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

If you are still running into OOM issues you can also limit the max workers for gradle: `./gradlew test --max-workers 4`

### Pre-Dexing の無効化によるビルド パフォーマンスの向上
{: #disabling-pre-dexing-to-improve-build-performance }
{:.no_toc}

依存関係を Pre-Dexing しても CircleCI でメリットはありません。 Pre-Dexing を無効にする方法については、[こちらのブログ記事](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/)を参照してください。

Gradle Android プラグインはデフォルトで依存関係を Pre-Dexing します。 Pre-Dexing は、Java バイトコードを Android バイトコードに変換し、コードの変更時にインクリメンタルに Dexing できるため、開発スピードの向上につながります。 ただし、CircleCI はクリーン ビルドを実行するため、実際には Pre-Dexing によってコンパイル時間が長引き、メモリ使用量も増加します。

### Google Play ストアへのデプロイ
{: #deploying-to-google-play-store }

CI ビルドから Play ストアにデプロイする場合には、いくつかのサードパーティ ソリューションを利用できます。 [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher) では、App Bundle や APK、アプリ メタデータをアップロードできます。 [fastlane](https://docs.fastlane.tools/getting-started/android/setup/) を Android で使用することも可能です。
