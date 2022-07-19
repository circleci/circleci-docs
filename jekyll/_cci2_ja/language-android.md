---
layout: classic-docs
title: "言語ガイド: Android"
short-title: "Android"
description: "CircleCI  での Android アプリのビルドとテスト"
categories: [language-guides]
order: 9
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI で Android プロジェクトをセットアップする方法について説明します。

* TOC
{:toc}


## 前提条件
{: #prerequisites }
{:.no_toc}

このガイドは以下を前提としています。

- [Gradle](https://gradle.org/) を使用して Android プロジェクトをビルドしている。 Gradle とは、[Android Studio](https://developer.android.com/studio) でプロジェクトを作成する際のデフォルトのビルドツールです。
- プロジェクトが VCS リポジトリのルートに置かれている。
- プロジェクトのアプリケーションが `app` という名前のサブフォルダーに置かれている。

**注:** CircleCI では、クラウド版 CircleCI で利用可能な x86 Android エミュレーターと、ネストされた仮想化をサポートしている Android マシンイメージを提供しています。 利用方法に関するドキュメントは、[こちら]({{site.baseurl}}/ja/android-machine-image)で参照できます。 または、[Firebase Test Lab](https://firebase.google.com/docs/test-lab) などの外部サービスを使用してエミュレーターテストを実行することもできます。 詳細については、下記の [Firebase Test Lab を使用したテスト](#testing-with-firebase-test-lab)を参照してください。


## UI テストの設定ファイルの例
{: #sample-configuration-for-ui-tests }

Android マシンイメージを使用した設定ファイルのサンプルを詳しく見ていきましょう。 Android マシンイメージを使用する際に、Orb を使用する方法、または、手動で設定行う方法があります。 プロジェクトに最適な方法をお選びください。

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

上記のように、Android Orb を使用すると設定がシンプルになります。[こちら]({{site.baseurl}}/ja/android-machine-image#examples)で、さまざまなサイズの設定ファイルの例を比較できます。


## 単体テストの設定ファイルの例
{: #sample-configuration-for-unit-tests }

CircleCI では、Android アプリのビルドに使用できる便利な Docker イメージを用意しています。 これらのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/android/) から入手できます。 これらのイメージのソースコードと Dockerfile は、[こちらの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)で入手できます。

CircleCI Android イメージは、公式の [`openjdk:11-jdk`](https://hub.docker.com/_/openjdk/) Docker イメージをベースにしており、この公式イメージは [buildpack-deps](https://hub.docker.com/_/buildpack-deps/) をベースにしています。 ベース OS は Debian Jessie です。 ビルドは、パスワードなしの `sudo` にフルアクセスできる `circleci` ユーザーとして実行されます。

以下の例は、Android マシンイメージではなく Android Docker イメージを使用する例を示しています。

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: cimg/android:2021.10.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      JVM_OPTS: -Xmx3200m
    steps:
      - checkout
      - restore_cache:
          key: jars-{{ checksum "build.gradle" }}-{{ checksum  "app/build.gradle" }}
#      - run:
#         name: Chmod パーミッション # Gradlew Dependencies のパーミッションが失敗する場合は、これを使用します
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
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/artifacts/
          path: app/build/reports
          destination: reports
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/collect-test-data/
          path: app/build/test-results
      # See https://circleci.com/docs/deployment-integrations/ for deploy examples
```
{% endraw %}

### React Native プロジェクト
{: #react-native-projects }
{:.no_toc}

React Native プロジェクトは、CircleCI 上で Linux、Android、および macOS を使用してビルドできます。 React Native プロジェクトの例については、GitHub で公開されている [React Native アプリケーションのサンプル](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。

## Firebase Test Lab を使用したテスト
{: #testing-with-firebase-test-lab }

**注:** ここではサードパーティ製ツールをテストに使用して説明していますが、エミュレーターテストを実行する際には [Android マシンイメージ]({{site.baseurl}}/ja/android-machine-image)を使用することをお勧めします。

CircleCI で Firebase Test Lab を使用するには、まず以下の手順を実行します。

1. **Firebase プロジェクトを作成する:** [Firebase のドキュメント](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project)の手順に従います。

2. **Google Cloud SDK をインストールおよび承認する:** 「[Google Cloud SDK の承認]({{ site.baseurl }}/ja/google-auth/)」の手順に従います。

    **注:** `google/cloud-sdk` の代わりに、[Android 用 CircleCI イメージ]({{ site.baseurl }}/ja/circleci-images/#android)の使用をご検討ください。

3. **必要な API を有効にする:** 作成したサービスアカウントを使用して Google にログインし、[Google Developers Console の API ライブラリページ](https://console.developers.google.com/apis/library)に移動したら、 コンソール上部の検索ボックスで **Google Cloud Testing API** と **Cloud Tool Results API** を検索し、それぞれ **API を有効にする** をクリックします。

`.circleci/config.yml` ファイルに、以下の `run` ステップを追加します。

1. **デバッグ APK とテスト APK をビルドする:** Gradle から 2 つの APK をビルドします。 ビルドのパフォーマンスを向上させるために、[Pre-Dexing の無効化](#disabling-pre-dexing-to-improve-build-performance)を検討してください。

2. **サービスアカウントを保存する:** 作成したサービスアカウントをローカルの JSON ファイルに保存します。

3. **`gcloud` を承認する:**. `gcloud` ツールを承認し、デフォルトのプロジェクトを設定します。

4. **`gcloud` を使用して Firebase Test Lab でテストする:** APK ファイルへのパスはプロジェクトに合わせて調整してください。

5. **`crcmod` をインストールし、`gsutil` を使用してテスト結果データをコピーする:** `gsutil` を使用するには `crcmod` が必要です。 `gsutil` を使用してバケット内の最新ファイルを CircleCI アーティファクトフォルダーにダウンロードします。 `BUCKET_NAME` と `OBJECT_NAME` は、プロジェクト固有の名前に置き換えてください。

```yaml
version: 2
jobs:
  test:
    docker:
      - image: cimg/android:2021.10.2  # gcloud is baked into this image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run:
          name: Build debug APK and release APK
          command: |
            ./gradlew :app:assembleDebug
            ./gradlew :app:assembleDebugAndroidTest
      - run:
          name: Store Google Service Account
          command: echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
      - run:
          name: Authorize gcloud and set config defaults
          command: |
            sudo gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
            sudo gcloud --quiet config set project ${GOOGLE_PROJECT_ID}
      - run:
          name: Test with Firebase Test Lab
          command: >
            sudo gcloud firebase test android run \
              --app <local_server_path>/<app_apk>.apk \
              --test <local_server_path>/<app_test_apk>.apk \
              --results-bucket cloud-test-${GOOGLE_PROJECT_ID}
      - run:
          name: Install gsutil dependency and copy test results data
          command: |
            sudo pip install -U crcmod
            sudo gsutil -m cp -r -U `sudo gsutil ls gs://[BUCKET_NAME]/[OBJECT_NAME] | tail -1` ${CIRCLE_ARTIFACTS}/ | true
```

`gcloud` を使用して Firebase を実行する方法については、[Firebase の公式ドキュメント](https://firebase.google.com/docs/test-lab/android/command-line)を参照してください。


## デプロイ
{: #deployment }

See the [Deploy]({{ site.baseurl }}/deployment-integrations/) document for examples of deploy target configurations.

## トラブルシューティング
{: #troubleshooting }

### メモリ不足エラーへの対処
{: #handling-out-of-memory-errors }

ビルド中にメモリ不足 (OOM) エラーが発生することがあります。 JVM のメモリ使用をカスタマイズする基本的な方法については、「[Java メモリエラーの回避とデバッグ]({{ site.baseurl }}/ja/java-oom/)」を参照してください。

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

それでも OOM の問題が解決しない場合は、Gradle の最大ワーカー数を `./gradlew test --max-workers 4` のように制限します。

### Pre-Dexing の無効化によるビルド パフォーマンスの向上
{: #disabling-pre-dexing-to-improve-build-performance }
{:.no_toc}

依存関係を Pre-Dexing しても CircleCI でメリットはありません。 Pre-Dexing を無効にする方法については、[こちらのブログ記事](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/)を参照してください。

Gradle Android プラグインはデフォルトで依存関係を Pre-Dexing します。 Pre-Dexing は、Java バイトコードを Android バイトコードに変換し、コードの変更時にインクリメンタルに Dexing できるため、開発スピードの向上につながります。 ただし、CircleCI はクリーン ビルドを実行するため、実際には Pre-Dexing によってコンパイル時間が長引き、メモリ使用量も増加します。

### Google Play ストアへのデプロイ
{: #deploying-to-google-play-store }

CI ビルドから Play ストアにデプロイする場合には、いくつかのサードパーティ ソリューションを利用できます。 [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher) では、App Bundle や APK、アプリ メタデータをアップロードできます。 [fastlane](https://docs.fastlane.tools/getting-started/android/setup/) を Android で使用することも可能です。
