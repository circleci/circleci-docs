---
layout: classic-docs
title: "Android イメージの Machine Executor での使用"
short-title: "Machine Executor 上の Android イメージ"
description: "Machine Executor での Android イメージの使用"
version:
  - Cloud
  - Server v3.x
---

## 概要
{: #overview }

Android マシンイメージには、CircleCI で Linux マシンイメージにアクセスする場合と同様に、[Linux `machine` Executor]({{site.baseurl}}/ja/configuration-reference/#machine-executor-linux) を通じてアクセスできます。 Android マシンイメージは、ネストされた仮想化と x86 Android エミュレーターをサポートしています。 そのため、Android UI テストに利用できます。 また、イメージには Android SDK がプリインストールされています。

## Android マシンイメージの使用
{: #using-the-android-machine-image }

設定ファイルに Android イメージを使用するには、[Orb]({{site.baseurl}}/orb-intro) を使用して、または、手動で設定することができます。 Android Orb を使用すると設定がシンプルになりますが、複雑なカスタムな設定は手動で行った方が効果的です。 このドキュメントでは、どちらの設定方法についても説明します。 詳細は、後述の「[例](#%E4%BE%8B)」セクションを参照してください。

## プリインストールされたソフトウェア
Android マシン イメージには以下がプリインストールされています。

現在プリインストールされているソフトウェアのリストについては、 [Discuss](https://discuss.circleci.com/t/android-images-2022-january-q1-update/42842) ページで四半期ごとの更新のお知らせを参照してください。

## 料金
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

### CircleCI Server v3.x での Android イメージの使用
{: #using-the-android-image-on-server-v3x }

**注**: Android マシンイメージは、現在は Google Cloud Platform (GCP) 上でのサーバー環境でのみご使用いただけます。

CircleCI Server 3.4 以降では、GCP へのインストールでは Android マシンイメージがサポートされています。 プロジェクトで Android イメージを使用するには、ジョブで `image` キーを `android-default` に設定します。

```yaml
version: 2.1

jobs:
  my-job:
    machine:
      image: android-default
    steps:
    # job steps here
```

クラウドの場合は、上記のように Android Orb を使用することも可能です。 サーバー管理者がまず Orb をインポートする必要があります。 また、Orb にビルドされているデフォルトの Executor を使用するのではなく、下記の例のように Machine Executor の `android-default` イメージを定義する必要があります。 Orb をインポートする方法については、[CircleCI Server v3.x の Orb についてのページ]({{site.baseurl}}/server-3-operator-orbs)を参照してください。

この例では、きめ細かな Orb コマンドを使用して、[start-emulator-and-run-tests](https://circleci.com/developer/ja/orbs/orb/circleci/android#commands-start-emulator-and-run-tests) コマンドの機能を実現する方法を示しています。

```yaml
# .circleci/config.yml
version: 2.1
orbs:
  android: circleci/android@1.0
jobs:
  test:
    machine:
      image: android-default
    steps:
      - checkout
      # Create an AVD named "myavd"
      - android/create-avd:
          avd-name: myavd
          system-image: system-images;android-29;default;x86
          install: true
      # By default, after starting up the emulator, a cache will be restored,
      # "./gradlew assembleDebugAndroidTest" will be run and then a script
      # will be run to wait for the emulator to start up.
      # Specify the "post-emulator-launch-assemble-command" command to override
      # the gradle command run, or set "wait-for-emulator" to false to disable
      # waiting for the emulator altogether.
      - android/start-emulator:
          avd-name: myavd
          no-window: true
          restore-gradle-cache-prefix: v1a
      # Runs "./gradlew connectedDebugAndroidTest" by default.
      # Specify the "test-command" parameter to customize the command run.
      - android/run-tests
      - android/save-gradle-cache:
          cache-prefix: v1a
workflows:
  test:
    jobs:
      - test
```

