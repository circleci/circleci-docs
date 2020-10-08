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

- 目次
{:toc}

## 概要
{:.no_toc}

ここでは、CircleCI での Android 開発の概要を説明します。 Android 用の `.circleci/config.yml` テンプレートをお探しの場合は、このページの「[設定ファイルの例](#設定ファイルの例)」を参照してください。

**メモ:** CircleCI が Linux 上で使用している仮想化では、Android エミュレーターの実行がサポートされません。 ジョブからエミュレーター テストを実行するには、[Firebase Test Lab](https://firebase.google.com/docs/test-lab) などの外部サービスを使用してください。 詳細については、後述のセクション「[Firebase Test Lab を使用したテスト](#firebase-test-lab-を使用したテスト)」を参照してください。

## 前提条件
{:.no_toc}

このガイドは以下を前提としています。

- [Gradle](https://gradle.org/) を使用して Android プロジェクトをビルドしている。 Gradle とは、[Android Studio](https://developer.android.com/studio) でプロジェクトを作成する際のデフォルトのビルド ツールです。
- プロジェクトが VCS リポジトリのルートに置かれている。
- プロジェクトのアプリケーションが `app` という名前のサブフォルダーに置かれている。

## 設定ファイルの例

{% raw %}

```yaml
version: 2
jobs:
  build:
    working_directory: ~/code
    docker:
      - image: circleci/android:api-25-alpha
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
#         name: Chmod permissions #if permission for Gradlew Dependencies fail, use this.
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
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/ 
          path: app/build/reports
          destination: reports
      - store_test_results: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示されるようにします
          path: app/build/test-results
      # テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示されるようにします
```

{% endraw %}

## 設定ファイルの詳細

必ずバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 1 つひとつのジョブが、ビルド、テスト、デプロイのプロセス内の各段階を表します。 このサンプル アプリケーションでは 1 つの `build` ジョブのみが必要なので、このキーの下に各要素を記述します。

ジョブには、`working_directory` を指定するオプションがあります。 これは、コードのチェックアウト先のディレクトリです。他のディレクトリを指定しない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとなります。

```yaml
jobs:
  build:
    working_directory: ~/code
```

`working_directory` の直下の `docker` キーで、コンテナ イメージを指定できます。

```yaml
    docker:
      - image: circleci/android:api-25-alpha
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

`api-25-alpha` タグを指定して CircleCI 提供の Android イメージを使用します。 使用可能なイメージの詳細については、以下の「[Docker イメージ](#docker-イメージ)」を参照してください。

次に、`build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を記述します。

次に、キャッシュをプル ダウンします (存在する場合)。 初回実行時、またはいずれかの `build.gradle` ファイルを変更した場合、このステップは実行されません。 さらに `./gradlew androidDependencies` を実行して、プロジェクトの依存関係をプル ダウンします。 通常、このタスクは必要時に自動的に実行されるため、これを直接呼び出すことはありません。ただし、このタスクを直接呼び出すことで、`save_cache` ステップを挿入して依存関係を保存し、次回の処理を高速化することができます。

`./gradlew lint test` で単体テストを実行し、組み込みの Lint ツールによって、コードのスタイルに問題がないかをチェックします。

ビルド レポートをジョブ アーティファクトとしてアップロードし、CircleCI で処理するテスト メタデータ (XML) をアップロードします。

## Docker イメージ

CircleCI には、Android アプリのビルドに使用できる Docker イメージが用意されているので便利です。 これらのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/android/) から入手できます。 これらのイメージのソース コードと Dockerfile は、[こちらの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)で入手できます。

The CircleCI Android image is based on the [`openjdk:11-jdk`](https://hub.docker.com/_/openjdk/) official Docker image, which is based on [buildpack-deps](https://hub.docker.com/_/buildpack-deps/). ベース OS は Debian Jessie です。ビルドは、パスワードなしで `sudo` にフル アクセスできる `circleci` ユーザーとして実行されます。

### API レベル
{:.no_toc}

[Android API レベル](https://source.android.com/source/build-numbers)ごとに異なる Docker イメージが用意されています。 ジョブで API レベル 24 (Nougat 7.0) を使用するには、`circleci/android:api-24-alpha` を選択します。

### Customizing the Images
{:.no_toc}

We welcome contributions [on our GitHub repo for the Android image](https://github.com/circleci/circleci-images/tree/master/android). Our goal is provide a base image that has *most* of the tools you need; we do not plan to provide *every* tool that you might need.

To customize the image, create a Dockerfile that builds `FROM` the `circleci/android` image. See [Using Custom-Built Docker Images]({{ site.baseurl }}/2.0/custom-images/) for instructions.

You can also use the [CircleCI Android Orb](https://circleci.com/developer/orbs/orb/circleci/android) to select your desired Android SDK and NDK.

### React Native Projects
{:.no_toc}

React Native projects can be built on CircleCI 2.0 using Linux, Android and macOS capabilities. Please check out [this example React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native) on GitHub for a full example of a React Native project.

## Firebase Test Lab を使用したテスト

To use Firebase Test Lab with CircleCI, first complete the following steps.

1. **Firebase プロジェクトを作成する:** [Firebase のドキュメント](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project)の手順に従います。

2. **Google Cloud SDK をインストールおよび承認する:** 「[Google Cloud SDK の承認]({{ site.baseurl }}/2.0/google-auth/)」の手順に従います。
    
    **メモ:** `google/cloud-sdk` の代わりに、[Android コンビニエンス イメージ]({{ site.baseurl }}/2.0/circleci-images/#android)の使用を検討してください。このイメージには、`gcloud` と Android に特化したツールが含まれています。

3. **必要な API を有効にする:** 作成したサービス アカウントを使用して Google にログインし、[Google Developers Console の API ライブラリ ページ](https://console.developers.google.com/apis/library)に移動したら、 コンソール上部の検索ボックスで **Google Cloud Testing API** と **Cloud Tool Results API** を検索し、それぞれ **[有効にする]** をクリックします。

In your `.circleci/config.yml` file, add the following `run` steps.

1. **デバッグ APK とテスト APK をビルドする:** Gradle から 2 つの APK をビルドします。 ビルドのパフォーマンスを向上させるために、[Pre-Dexing の無効化](#pre-dexing-の無効化によるビルド-パフォーマンスの向上)を検討してください。

2. **サービス アカウントを保存する:** 作成したサービス アカウントをローカルの JSON ファイルに保存します。

3. **`gcloud` を承認する:** `gcloud` ツールを承認し、デフォルトのプロジェクトを設定します。

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

See the [Deploy]({{ site.baseurl }}/2.0/deployment-integrations/) document for examples of deploy target configurations.

## トラブルシューティング

### Handling Out Of Memory Errors

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

### Disabling Pre-Dexing to Improve Build Performance
{:.no_toc}

Pre-dexing dependencies has no benefit on CircleCI. To disable pre-dexing, refer to [this blog post](http://www.littlerobots.nl/blog/disable-android-pre-dexing-on-ci-builds/).

By default, the Gradle Android plugin pre-dexes dependencies. Pre-dexing speeds up development by converting Java bytecode into Android bytecode, allowing incremental dexing as you change code. CircleCI runs clean builds, so pre-dexing actually increases compilation time and may also increase memory usage.

### Deploying to Google Play Store

There are a few third-party solutions for deploying to the Play Store from your CI build. [Gradle Play Publisher](https://github.com/Triple-T/gradle-play-publisher) enables you to upload an App Bundle/APK as well as app metadata. It's also possible to use [Fastlane](https://docs.fastlane.tools/getting-started/android/setup/) with Android.