---
layout: classic-docs
title: "Hello World"
short-title: "Hello World"
description: "CircleCI 2.0 での最初のプロジェクト"
categories:
  - getting-started
order: 4
---
このページでは、[ユーザー登録]({{ site.baseurl }}/ja/2.0/first-steps/)後に CircleCI 2.x で Linux、Android、macOS プロジェクトの基本的なビルドを実行するための方法について解説しています。

## Hello-Build Orb を使う

1. GitHub または Bitbucket のローカルリポジトリのルートディレクトリに `.circleci` ディレクトリを作成します。

2. `.circleci` ディレクトリに以下の内容を含む [`config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルを追加し、[`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) をインポートします。

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.7 # circleci/buildpack-deps Docker イメージを使います

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

変更のコミットやプッシュは、ビルド実行のトリガーになります。 CircleCI で初めてプロジェクトを作成する場合は、プロジェクトページにアクセスし、**[Add Project]** ボタンをクリックします。その後プロジェクト名の横にある **[Bulid Project]** ボタンをクリックしてください。

## Echo Hello World を実行する `build` ジョブ

Docker executor を使い Node コンテナをスピンアップし、シンプルな `echo` コマンドを実行する `build` ジョブを追加します。

1. 以下の内容を `.circleci/config.yml` ファイルに追加します。 Docker executors は、`node:4.8.2` の部分を希望の [Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)に置き換えます。

```yaml
version: 2
jobs:
  build:
    docker: # Executor タイプです。他に machine、macOS という実行タイプを指定できます
      - image: circleci/node:4.8.2 # プライマリコンテナです。このなかでジョブコマンドが実行されます
    steps:
      - checkout # プロジェクトのディレクトリにあるコードをチェックアウトします
      - run: echo "hello world" # 「echo」コマンドを実行します
```

**注**： `macOS` executors では、一部の設定が異なります。 iOS のプロジェクトを立ち上げる方法は、[iOS チュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)にアクセスし、`macOS` の設定例を参考にしてください。

変更のコミットやプッシュは、ビルド実行のトリガーになります。 CircleCI で初めてプロジェクトを作成する場合は、プロジェクトページにアクセスし、**[Add Project]** ボタンをクリックします。その後プロジェクト名の横にある **[Bulid Project]** ボタンをクリックしてください。

CircleCI はソースコードを取得 (チェックアウト) して "Hello World" と出力し、ジョブページにビルド成功を意味する緑色のマークが付いた項目を残します。GitHub や Bitbucket のコミットページにも緑色のチェックマークを追加します。

**注：** ファイルの拡張子に `.yaml` を使うと、`No Config Found` エラーが発生します。 ファイルの拡張子で `.yml` を使うことで、このエラーは解消されます。

## プロジェクトをフォローする

自身がリポジトリにプッシュした新しいプロジェクトは自動的に*フォロー*し、メール通知が有効になると同時にダッシュボードにはそのプロジェクトが表示されるようになります。 CircleCI のプロジェクトページでは、選択した Org の各プロジェクトについて、手動でフォローとフォロー解除もできます。[Add Project] を選び、プロジェクト名の横にある [Follow Project] ボタンもしくは [Unfollow Project] ボタンをクリックしてください。

## Org の切り替え

画面左上に、Org を切り替えるメニューがあります。

![SWITCH ORGANIZATION メニュー]({{ site.baseurl }}/assets/img/docs/org-centric-ui.png)

プロジェクトが表示されなかったり、目的のビルドではないものが表示される場合は、画面左上にある Org を確認してください。 もし左上に見えるのがあなたのユーザー名 `my-user` だったとすると、`my-user` に属する GitHub プロジェクトだけが `[Add Projects]` の下に表示されることになります。 GitHub のプロジェクト名 `your-org/project` をビルドしたいということであれば、画面左上のエリアをクリックすると表示される [SWITCH ORGANIZATION] メニューから目的の `your-org` に切り替えます。

## 次のステップは？

- CircleCI 2.0 の設定方法や `.circleci/config.yml` ファイルにおける重要度の高い要素についての説明は[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)ページで確認できます。

- パラレルジョブ、シーケンシャルジョブ、スケジューリングされたジョブ、あるいは承認して処理を続行する Workflows の例については、[Workflows]({{ site.baseurl }}/ja/2.0/workflows) ページを参考にしてください。

- [CircleCI の設定方法]({{ site.baseurl }}/ja/2.0/configuration-reference/)や [CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)のページでは、設定ファイルにおけるキーやビルド済みイメージについて具体的に説明しています。
