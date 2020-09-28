---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI 2.0 での最初のプロジェクト"
categories:
  - getting-started
order: 4
version:
  - Cloud
  - Server v2.x
---

[ユーザー登録]({{ site.baseurl }}/2.0/first-steps/)後、CircleCI 2.x で Linux、Android、Windows、macOS のプロジェクトの基本的なビルドを開始する方法について説明します。

## Linux での Hello World

この例では、[Node 用のビルド済み CircleCI Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/#nodejs)を実行するコンテナをスピン アップする `build` というジョブを追加してから、 `echo` コマンドを実行します。 まずは以下の手順を行います。

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

2. Create a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file with the following lines (if you are using CircleCI Server, use `version: 2.0` configuration):

   ```yaml
   version: 2.1
   jobs:
     build:
       docker: 
         - image: cimg/node:14.10.1 # the primary container, where your job's commands are run
           auth:
             username: mydockerhub-user
             password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
       steps:
         - checkout # check out the code in the project directory
         - run: echo "hello world" # run the `echo` command
   ```

2. 変更をコミットし、プッシュします。

3. CircleCI アプリケーションの [Projects (プロジェクト)] ページで **[Add Projects (プロジェクトの追加)]** ボタンをクリックし、プロジェクトの横にある **[Set Up Project (プロジェクトのセットアップ)]** ボタンをクリックします。 プロジェクトが表示されない場合は、そのプロジェクトが関連付けられている組織を選択してあるかどうか確認してください。 これに関するヒントは「組織の切り替え」セクションで説明します。

4. **[Start Building (ビルドの開始)]** ボタンをクリックすると、最初のビルドがトリガーされます。

[Workflows (ワークフロー)] ページに `build` ジョブが表示され、コンソールに `Hello World` と出力されます。

**メモ:** `No Config Found` エラーが発生した場合、`.yaml` ファイル拡張子を使用している可能性が考えられます。 このエラーを解決するには、ファイル拡張子として `.yml` を使用してください。

CircleCI は、各[ジョブ]({{site.baseurl}}/2.0/glossary/#ジョブ)をそれぞれ独立した[コンテナ]({{site.baseurl}}/2.0/glossary/#コンテナ)または VM で実行します。 つまり、ジョブが実行されるたびに、CircleCI がコンテナまたは VM をスピン アップし、そこでジョブを実行します。

サンプル プロジェクトについては、[Node.js の JavaScript チュートリアル]({{site.baseurl}}/2.0/language-javascript/)を参照してください。

## Android での Hello World

前述の Linux の例と基本的な考え方は同じです。ビルド済みの Android イメージを同じ `config.yml` ファイルで使用して、`docker` executor を使用するジョブを追加します。

    jobs:
      build-android:
        docker:
          - image: circleci/android:api-25-alpha
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    

詳細とサンプル プロジェクトについては、[Android 言語ガイド]({{site.baseurl}}/2.0/language-android/)を参照してください。

## macOS での Hello World

*The macOS executor is not currently available on self-hosted installations of CircleCI Server*

Using the basics from the Linux and Android examples above, you can add a job that uses the `macos` executor and a supported version of Xcode as follows:

    jobs: 
      build-macos: 
        macos:  
          xcode: 11.3.0
    

Refer to the [Hello World on MacOS]({{site.baseurl}}/2.0/hello-world-macos) document for more information and a sample project.

## Windows での Hello World

Using the basics from the Linux, Android, and macOS examples above, you can add a job that uses the windows executor (Windows Server 2019) as follows. Notice the Cloud version of this requires the use of `version:2.1` config, and orbs:

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

**Note**: For Windows builds, some setup and prerequisites are different. Please refer to our [Hello World on Windows]({{site.baseurl}}/2.0/hello-world-windows).

### Orbs の使用とオーサリングの詳細

Orbs are a great way to simplify your config or re-use config across your projects, by referencing packages of config in the [CircleCI Orbs Registry](https://circleci.com/orbs/registry).

## Following / Unfollowing Projects

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your organization in the CircleCI application (as detailed below), clicking "Projects" in the sidebar, and then clicking the button next to the project you want to follow or stop following.

## 組織の切り替え

In the top left, you will find the Org switcher.


{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`. If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

## 次のステップ

- 2.0 構成の概要、および `.circleci/config.yml` ファイルにおけるトップ レベル キーの階層については「[コンセプト]({{ site.baseurl }}/2.0/concepts/)」を参照してください。

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。