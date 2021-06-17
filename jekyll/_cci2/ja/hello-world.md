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

## Echo hello world on Linux
{: #echo-hello-world-on-linux }

This example adds a job called `build` that spins up a container running a [pre-built CircleCI Docker image for Node]({{ site.baseurl }}/2.0/circleci-images/#nodejs). Then, it runs a simple `echo` command. To get started, complete the following steps:

1. GitHub または Bitbucket のローカル コード リポジトリのルートに、`.circleci` というディレクトリを作成します。

1. Create a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file with the following lines (if you are using CircleCI Server, use `version: 2.0` configuration):
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

3. Go to the Projects page in the CircleCI app, click the **Add Projects** button, then click the **Set Up Project** button next to your project. プロジェクトが表示されない場合は、そのプロジェクトが関連付けられている組織を選択してあるかどうか確認してください。 これに関するヒントは「組織の切り替え」セクションで説明します。

1. Click the **Start Building** button to trigger your first build.

The Workflows page appears with your `build` job and prints `Hello World` to the console.

**Note:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or VM. That is, each time your job runs, CircleCI spins up a container or VM to run the job in.

Refer to the [Node.js - JavaScript Tutorial]({{site.baseurl}}/2.0/language-javascript/) for a sample project.

## Hello world for Android
{: #hello-world-for-android }

Using the basic ideas from the Linux example above, you can add a job that uses the `docker` executor with a pre-built Android image in the same `config.yml` file as follows:

```
jobs:
  build-android:
    docker:
      - image: circleci/android:api-25-alpha
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

See the [Android Language Guide]({{site.baseurl}}/2.0/language-android/) for details and a sample project.

## Hello world for macOS
{: #hello-world-for-macos }

_The macOS executor is not currently available on self-hosted installations of CircleCI Server_

Using the basics from the Linux and Android examples above, you can add a job that uses the `macos` executor and a supported version of Xcode as follows:

```
jobs:
  build-macos:
    macos:
      xcode: 11.3.0
```

Refer to the [Hello World on MacOS]({{site.baseurl}}/2.0/hello-world-macos) document for more information and a sample project.

## Hello world for Windows
{: #hello-world-for-windows }

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

### More about using and authoring orbs
{: #more-about-using-and-authoring-orbs }

Orbs are a great way to simplify your config or re-use config across your projects, by referencing packages of config in the [CircleCI Orbs Registry](https://circleci.com/developer/orbs).

## Following / unfollowing projects
{: #following-unfollowing-projects }

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your organization in the CircleCI application (as detailed below), clicking "Projects" in the sidebar, and then clicking the button next to the project you want to follow or stop following.

## Org switching
{: #org-switching }

In the top left, you will find the Org switcher.


{:.tab.switcher.Cloud}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui_newui.png)

{:.tab.switcher.Server}
![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application.  For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`.  If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

## Next steps
{: #next-steps }

- 2.0 構成の概要、および `.circleci/config.yml` ファイルにおけるトップ レベル キーの階層については「[コンセプト]({{ site.baseurl }}/2.0/concepts/)」を参照してください。

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。
