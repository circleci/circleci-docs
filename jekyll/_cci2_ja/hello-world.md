---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI 2.0 での最初のプロジェクト"
categories:
  - getting-started
order: 4
---

[ユーザー登録]({{ site.baseurl }}/ja/2.0/first-steps/)後、CircleCI 2.x で Linux、Android、Windows、macOS のプロジェクトの基本的なビルドを開始する方法について説明します。

## Linux での Hello World

この例では、[Node 用のビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/#nodejs)を実行するコンテナをスピン アップする `build` というジョブを追加してから、 `echo` コマンドを実行します。 まずは以下の手順を行います。

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

2. 以下の行を含む [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを作成します。

   ```yaml
     version: 2.1
     jobs:
       build:
         docker: 
           - image: circleci/node:4.8.2 # ジョブのコマンドが実行されるプライマリ コンテナ
         steps:
           - checkout # プロジェクト ディレクトリ内のコードをチェック アウトします
           - run: echo "hello world" # `echo` コマンドを実行します
   ```

1. 変更をコミットし、プッシュします。

2. CircleCI アプリケーションの [Projects (プロジェクト)] ページで **[Add Projects (プロジェクトの追加)]** ボタンをクリックし、プロジェクトの横にある **[Set Up Project (プロジェクトのセットアップ)]** ボタンをクリックします。 プロジェクトが表示されない場合は、そのプロジェクトが関連付けられている組織を選択してあるかどうか確認してください。 これに関するヒントは「組織の切り替え」セクションで説明します。

3. **[Start Building (ビルドの開始)]** ボタンをクリックすると、最初のビルドがトリガーされます。

[Workflows (ワークフロー)] ページに `build` ジョブが表示され、コンソールに `Hello World` と出力されます。

**メモ:** `No Config Found` エラーが発生した場合、`.yaml` ファイル拡張子を使用している可能性が考えられます。 このエラーを解決するには、ファイル拡張子として `.yml` を使用してください。

CircleCI は、各[ジョブ]({{site.baseurl}}/2.0/glossary/#job)をそれぞれ独立した[コンテナ]({{site.baseurl}}/2.0/glossary/#container)または VM で実行します。 つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピン アップし、そこでジョブを実行します。

サンプル プロジェクトについては、[Node.js の JavaScript チュートリアル]({{site.baseurl}}/ja/2.0/language-javascript/)を参照してください。

## Android での Hello World

前述の Linux の例と基本的な考え方は同じです。ビルド済みの Android イメージを同じ `config.yml` ファイルで使用して、`docker` executor を使用するジョブを追加します。

```
jobs:
  build-android:
    docker:
      - image: circleci/android:api-25-alpha
```

詳細とサンプル プロジェクトについては、[Android 言語ガイド]({{site.baseurl}}/ja/2.0/language-android/)を参照してください。

## macOS での Hello World

Linux と Android の例と基本的に変わらず、`macos` Executor およびサポートされているバージョンの Xcode を使用するジョブを追加します。

```
jobs:
  build-macos:
    macos:
      xcode: 11.3.0
```

詳細とサンプル プロジェクトについては、「[macOS での Hello World]({{site.baseurl}}/ja/2.0/hello-world-macos)」を参照してください。

## Windows での Hello World

ここにも Linux、Android、macOS の例における基礎を流用できます。同じ `.circleci/config.yml` ファイルに `orb:` キーを追加して、`win/vs2019` Executor (Windows Server 2019) を使用するジョブを追加します。

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

{:.tab.windowsblock.Server}
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

**メモ:** Windows ビルドでは、セットアップと前提条件が多少異なります。 詳しくは「[Windows での Hello World]({{site.baseurl}}/ja/2.0/hello-world-windows)」を参照してください。

### Orbs の使用とオーサリングの詳細

Orbs は、構成を簡略化したりプロジェクト間で再利用したりできる、便利な構成パッケージです。[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs)で参照できます。

## プロジェクトのフォロー

プッシュする新しいプロジェクトを自動的に*フォロー*することで、メール通知が届き、プロジェクトがダッシュボードに追加されます。 また、手動でプロジェクトのフォローを開始または停止できます。それには、CircleCI アプリケーションの [Projects (プロジェクト)] ページで組織を選択し、[Add Projects (プロジェクトの追加)] ボタンをクリックし、フォローを開始または停止するプロジェクトの横にあるボタンをクリックします。

## 組織の切り替え

CircleCI アプリケーションの左上で組織を切り替えられます。


{:.tab.switcher.Cloud}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server}
![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

表示したいプロジェクトが表示されておらず、現在 CircleCI 上でビルドしているものではない場合は、CircleCI アプリケーションの左上隅で組織を確認してください。 たとえば、左上にユーザー `my-user` と表示されているなら、`my-user` に属する GitHub プロジェクトのみが `Add Projects` の下に表示されます。 `your-org/project` の GitHub プロジェクトをビルドするには、CircleCI アプリケーションの [Switch Organization (組織の切り替え)] メニューで `your-org` を選択する必要があります。

## 次のステップ

- 2.0 構成の概要、および `.circleci/config.yml` ファイルにおけるトップ レベル キーの階層については「[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)」を参照してください。

- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」を参照してください。
