---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories:
  - getting-started
order: 4
---
This document describes how to configure your Linux, Android or macOS project to run on CircleCI 2.0 after you [sign up]({{ site.baseurl }}/2.0/first-steps/).

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository.

2. Add a [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file in the `.circleci` directory with the following lines, replacing `node:4.8.2` with any [Docker image]({{ site.baseurl }}/2.0/circleci-images/) you want:

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

Commit and push the changes to trigger a build. If this is your first project on CircleCI, go to the Projects page, click the **Add Projects** button and then click the **Build Project** button next to your project.

CircleCI checks out your code, prints "Hello World", and posts a green build to the Job page, adding a green checkmark on your commit in GitHub or Bitbucket.

## Following Projects

自身がリポジトリにプッシュした新しいプロジェクトは自動的に*フォロー*し、メール通知が有効になると同時にダッシュボードにはそのプロジェクトが表示されるようになります。 CircleCI のプロジェクトページでは、選択した組織の各プロジェクトについて、手動でフォローとアンフォローもできます。**ADD PROJECTS** を選び、プロジェクト名の横にある **Follow project** ボタンもしくは **Unfollow project** ボタンをクリックしてください。

## Org Switching

In the top left, you will find the Org switcher.

![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. もし左上に見えるのがあなたのユーザー名 `myUser` だったとすると、`myUser` に属する GitHub プロジェクトだけが `Add Projects` の下に表示されることになります。 GitHub のプロジェクト名 `myOrg/orgProject` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される SWITCH ORGANIZATION メニューから目的の `myOrg` に切り替えます。

## Next Steps

- CircleCI 2.0 の設定方法や `.circleci/config.yml` ファイルにおける重要度の高い要素について説明している[コンセプト]({{ site.baseurl }}/2.0/concepts/)ページをご覧ください。

- パラレルジョブ、シーケンシャルジョブ、スケジューリングされたジョブ、あるいは Workflow の手動処理の例は [Workflow]({{ site.baseurl }}/2.0/workflows) ページが参考になります。 

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.