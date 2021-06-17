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

This guide assumes the following:

- [Gradle](https://gradle.org/) を使用して Android プロジェクトをビルドしている。 Gradle とは、[Android Studio](https://developer.android.com/studio) でプロジェクトを作成する際のデフォルトのビルド ツールです。
- プロジェクトが VCS リポジトリのルートに置かれている。
- プロジェクトのアプリケーションが `app` という名前のサブフォルダーに置かれている。

**Note:** CircleCI offers an Android machine image available on CircleCI Cloud that supports x86 Android emulators and nested virtualization. Documentation on how to access it is available [here]({{site.baseurl}}/2.0/android-machine-image). Another way to run emulator tests from a job is to consider using an external service like [Firebase Test Lab](https://firebase.google.com/docs/test-lab). For more details, see the [Testing With Firebase Test Lab](#testing-with-firebase-test-lab) section below.


## UI テストの設定ファイルの例
{: #sample-configuration-for-ui-tests }

Let's walk through a sample configuration using the Android machine image. It is possible to use both orbs and to manually configure the use of the Android machine image to best suit your project.

```yaml
# .circleci/config.yaml
version: 2.1 # Orb を使用するには、CircleCI 2.1 を使用する必要があります
# 使用したい Orb を宣言します
# Android orb docs are available here:  https://circleci.com/developer/orbs/orb/circleci/android
orbs:
  android: circleci/android@1.0
workflows:
  test:
    jobs:
      # This job uses the Android machine image by default
      - android/run-ui-tests:
          # Use pre-steps and post-steps if necessary
          # to execute custom steps before and afer any of the built-in steps
          system-image: system-images;android-29;default;x86
```

As per above, using the Android orb will simplify your configuration; you can compare and contrast examples of different sizes [here]({{site.baseurl}}/2.0/android-machine-image#examples).


## 単体テストの設定ファイルの例
{: #sample-configuration-for-unit-tests }

For convenience, CircleCI provides a set of Docker images for building Android apps. These pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/android/). The source code and Dockerfiles for these images are available in [this GitHub repository](https://github.com/circleci/circleci-images/tree/master/android).

The CircleCI Android image is based on the [`openjdk:11-jdk`](https://hub.docker.com/_/openjdk/) official Docker image, which is based on [buildpack-deps](https://hub.docker.com/_/buildpack-deps/). The base OS is Debian Jessie, and builds run as the `circleci` user, which has full access to passwordless `sudo`.

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
```
{% endraw %}

### React Native プロジェクト
{: #react-native-projects }
{:.no_toc}

React Native projects can be built on CircleCI 2.0 using Linux, Android and macOS capabilities. Please check out [this example React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native) on GitHub for a full example of a React Native project.

## Firebase Test Lab を使用したテスト
{: #testing-with-firebase-test-lab }

**Note:**: While this portion of the document walks through using a third party tool for testing, CircleCI recommends using the [Android machine image]({{site.baseurl}}/2.0/android-machine-image) for running emulator tests.

To use Firebase Test Lab with CircleCI, first complete the following steps.

1. **Firebase プロジェクトを作成する:** [Firebase のドキュメント](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project)の手順に従います。

2. **Google Cloud SDK をインストールおよび承認する:** 「[Google Cloud SDK の承認]({{ site.baseurl }}/2.0/google-auth/)」の手順に従います。

    **メモ:** `google/cloud-sdk` の代わりに、[Android コンビニエンス イメージ]({{ site.baseurl }}/2.0/circleci-images/#android)の使用を検討してください。このイメージには、`gcloud` と Android に特化したツールが含まれています。

3. **必要な API を有効にする:** 作成したサービス アカウントを使用して Google にログインし、[Google Developers Console の API ライブラリ ページ](https://console.developers.google.com/apis/library)に移動したら、 コンソール上部の検索ボックスで **Google Cloud Testing API** と **Cloud Tool Results API** を検索し、それぞれ **[有効にする]** をクリックします。

In your `.circleci/config.yml` file, add the following `run` steps.

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
      - image: circleci/android:api-28-alpha  # gcloud is baked into this image
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

For more details on using `gcloud` to run Firebase, see the [official documentation](https://firebase.google.com/docs/test-lab/android/command-line).


## デプロイ
{: #deployment }

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

## トラブルシューティング
{: #troubleshooting }

### メモリ不足エラーへの対処
{: #handling-out-of-memory-errors }

You might run into out of memory (oom) errors with your build. To get acquainted with the basics of customizing the JVM's memory usage, consider reading the [Debugging Java OOM errors]({{ site.baseurl }}/2.0/java-oom/) document.

If you are using [Robolectric](http://robolectric.org/) for testing you may need to make tweaks to gradle's use of memory. When the gradle vm is forked for tests it does not receive previously customized JVM memory parameters. You will need to supply Gradle with additional JVM heap for tests in your `build.gradle` file by adding `android.testOptions.unitTests.all { maxHeapSize = "1024m" }`. You can also add `all { maxHeapSize = "1024m" }` to your existing Android config block, which could look like so after the addition:

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

Pre-dexing dependencies has no benefit on CircleCI. To disable pre-dexing, refer to [this blog post](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/).

By default, the Gradle Android plugin pre-dexes dependencies. Pre-dexing speeds up development by converting Java bytecode into Android bytecode, allowing incremental dexing as you change code. CircleCI runs clean builds, so pre-dexing actually increases compilation time and may also increase memory usage.

### Google Play ストアへのデプロイ
{: #deploying-to-google-play-store }

There are a few third-party solutions for deploying to the Play Store from your CI build. [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher) enables you to upload an App Bundle/APK as well as app metadata. It's also possible to use [Fastlane](https://docs.fastlane.tools/getting-started/android/setup/) with Android.
