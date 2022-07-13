---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI での最初のプロジェクト"
categories:
  - はじめよう
order: 4
redirect_from: /examples-intro/
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

This document describes how to get started with a basic build of your Linux, Android, Windows, or macOS project on CircleCI after you [sign up]({{ site.baseurl }}/first-steps/).

## Linux での Hello World
{: #echo-hello-world-on-linux }

This example adds a job called `build` that spins up a container running a [pre-built CircleCI Docker image for Node]({{ site.baseurl }}/circleci-images/#nodejs). `echo` コマンドを実行します。 まずは以下の手順を行います。

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

2. Create a [`config.yml`]({{ site.baseurl }}/configuration-reference/) file with the following lines (if you are using CircleCI server v2.x, use `version: 2.0` configuration):
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

4. CircleCI アプリの **Project**ページにアクセスし、プロジェクトの隣にある **Set Up Project** ボタンをクリックします。 プロジェクトが表示されない場合は、そのプロジェクトが関連付けられている組織が選択されているかどうかを確認してください。 その方法は、下記の[組織の切り替え](#org-switching)のセクションでご確認ください。

5. ステップに従ってプロジェクトの`config.yml` ファイルを設定し、はじめてのパイプラインをトリガーします。

**Workflow** のページに `build` ジョブが表示され、コンソールに `Hello World` と出力されます。

**ヒント:** `No Config Found` エラーが発生した場合、`.yaml` ファイル拡張子を使用している可能性が考えられます。 このエラーを解決するには、ファイル拡張子として `.yml` を使用してください。

CircleCI runs each [job]({{site.baseurl}}/glossary/#job) in a separate [container]({{site.baseurl}}/glossary/#container) or virtual machine (VM). つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピンアップし、そこでジョブを実行します。

Sample project: [Node.js - JavaScript Tutorial]({{site.baseurl}}/language-javascript/)

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

See the [Android Language Guide]({{site.baseurl}}/language-android/) for details and a sample project.

## macOS での Hello World
{: #hello-world-for-macos }

macOS Executor は、オンプレミス版の CircleCI Server v2.x では現在サポートされていません。
{: class="alert alert-info" }

基本的な内容は上記の Linux のサンプルと同じで、`macos` Executor およびサポートされているバージョンの Xcode を使用するジョブを以下のように追加します。

```yaml
jobs:
  build-macos:
    macos:
      xcode: 12.5.1
```

Refer to the [Hello World on MacOS]({{site.baseurl}}/hello-world-macos) document for more information and a sample project.

## Windows での Hello World
{: #hello-world-for-windows }

基本的な内容は上記の Linux のサンプルと同じで、Windows Executor を使用するジョブを以下のように追加します。 クラウド版では、Orb と`version: 2.1` 設定を使用する必要があります。

{:.tab.windowsblock.Cloud}
```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@4.1.1 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

jobs:
  build: # ジョブの名前
    executor:
      name: win/default # executor type
      size: "medium" # resource class, can be "medium", "large", "xlarge", "2xlarge", defaults to "medium" if not specified

    steps:
      # コマンドは仮想マシン環境で実行されます
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
  build: # ジョブの名前
    machine:
      image: windows-default # Windows マシン イメージ
    resource_class: windows.medium
    steps:
      # Windows 仮想マシン環境で実行するコマンド
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Windows のビルドでは、セットアップと前提条件が多少異なります。 Please refer to our [Hello World on Windows]({{site.baseurl}}/hello-world-windows) page for more information.
{: class="alert alert-info" }

### Orb の使用とオーサリングの詳細
{: #more-about-using-and-authoring-orbs }

Orb は、構成を簡略化したりプロジェクト間で再利用したりできる、便利な構成パッケージです。 [CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)で参照できます。

## プロジェクトのフォロー
{: #following-unfollowing-projects }

プッシュする新しいプロジェクトを自動的に*フォロー*することで、メール通知が届き、プロジェクトがダッシュボードに追加されます。 CircleCI アプリケーションで組織を選択し、手動でプロジェクトをフォローまたはフォローを停止することもできます。 サイドバーで **Projects** をクリックし、フォローを開始または停止するプロジェクトの横にあるボタンをクリックします。

## 組織の切り替え
{: #org-switching }

CirlceCI の画面左上に、組織を切り替えるメニューがあります。


{:.tab.switcher.Cloud}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_3}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server_2}
![組織の切り替えメニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

プロジェクトが表示されなかったり、目的のビルドではないものが表示される場合は、画面左上にある組織名を確認してください。 たとえば、左上にユーザー `my-user` が表示されている場合、`my-user` に所属する GitHub プロジェクトのみが使用可能です。 GitHub プロジェクト `your-org/project` を追加する場合は、組織の切り替えタブから `your-org` を選択する必要があります。

## 次のステップ
{: #next-steps }

- See the [Concepts]({{ site.baseurl }}/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.

- Refer to the [Workflows]({{ site.baseurl }}/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/circleci-images/) documentation, respectively.
