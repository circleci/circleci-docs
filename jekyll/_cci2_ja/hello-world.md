---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI での最初のプロジェクト"
categories:
  - はじめよう
order: 4
redirect_from: /ja/examples-intro/
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Services VM
---

このページでは、[ユーザー登録]({{ site.baseurl }}/ja/first-steps/)後に CircleCI で Linux、Android、Windows、macOS プロジェクトの基本的なビルドを開始するための方法について解説しています。

## Linux での Hello World
{: #echo-hello-world-on-linux }

この例では、[Node 用のビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/circleci-images/#nodejs)を実行するコンテナをスピンアップする `build` というジョブを追加してから、 `echo` コマンドを実行します。 `echo` コマンドを実行します。 まずは以下の手順を行います。

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

2. 以下の行を含む[`config.yml`]({{ site.baseurl }}/ja/configuration-reference/) ファイルを作成します (CircleCI Server v2.x をご利用の場合は、`version: 2.0`の設定を使用してください)。
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

CircleCI は、各[ジョブ]({{site.baseurl}}/ja/glossary/#job)をそれぞれ独立した[コンテナ]({{site.baseurl}}/ja/glossary/#container)または VM で実行します。 つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピンアップし、そこでジョブを実行します。

サンプルプロジェクトについては、[Node.js の JavaScript チュートリアル]({{site.baseurl}}/ja/language-javascript/)を参照してください。

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

詳細とサンプル プロジェクトについては、[Android 言語ガイド]({{site.baseurl}}/ja/language-android/)を参照してください。

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

詳細とサンプルプロジェクトについては、[macOS での Hello World]({{site.baseurl}}/ja/hello-world-macos) を参照してください。

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

Windows のビルドでは、セットアップと前提条件が多少異なります。 詳しくは、[Windows での Hello World]({{site.baseurl}}/ja/hello-world-windows) を参照してください。
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

- 2.0 設定ファイルの概要、および `.circleci/config.yml` ファイルにおけるトップレベル キーの階層については「[コンセプト]({{ site.baseurl }}/ja/concepts/)」を参照してください。

- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/workflows)」を参照してください。

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/ja/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/circleci-images/)」を参照してください。
