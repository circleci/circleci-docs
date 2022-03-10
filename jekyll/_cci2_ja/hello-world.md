---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI  での最初のプロジェクト"
categories:
  - はじめよう
order: 4
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このページでは、[ユーザー登録]({{ site.baseurl }}/2.0/first-steps/)後に CircleCI で Linux、Android、Windows、macOS プロジェクトの基本的なビルドを開始するための方法について解説しています。

## Linux での Hello World
{: #echo-hello-world-on-linux }

この例では、[Node 用のビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#nodejs)を実行するコンテナをスピンアップする `build` というジョブを追加してから、 `echo` コマンドを実行します。 `echo` コマンドを実行します。 まずは以下の手順を行います。

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

2. Create a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file with the following lines (if you are using CircleCI server v2.x, use `version: 2.0` configuration):
   ```yaml
   version: 2.1
   jobs:
     build:
       docker:
         - image: cimg/node:17.2.0 # ジョブのコマンドが実行されるプライマリ コンテナ
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数を参照します
       steps:
         - checkout # プロジェクト ディレクトリ内のコードをチェックアウトします
         - run: echo "hello world" # `echo` コマンドを実行します
   ```

3. 変更をコミットし、プッシュします。

4. Go to the **Projects** page in the CircleCI app, then click the **Set Up Project** button next to your project. If you do not see your project, make sure you have selected the associated org. See the [Org Switching](#org-switching) section below for tips.

5. Follow the steps to configure your `config.yml` file for the project and trigger your first pipeline.

The **Workflow** page appears with your `build` job and prints `Hello World` to the console.

**Tip:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. このエラーを解決するには、ファイル拡張子として `.yml` を使用してください。

CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or virtual machine (VM). つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピン アップし、そこでジョブを実行します。

Sample project: [Node.js - JavaScript Tutorial]({{site.baseurl}}/2.0/language-javascript/)

## Android での Hello World
{: #hello-world-for-android }

Linux と Android の例と基本的に変わらず、`macos` Executor およびサポートされているバージョンの Xcode を使用するジョブを追加します。

```yaml
jobs:
  build-android:
    docker:
      - image: cimg/android:2021.10.2
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

詳細とサンプル プロジェクトについては、[Android 言語ガイド]({{site.baseurl}}/ja/2.0/language-android/)を参照してください。

## macOS での Hello World
{: #hello-world-for-macos }

The macOS executor is not currently available on installations of CircleCI server v2.x.
{: class="alert alert-info" }

Using the basics from the Linux example above, you can add a job that uses the `macos` executor and a supported version of Xcode as follows:

```yaml
jobs:
  build-macos:
    macos:
      xcode: 12.5.1
```

詳細とサンプル プロジェクトについては、「[macOS での Hello World]({{site.baseurl}}/2.0/hello-world-macos)」を参照してください。

## Windows での Hello World
{: #hello-world-for-windows }

Using the basics from the Linux example above, you can add a job that uses the Windows executor as follows. Notice the cloud version of this requires the use of `version: 2.1` config as well as orbs:

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor:
      name: win/default # executor type
      size: "medium" # resource class, can be "medium", "large", "xlarge", "2xlarge", defaults to "medium" if not specified

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

For Windows builds, some setup and prerequisites are different. Please refer to our [Hello World on Windows]({{site.baseurl}}/2.0/hello-world-windows) page for more information.
{: class="alert alert-info" }

### Orb の使用とオーサリングの詳細
{: #more-about-using-and-authoring-orbs }

Orb は、構成を簡略化したりプロジェクト間で再利用したりできる、便利な構成パッケージです。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)で参照できます。

## プロジェクトのフォロー
{: #following-unfollowing-projects }

プッシュする新しいプロジェクトを自動的に*フォロー*することで、メール通知が届き、プロジェクトがダッシュボードに追加されます。 You can also manually follow or stop following a project by selecting your organization in the CircleCI application (as detailed below), clicking **Projects** in the sidebar, and then clicking the button next to the project you want to follow or stop following.

## 組織の切り替え
{: #org-switching }

CirlceCI の画面左上に、組織を切り替えるメニューがあります。


{:.tab.switcher.Cloud}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_3}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

保留中のジョブの名前（上記のスクリーンショットでは`build`）をクリックすると、保留中のジョブの承認またはキャンセルを求める承認ダイアログボックスが表示されます。
![組織の切り替えメニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

プロジェクトが表示されなかったり、目的のビルドではないものが表示される場合は、画面左上にある組織名を確認してください。 For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available. If you want to add the GitHub project `your-org/project`, you must select `your-org` from the org switcher.

## 次のステップ
{: #next-steps }

- 2.0 構成の概要、および `.circleci/config.yml` ファイルにおけるトップ レベル キーの階層については「[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)」を参照してください。

- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」を参照してください。