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

The Android machine image is accessed through the [Linux `machine` executor]({{site.baseurl}}/2.0/configuration-reference/#machine-executor-linux), like other Linux machine images on CircleCI. The Android machine image supports nested virtualization and x86 Android emulators, so it can be used for Android UI testing. It also comes with the Android SDK pre-installed.

## Android マシン イメージの使用
{: #using-the-android-machine-image }

It is possible to configure the use of the Android image in your configuration with [orbs]({{site.baseurl}}/2.0/orb-intro) as well as manually. Using the Android orb will simplify your configuration while more complex and custom configurations may benefit from manually configuring your usage. This document will cover both use cases. Please view the [examples](#examples) section below for more details.

## プリインストールされたソフトウェア
{: #pre-installed-software }

The Android machine image comes with the following pre-installed:

### Android SDK
{: #android-sdk }
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

For pricing information, refer to the Linux machine executors under the “Linux VM" section on the [pricing page](https://circleci.com/pricing/).


## 例
{: #examples }

Below you will find several examples demonstrating the use of the Android machine image both with and without orbs.

### Orb を使用するシンプルな例
{: #simple-orb-usage }

The below sample uses the Android orb to run a single job.

```yaml
# .circleci/config.yaml
version: 2.1
orbs:
  android: circleci/android@1.0.3
workflows:
  test:
    jobs:
      # This job uses the Android machine image by default
      - android/run-ui-tests:
          # Use pre-steps and post-steps if necessary
          # to execute custom steps before and afer any of the built-in steps
          system-image: system-images;android-29;default;x86
```


### Orb を使用する複雑な例
{: #more-complex-orb-usage }

This example shows how you can use more granular orb commands to achieve what the [start-emulator-and-run-tests](https://circleci.com/developer/orbs/orb/circleci/android#commands-start-emulator-and-run-tests) command does.

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

The following is an example of using the Android machine image, _without_ using the circleci/android [orb](https://circleci.com/developer/orbs/orb/circleci/android). These steps are similar to what is run when you use the [run-ui-tests](https://circleci.com/developer/orbs/orb/circleci/android#jobs-run-ui-tests) job of the orb.


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
          # run in parallel with the emulator starting up, to optimize build time
          name: Run assembleDebugAndroidTest task
          command: |
            ./gradlew assembleDebugAndroidTest
      - run:
          name: Wait for emulator to start
          command: |
            circle-android wait-for-boot
      - run:
          name: Disable emulator animations
          command: |
            adb shell settings put global window_animation_scale 0.0
            adb shell settings put global transition_animation_scale 0.0
            adb shell settings put global animator_duration_scale 0.0
      - run:
          name: Run UI tests (with retry)
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

