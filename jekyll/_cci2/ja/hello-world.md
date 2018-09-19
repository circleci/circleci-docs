---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "First project on CircleCI 2.0"
categories:
  - getting-started
order: 4
---
このページでは、[ユーザー登録]({{ site.baseurl }}/2.0/first-steps/)後に CircleCI 2.0 で Linux、Android、macOS のプロジェクトを実行するための設定方法について解説しています。

1. Create a directory called `.circleci` in the root directory of your local GitHub or Bitbucket code repository.

2. `.circleci` ディレクトリを作成し、そのなかに下記の内容を含む [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) ファイルを作成します。`node:4.8.2` の部分は用途に合わせて任意の [Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)の指定に置き換えます。

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

自身がリポジトリにプッシュした新しいプロジェクトは自動的に*フォロー*し、メール通知が有効になると同時にダッシュボードにはそのプロジェクトが表示されるようになります。 CircleCI のプロジェクトページでは、選択した組織の各プロジェクトについて、手動でフォローとアンフォローもできます。**Add Project** を選び、プロジェクト名の横にある **Follow Project** ボタンもしくは **Unfollow Project** ボタンをクリックしてください。

## Org Switching

In the top left, you will find the Org switcher.

![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

If you do not see your project and it is not currently building on CircleCI, check your org in the top left corner of the CircleCI application. もし左上に見えるのがあなたのユーザー名 `myUser` だったとすると、`myUser` に属する GitHub プロジェクトだけが `Add Projects` の下に表示されることになります。 GitHub のプロジェクト名 `myOrg/orgProject` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される SWITCH ORGANIZATION メニューから目的の `myOrg` に切り替えます。

## Next Steps

- CircleCI 2.0 の設定方法や `.circleci/config.yml` ファイルにおける重要度の高い要素についての説明は[コンセプト]({{ site.baseurl }}/2.0/concepts/)ページで確認できます。

- パラレルジョブ、シーケンシャルジョブ、スケジューリングされたジョブ、あるいは承認して処理を続行する Workflow の例については、[Workflow]({{ site.baseurl }}/2.0/workflows) ページを参考にしてください。

- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.