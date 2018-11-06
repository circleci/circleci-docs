---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories:
  - getting-started
order: 4
---
This document describes how to configure your Linux, Android or macOS project to run on CircleCI 2.x after you [sign up]({{ site.baseurl }}/2.0/first-steps/).

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository.

2. Add a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file in the `.circleci` directory with the following lines.

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@.0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

Commit and push the changes to trigger a build. If this is your first project on CircleCI, go to the Projects page, click the **Add Projects** button and then click the **Build Project** button next to your project.

Add a job called `build` that uses the Docker executor to spin up a Node container and runs a simple `echo` command:

1. Add following lines to your `config.yml` file. For Docker executors, replace `node:4.8.2` with any [Docker image]({{ site.baseurl }}/2.0/circleci-images/) you want: 

```yaml
version: 2
jobs:
  build:
    docker: # use the docker executor type; machine and macos executors are also supported
      - image: circleci/node:4.8.2 # the primary container, where your job's commands are run
    steps:
      - checkout # check out the code in the project directory
      - run: echo "hello world" # run the `echo` command
```

**Note**: For `macos` executors, some setup is different. If you want to setup for an iOS project, please check out [the iOS tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) for an example of a simple `macos` config file.

Commit and push the changes to trigger a build. If this is your first project on CircleCI, go to the Projects page, click the **Add Projects** button and then click the **Build Project** button next to your project.

CircleCI checks out your code, prints "Hello World", and posts a green build to the Job page, adding a green checkmark on your commit in GitHub or Bitbucket.

**Note:** If you get a `No Config Found` error, it may be that you used `.yaml` file extension. Be sure to use `.yml` file extension to resolve this error.

## プロジェクトをフォローする

自身がリポジトリにプッシュした新しいプロジェクトは自動的に*フォロー*し、メール通知が有効になると同時にダッシュボードにはそのプロジェクトが表示されるようになります。 CircleCI のプロジェクトページでは、選択した組織の各プロジェクトについて、手動でフォローとアンフォローもできます。**Add Project** を選び、プロジェクト名の横にある **Follow Project** ボタンもしくは **Unfollow Project** ボタンをクリックしてください。

## 「組織」の切り替え方

In the top left, you will find the Org switcher.

![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. もし左上に見えるのがあなたのユーザー名 `myUser` だったとすると、`myUser` に属する GitHub プロジェクトだけが `Add Projects` の下に表示されることになります。 GitHub のプロジェクト名 `myOrg/orgProject` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される SWITCH ORGANIZATION メニューから目的の `myOrg` に切り替えます。

## Next Steps

- CircleCI 2.0 の設定方法や `.circleci/config.yml` ファイルにおける重要度の高い要素についての説明は[コンセプト]({{ site.baseurl }}/2.0/concepts/)ページで確認できます。

- パラレルジョブ、シーケンシャルジョブ、スケジューリングされたジョブ、あるいは承認して処理を続行する Workflow の例については、[Workflow]({{ site.baseurl }}/2.0/workflows) ページを参考にしてください。

- [CircleCI の設定方法]({{ site.baseurl }}/2.0/configuration-reference/)や [CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)のページでは、設定ファイルにおけるキーやビルド済みイメージについて具体的に説明しています。