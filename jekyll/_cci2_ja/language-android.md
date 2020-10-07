---
layout: classic-docs
title: "言語ガイド: Android"
short-title: "Android"
description: "CircleCI 2.0 での Android アプリのビルドとテスト"
categories:
  - language-guides
order: 9
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
```

`api-25-alpha` タグを指定して CircleCI 提供の Android イメージを使用します。 使用可能なイメージの詳細については、以下の「[Docker イメージ](#docker-イメージ)」を参照してください。

次に、`build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を記述します。

次に、キャッシュをプル ダウンします (存在する場合)。 初回実行時、またはいずれかの `build.gradle` ファイルを変更した場合、このステップは実行されません。 さらに `./gradlew androidDependencies` を実行して、プロジェクトの依存関係をプル ダウンします。 通常、このタスクは必要時に自動的に実行されるため、これを直接呼び出すことはありません。ただし、このタスクを直接呼び出すことで、`save_cache` ステップを挿入して依存関係を保存し、次回の処理を高速化することができます。

`./gradlew lint test` で単体テストを実行し、組み込みの Lint ツールによって、コードのスタイルに問題がないかをチェックします。

ビルド レポートをジョブ アーティファクトとしてアップロードし、CircleCI で処理するテスト メタデータ (XML) をアップロードします。

## Docker イメージ

CircleCI には、Android アプリのビルドに使用できる Docker イメージが用意されているので便利です。 これらのビルド済みイメージは、[Docker Hub の CircleCI Org](https://hub.docker.com/r/circleci/android/) から入手できます。 これらのイメージのソース コードと Dockerfile は、[こちらの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)で入手できます。

CircleCI Android イメージは、公式の [`openjdk:8-jdk`](https://hub.docker.com/_/openjdk/) Docker イメージに基づいており、この公式イメージは [buildpack-deps](https://hub.docker.com/_/buildpack-deps/) に基づいています。 ベース OS は Debian Jessie です。ビルドは、パスワードなしで `sudo` にフル アクセスできる `circleci` ユーザーとして実行されます。

### API レベル
{:.no_toc}

[Android API レベル](https://source.android.com/source/build-numbers)ごとに異なる Docker イメージが用意されています。 ジョブで API レベル 24 (Nougat 7.0) を使用するには、`circleci/android:api-24-alpha` を選択します。

### Alpha タグ
{:.no_toc}

現在、CircleCI の Android Docker イメージには、サフィックス `-alpha` のタグが付いています。 このタグは、イメージが現在開発中であり、週ごとに下位互換性のない変更が加えられる可能性があることを示しています。

### イメージのカスタマイズ
{:.no_toc}

CircleCI では、[Android イメージの GitHub リポジトリ](https://github.com/circleci/circleci-images/tree/master/android)へのご協力をお待ちしております。 CircleCI の目標は、ユーザーが必要とするツールの*大半*に対応した基本イメージを提供することです。ユーザーが必要とする*すべて*のツールに対応することは計画していません。

イメージをカスタマイズするには、ベースにする `circleci/android` イメージを `FROM` で指定した Dockerfile を作成します。 手順については、「[カスタム ビルドの Docker イメージの使用]({{ site.baseurl }}/ja/2.0/custom-images/)」を参照してください。

[CircleCI Android Orb](https://circleci.com/developer/orbs/orb/circleci/android) を使用して目的の Android SDK と NDK を選択することも可能です。

### React Native プロジェクト
{:.no_toc}

React Native プロジェクトは、Linux、Android、および macOS の機能を使用して CircleCI 2.0 上でビルドできます。 詳細なサンプルについては、GitHub の [React Native アプリケーション サンプル](https://github.com/CircleCI-Public/circleci-demo-react-native)を参照してください。

## Firebase Test Lab を使用したテスト

CircleCI で Firebase Test Lab を使用するには、最初に以下の手順を行います。

1. **Firebase プロジェクトを作成する:** [Firebase のドキュメント](https://firebase.google.com/docs/test-lab/android/command-line#create_a_firebase_project)の手順に従います。

2. **Google Cloud SDK をインストールおよび承認する:** 「[Google Cloud SDK の承認]({{ site.baseurl }}/ja/2.0/google-auth/)」の手順に従います。
    
    **メモ:** `google/cloud-sdk` の代わりに、[Android コンビニエンス イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#android)の使用を検討してください。このイメージには、`gcloud` と Android に特化したツールが含まれています。

3. **必要な API を有効にする:** 作成したサービス アカウントを使用して Google にログインし、[Google Developers Console の API ライブラリ ページ](https://console.developers.google.com/apis/library)に移動したら、 コンソール上部の検索ボックスで **Google Cloud Testing API** と **Cloud Tool Results API** を検索し、それぞれ **[有効にする]** をクリックします。

`.circleci/config.yml` ファイルに、以下の `run` ステップを追加します。

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
      - image: circleci/android:api-28-alpha  # gcloud はこのイメージに含まれています
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

デプロイに関する構成の例は、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

## トラブルシューティング

### メモリ不足エラーへの対処

ビルド中にメモリ不足 (OOM) エラーが発生することがあります。 JVM のメモリ使用をカスタマイズする基本的な方法については、「[Java メモリ エラーの回避とデバッグ]({{ site.baseurl }}/ja/2.0/java-oom/)」を参照してください。

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
