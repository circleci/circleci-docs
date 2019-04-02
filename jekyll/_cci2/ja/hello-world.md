---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI 2.0 での最初のプロジェクト"
categories:
  - getting-started
order: 4
---
このページでは、[ユーザー登録]({{ site.baseurl }}/2.0/first-steps/)後に CircleCI 2.x で Linux、Android、macOS プロジェクトの基本的なビルドを実行するための方法について解説しています。

## Hello-Build Orb を使う

1. GitHub または Bitbucket のローカルリポジトリのルートディレクトリに `.circleci` ディレクトリを作成します。

2. `.circleci` ディレクトリに以下の内容を含む [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを追加し、[`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) をインポートします。

```yaml
```
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.7 # circleci/buildpack-deps Docker イメージを使います

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
```

変更のコミットやプッシュは、ビルド実行のトリガーになります。 If this is your first project on CircleCI, go to the Projects page, click the **Add Projects** button, then click the **Set Up Project** button next to your project. You may also click **Start Building** to manually trigger your first build.

## Echo Hello World を実行する `build` ジョブ

Docker executor を使い Node コンテナをスピンアップし、シンプルな `echo` コマンドを実行する `build` ジョブを追加します。

1. 以下の内容を `.circleci/config.yml` ファイルに追加します。 Docker executors は、`node:4.8.2` の部分を希望の [Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)に置き換えます。 

```yaml
```
version: 2
jobs:
  build:
    docker: # Executor タイプです。他に machine、macOS という実行タイプを指定できます 
      - image: circleci/node:4.8.2 # プライマリコンテナです。このなかでジョブコマンドが実行されます
    steps:
      - checkout # プロジェクトのディレクトリにあるコードをチェックアウトします
      - run: echo "hello world" # 「echo」コマンドを実行します
```
```

CircleCI runs each [job]({{site.baseurl}}/2.0/glossary/#job) in a separate [container]({{site.baseurl}}/2.0/glossary/#container) or VM. That is, each time your job runs, CircleCI spins up a container or VM to run the job in.

**Note**: For `macos` executors, some setup is different. If you want to setup for an iOS project, please check out the [Hello World macOS]({{site.baseurl}}/2.0/hello-world-macos/) document and the [iOS tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) for examples of a simple `macos` config files.

Commit and push the changes to trigger a build. If this is your first project on CircleCI, go to the Projects page, click the **Add Projects** button, then click the **Set Up Project** button next to your project. You may also click **Start Building** to manually trigger your first build.

CircleCI checks out your code, prints "Hello World", and posts a green build to the Job page, adding a green checkmark on your commit in GitHub or Bitbucket.

**Note:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

## プロジェクトをフォローする

You automatically *follow* any new project that you push to, subscribing you to email notifications and adding the project to your dashboard. You can also manually follow or stop following a project by selecting your org on the Projects page in the CircleCI app, clicking the Add Projects button, and then clicking the button next to the project you want to follow or stop following.

## Org の切り替え

In the top left, you will find the Org switcher.

![Switch Organization Menu]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. For example, if the top left shows your user `my-user`, only GitHub projects belonging to `my-user` will be available under `Add Projects`. If you want to build the GitHub project `your-org/project`, you must select `your-org` on the application Switch Organization menu.

## Next Steps

- See the [Concepts]({{ site.baseurl }}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with parallel, sequential, scheduled, and manual approval workflows.

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.