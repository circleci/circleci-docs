---
layout: classic-docs
title: "Android イメージを Machine Executor で使用"
short-title: "Machine Executor 上の Android イメージ"
description: "Machine Executor で Android イメージを使用"
version:
  - Cloud
---

## 概要
{: #overview }

Android マシン イメージには、CircleCI で Linux マシン イメージにアクセスする場合と同様に、[Linux `machine` executor]({{site.baseurl}}/ja/2.0/configuration-reference/#machine-executor-linux) を通じてアクセスできます。 Android マシン イメージは、ネストされた仮想化と x86 Android エミュレーターをサポートしています。 そのため、Android UI テストに利用できます。 また、イメージには Android SDK がプリインストールされています。

## Android マシン イメージの使用
Android マシン イメージには以下がプリインストールされています。

設定ファイルに Android イメージを使用するには、[Orbs]({{site.baseurl}}/2.0/orb-intro) を使用して、または、手動で設定することができます。 Android Orb を使用すると設定がシンプルになりますが、複雑なカスタムな設定は手動で行った方が効果的です。 このドキュメントでは、どちらの設定方法についても説明します。 詳細は、後述の「[例](#%E4%BE%8B)」セクションを参照してください。

## プリインストールされたソフトウェア
以下で、Android マシン イメージの使用方法について、Orb あり、Orb なしのいくつかの設定例で説明します。

以下の例では、Android Orb を使用して 1 つのジョブを実行します。

### Android SDK
この例では、より細かな Orb コマンドを使用して、[start-emulator-and-run-tests](https://circleci.com/developer/ja/orbs/orb/circleci/android#commands-start-emulator-and-run-tests) コマンドの処理を実現する方法を示しています。
- sdkmanager
- Android プラットフォーム 23、24、25、26、27、28、29、30、S
- ビルド ツール 30.0.3
- エミュレーター、platform-tools、tools
- NDK (Side by side) 21.4.7075529
- cmake 3.6.4111459
- extras;android;m2repository、extras;google;m2repository、extras;google;google_play_service

### その他
{: #others }
- gcloud
- OpenJDK 8、OpenJDK 11 (デフォルト)
- maven 3.6.3、gradle 6.8.3、ant
- nodejs 12.21.0、14.16.0 (デフォルト)、15.11.0
- python 2.7.18、python 3.9.2
- ruby 2.7.2、ruby 3.0.0
- docker 20.10.5、docker-compose 1.28.5
- jq 1.6

## 制限事項
{: #limitations }

* ジョブが実行を開始するまでに、最大 2 分のスピンアップ時間がかかることがあります。 この時間は、Android イメージを利用するユーザーが増えるに連れ短縮されます。

## 料金プラン
{: #pricing }

料金情報に関しては、[料金ページ](https://circleci.com/ja/pricing/)の「Linux VM」セクションで Linux Machine Executor を参照してください。


## 例
{: #examples }

以下で、Android マシン イメージの使用方法について、Orb あり、Orb なしのいくつかの設定例で説明します。

### Orb を使用するシンプルな例
{: #simple-orb-usage }

以下の例では、Android Orb を使用して 1 つのジョブを実行します。

```yaml
# .circleci/config.yaml
version: 2.1
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


### Orb を使用する複雑な例
{: #more-complex-orb-usage }

この例では、より細かな Orb コマンドを使用して、[start-emulator-and-run-tests](https://circleci.com/developer/ja/orbs/orb/circleci/android#commands-start-emulator-and-run-tests) コマンドの処理を実現する方法を示しています。

```yaml
# .circleci/config.yml
version: 2.1
orbs:
  android: circleci/android@1.0
jobs:
  test:
    executor:
      name: android/android-machine
      resource-class: large
    steps:
      - checkout
      # "myavd" という名前の AVD を作成します
      - android/create-avd:
          avd-name: myavd
          system-image: system-images;android-29;default;x86
          install: true
      # デフォルトで、エミュレーターの起動後、キャッシュが復元されます
      # "./gradlew assembleDebugAndroidTest" が実行された後、スクリプトが
      # 実行され、エミュレーターの起動を待ちます
      # "post-emulator-launch-assemble-command" コマンドを指定して
      # gradle コマンドの実行をオーバーライドするか、"wait-for-emulator" を false に設定して
      # エミュレーターの待機を完全に無効にします
      - android/start-emulator:
          avd-name: myavd
          no-window: true
          restore-gradle-cache-prefix: v1a
      # デフォルトで "./gradlew connectedDebugAndroidTest" を実行します
      # "test-command" パラメーターを指定してコマンド実行をカスタマイズします
      - android/run-tests
      - android/save-gradle-cache:
          cache-prefix: v1a
workflows:
  test:
    jobs:
      - test
```


### Orb を使用しない例
{: #no-orb-example }

以下の例では、__circleci/android [Orb](https://circleci.com/developer/ja/orbs/orb/circleci/android) なしで Android マシン イメージを使用しています。 以下のステップは、Orb の [run-ui-tests](https://circleci.com/developer/ja/orbs/orb/circleci/android#jobs-run-ui-tests) ジョブを使用して実行する処理に類似しています。


{% raw %}
```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build:
    machine:
      image: android:202102-01
    # ビルド時間を最適化するために、Android 関連のジョブには "large" 以上をお勧めします
    resource_class: large
    steps:
      - checkout
      - run:
          name: AVD の作成
          command: |
            SYSTEM_IMAGES="system-images;android-29;default;x86"
            sdkmanager "$SYSTEM_IMAGES"
            echo "no" | avdmanager --verbose create avd -n test -k "$SYSTEM_IMAGES"
      - run:
          name: エミュレーター起動
          command: |
            emulator -avd test -delay-adb -verbose -no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim
          background: true
      - run:
          name: キャッシュ キー生成
          command: |
            find . -name 'build.gradle' | sort | xargs cat |
            shasum | awk '{print $1}' > /tmp/gradle_cache_seed
      - restore_cache:
          key: gradle-v1-{{ arch }}-{{ checksum "/tmp/gradle_cache_seed" }}
      - run:
          # ビルド時間を最適化するために、エミュレーターの起動と並列で実行します
          name: assembleDebugAndroidTest タスクの実行
          command: |
            ./gradlew assembleDebugAndroidTest
      - run:
          name: エミュレーターの起動の待機
          command: |
            circle-android wait-for-boot
      - run:
          name: エミュレーター アニメーションの無効化
          command: |
            adb shell settings put global window_animation_scale 0.0
            adb shell settings put global transition_animation_scale 0.0
            adb shell settings put global animator_duration_scale 0.0
      - run:
          name: UI テストの実行 (リトライあり)
          command: |
            MAX_TRIES=2
            run_with_retry() {
               n=1
               until [ $n -gt $MAX_TRIES ]
               do
                  echo "Starting test attempt $n"
                  ./gradlew connectedDebugAndroidTest && break
                  n=$[$n+1]
                  sleep 5
               done
               if [ $n -gt $MAX_TRIES ]; then
                 echo "Max tries reached ($MAX_TRIES)"
                 exit 1
               fi
            }
            run_with_retry 
      - save_cache:
          key: gradle-v1-{{ arch }}-{{ checksum "/tmp/gradle_cache_seed" }}
          paths:
            - ~/.gradle/caches
            - ~/.gradle/wrapper
workflows:
  build:
    jobs:
      - build
```
{% endraw %}

